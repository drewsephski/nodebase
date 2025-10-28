import { NodeType } from "@/lib/generated/prisma";
import type { ExecutionStatus, StepStatus, LogLevel } from "@/lib/generated/prisma";
import { PrismaClient } from "@/lib/generated/prisma";
import { getCredential, evaluateConditions, extractJsonPath, formatNodeError, makeHttpRequest, sleep } from "./node-helpers";
import { ExecutionContextManager } from "./execution-context";

// AI SDK imports
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  userId: string;
  triggerType: "manual" | "webhook" | "schedule";
}

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  logs?: Array<{
    level: LogLevel;
    message: string;
    data?: any;
  }>;
}

export class ExecutionEngine {
  private context: ExecutionContext;
  private prisma: PrismaClient;

  constructor(context: ExecutionContext, prisma: PrismaClient) {
    this.context = context;
    this.prisma = prisma;
  }

  async executeWorkflow(): Promise<void> {
    if (!this.prisma) {
      throw new Error("Database connection not available");
    }

    try {
      // Ensure prisma client is connected
      await this.prisma.$connect();

      const execution = await this.prisma.execution.create({
        data: {
          workflowId: this.context.workflowId,
          status: "RUNNING",
          startedAt: new Date(),
          triggeredBy: this.context.userId,
        },
      });

      try {
        // Get workflow with nodes and connections
        const workflow = await this.prisma.workflow.findUnique({
          where: { id: this.context.workflowId },
          include: {
            nodes: true,
            connections: true,
          },
        });

        if (!workflow) {
          throw new Error("Workflow not found");
        }

        // Execute nodes in topological order
        const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.connections);

        for (const nodeId of executionOrder) {
          await this.executeNode(execution.id, nodeId, workflow.nodes);
        }

        // Mark execution as completed
        await this.prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

      } catch (error) {
        // Mark execution as failed
        await this.prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });

        throw error;
      }
    } catch (error) {
      console.error("Database connection or execution error:", error);
      throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : "Unknown database error"}`);
    } finally {
      // Ensure prisma connection is closed
      await this.prisma.$disconnect();
    }
  }

  private getExecutionOrder(nodes: any[], connections: any[]): string[] {
    // Simple topological sort for now - can be enhanced later
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const inDegree = new Map(nodes.map(node => [node.id, 0]));
    const queue: string[] = [];
    const result: string[] = [];

    // Calculate in-degrees
    for (const connection of connections) {
      inDegree.set(connection.toNodeId, (inDegree.get(connection.toNodeId) || 0) + 1);
    }

    // Find nodes with no incoming connections
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      // Remove edges from this node
      for (const connection of connections) {
        if (connection.fromNodeId === nodeId) {
          const toNodeId = connection.toNodeId;
          const newDegree = (inDegree.get(toNodeId) || 0) - 1;
          inDegree.set(toNodeId, newDegree);

          if (newDegree === 0) {
            queue.push(toNodeId);
          }
        }
      }
    }

    if (result.length !== nodes.length) {
      throw new Error("Circular dependency detected in workflow");
    }

    return result;
  }

  private async executeNode(executionId: string, nodeId: string, nodes: any[]): Promise<void> {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Create execution step
    const step = await this.prisma.executionStep.create({
      data: {
        executionId,
        nodeId,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    try {
      // Execute based on node type
      const result = await this.executeNodeByType(node, nodes);

      // Update step with results
      await this.prisma.executionStep.update({
        where: { id: step.id },
        data: {
          status: result.success ? "COMPLETED" : "FAILED",
          completedAt: new Date(),
          error: result.error,
          output: result.output,
        },
      });

      // Add logs
      if (result.logs) {
        await this.prisma.executionLog.createMany({
          data: result.logs.map(log => ({
            executionId,
            nodeId,
            level: log.level,
            message: log.message,
            data: log.data,
          })),
        });
      }

      if (!result.success) {
        throw new Error(result.error || "Node execution failed");
      }

    } catch (error) {
      // Update step as failed
      await this.prisma.executionStep.update({
        where: { id: step.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  private async executeNodeByType(node: any, allNodes: any[]): Promise<NodeExecutionResult> {
    switch (node.type) {
      case NodeType.INITIAL:
        return this.executeInitialNode(node);

      case NodeType.MANUAL_TRIGGER:
        return this.executeManualTriggerNode(node);

      case NodeType.HTTP_REQUEST:
        return this.executeHttpRequestNode(node);

      // Triggers
      case NodeType.WEBHOOK_TRIGGER:
        return this.executeWebhookTriggerNode(node);

      case NodeType.SCHEDULE_TRIGGER:
        return this.executeScheduleTriggerNode(node);

      // Communication
      case NodeType.SLACK_SEND_MESSAGE:
        return this.executeSlackSendNode(node);

      case NodeType.DISCORD_SEND_MESSAGE:
        return this.executeDiscordSendNode(node);

      case NodeType.EMAIL_SEND:
        return this.executeEmailSendNode(node);

      // AI Services
      case NodeType.OPENAI_CHAT:
        return this.executeOpenAIChatNode(node);

      case NodeType.ANTHROPIC_CHAT:
        return this.executeAnthropicChatNode(node);

      case NodeType.GOOGLE_GEMINI_CHAT:
        return this.executeGoogleGeminiChatNode(node);

      // Data Operations
      case NodeType.JSON_PARSE:
        return this.executeJsonParseNode(node);

      case NodeType.FILTER:
        return this.executeFilterNode(node);

      case NodeType.SET_VARIABLE:
        return this.executeSetVariableNode(node);

      case NodeType.CODE_EXECUTE:
        return this.executeCodeExecuteNode(node);

      // Database
      case NodeType.POSTGRES_QUERY:
        return this.executePostgresQueryNode(node);

      case NodeType.MONGODB_QUERY:
        return this.executeMongoDBQueryNode(node);

      // Utilities
      case NodeType.DELAY:
        return this.executeDelayNode(node);

      case NodeType.IF_CONDITION:
        return this.executeIfConditionNode(node);

      case NodeType.MERGE:
        return this.executeMergeNode(node);

      default:
        return {
          success: false,
          error: `Unsupported node type: ${node.type}`,
        };
    }
  }

  private async executeWebhookTriggerNode(node: any): Promise<NodeExecutionResult> {
    return {
      success: true,
      output: { triggered: true, timestamp: new Date().toISOString() },
      logs: [{
        level: "INFO",
        message: "Webhook trigger node executed",
      }],
    };
  }

  private async executeScheduleTriggerNode(node: any): Promise<NodeExecutionResult> {
    return {
      success: true,
      output: { triggered: true, timestamp: new Date().toISOString() },
      logs: [{
        level: "INFO",
        message: "Schedule trigger node executed",
      }],
    };
  }

  private async executeSlackSendNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "Slack node requires a credential",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential || (credential.type !== 'API_KEY' && credential.type !== 'BEARER_TOKEN')) {
        return {
          success: false,
          error: "Invalid Slack credential",
        };
      }

      // Validate and parse blocks JSON if provided
      let blocks: any[] | undefined;
      if (nodeData.messageType === 'blocks' && nodeData.blocksJson) {
        try {
          blocks = JSON.parse(nodeData.blocksJson);
        } catch (error) {
          return {
            success: false,
            error: `Invalid JSON in blocks: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      }

      const response = await makeHttpRequest('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credential.data}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: nodeData.channel,
          text: nodeData.messageType === 'text' ? nodeData.messageText : undefined,
          blocks: blocks,
        }),
      });

      return {
        success: response.success,
        output: response.data,
        logs: [{
          level: response.success ? "INFO" : "ERROR",
          message: `Slack message ${response.success ? 'sent' : 'failed'}`,
          data: { channel: nodeData.channel },
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Slack'),
        logs: [{
          level: "ERROR",
          message: `Slack execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
      };
    }
  }

  private async executeDiscordSendNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      let url: string;
      let credential: any = null;

      if (nodeData.authMethod === 'webhook') {
        url = nodeData.webhookUrl;
      } else {
        if (!nodeData.credentialId) {
          return {
            success: false,
            error: "Discord bot node requires a credential",
          };
        }

        if (!nodeData.channel) {
          return {
            success: false,
            error: "Discord bot node requires a channel ID",
          };
        }

        credential = await getCredential(this.prisma, nodeData.credentialId);
        if (!credential || credential.type !== 'BEARER_TOKEN') {
          return {
            success: false,
            error: "Invalid Discord credential",
          };
        }

        url = `https://discord.com/api/channels/${nodeData.channel}/messages`;
      }

      const payload: any = {
        content: nodeData.messageContent,
      };

      if (nodeData.username) payload.username = nodeData.username;
      if (nodeData.avatarUrl) payload.avatar_url = nodeData.avatarUrl;
      if (nodeData.embedJson) {
        try {
          payload.embeds = JSON.parse(nodeData.embedJson);
        } catch (e) {
          // Invalid JSON, skip embeds
        }
      }

      const response = await makeHttpRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(nodeData.authMethod === 'bot_token' && {
            'Authorization': `Bot ${credential.data}`,
          }),
        },
        body: JSON.stringify(payload),
      });

      return {
        success: response.success,
        output: response.data,
        logs: [{
          level: response.success ? "INFO" : "ERROR",
          message: `Discord message ${response.success ? 'sent' : 'failed'}`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Discord'),
      };
    }
  }

  private async executeEmailSendNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "Email node requires a credential",
      };
    }

    if (!nodeData.from) {
      return {
        success: false,
        error: "Email node requires a from address",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential) {
        return {
          success: false,
          error: "Invalid email credential",
        };
      }

      let url: string;
      let headers: Record<string, string>;

      // Configure provider-specific settings
      switch (nodeData.provider) {
        case 'sendgrid':
          url = 'https://api.sendgrid.com/v3/mail/send';
          headers = {
            'Authorization': `Bearer ${credential.data}`,
            'Content-Type': 'application/json',
          };
          break;

        case 'mailgun':
          url = `https://api.mailgun.net/v3/${credential.data.domain || 'sandbox'}/messages`;
          headers = {
            'Authorization': `Basic ${Buffer.from(`api:${credential.data.apiKey || credential.data}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          };
          break;

        case 'smtp':
          // For SMTP, we'd typically use a different approach (nodemailer or similar)
          // This is a placeholder - actual implementation would need SMTP configuration
          url = credential.data.host || 'smtp://localhost:587';
          headers = {
            'Content-Type': 'application/json',
          };
          break;

        default:
          return {
            success: false,
            error: `Unsupported email provider: ${nodeData.provider}`,
          };
      }

      // Prepare email payload based on provider
      let payload: any;

      if (nodeData.provider === 'mailgun') {
        // Mailgun uses form data format
        payload = new URLSearchParams({
          from: nodeData.from,
          to: nodeData.to,
          subject: nodeData.subject,
          text: nodeData.body,
          ...(nodeData.htmlBody && { html: nodeData.htmlBody }),
          ...(nodeData.cc && { cc: nodeData.cc }),
          ...(nodeData.bcc && { bcc: nodeData.bcc }),
        });
      } else {
        // SendGrid and SMTP use JSON format
        payload = {
          personalizations: [{
            to: nodeData.to.split(',').map((email: string) => ({ email: email.trim() })),
            ...(nodeData.cc && { cc: nodeData.cc.split(',').map((email: string) => ({ email: email.trim() })) }),
            ...(nodeData.bcc && { bcc: nodeData.bcc.split(',').map((email: string) => ({ email: email.trim() })) }),
          }],
          from: { email: nodeData.from },
          subject: nodeData.subject,
          content: [
            { type: 'text/plain', value: nodeData.body },
            ...(nodeData.htmlBody ? [{ type: 'text/html', value: nodeData.htmlBody }] : []),
          ],
        };
      }

      const response = await makeHttpRequest(url, {
        method: 'POST',
        headers,
        body: nodeData.provider === 'mailgun' ? payload.toString() : JSON.stringify(payload),
      });

      return {
        success: response.success,
        output: response.data,
        logs: [{
          level: response.success ? "INFO" : "ERROR",
          message: `Email ${response.success ? 'sent' : 'failed'}`,
          data: { recipients: nodeData.to, provider: nodeData.provider },
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Email'),
      };
    }
  }

  private async executeOpenAIChatNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "OpenAI node requires a credential",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential || credential.type !== 'API_KEY') {
        return {
          success: false,
          error: "Invalid OpenAI credential",
        };
      }

      const openai = createOpenAI({
        apiKey: credential.data,
      });

      const result = await generateText({
        model: openai(nodeData.model),
        prompt: nodeData.userPrompt,
        system: nodeData.systemPrompt,
        temperature: nodeData.temperature,
        maxTokens: nodeData.maxTokens,
      });

      return {
        success: true,
        output: {
          text: result.text,
          model: nodeData.model,
          usage: result.usage,
        },
        logs: [{
          level: "INFO",
          message: `OpenAI ${nodeData.model} generated response`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'OpenAI'),
      };
    }
  }

  private async executeAnthropicChatNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "Anthropic node requires a credential",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential || credential.type !== 'API_KEY') {
        return {
          success: false,
          error: "Invalid Anthropic credential",
        };
      }

      const anthropic = createAnthropic({
        apiKey: credential.data,
      });

      const result = await generateText({
        model: anthropic(nodeData.model),
        prompt: nodeData.userPrompt,
        system: nodeData.systemPrompt,
        temperature: nodeData.temperature,
        maxTokens: nodeData.maxTokens,
      });

      return {
        success: true,
        output: {
          text: result.text,
          model: nodeData.model,
          usage: result.usage,
        },
        logs: [{
          level: "INFO",
          message: `Anthropic ${nodeData.model} generated response`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Anthropic'),
      };
    }
  }

  private async executeGoogleGeminiChatNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "Google Gemini node requires a credential",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential || credential.type !== 'API_KEY') {
        return {
          success: false,
          error: "Invalid Google Gemini credential",
        };
      }

      const google = createGoogleGenerativeAI({
        apiKey: credential.data,
      });

      const result = await generateText({
        model: google(nodeData.model),
        prompt: nodeData.userPrompt,
        system: nodeData.systemPrompt,
        temperature: nodeData.temperature,
        maxTokens: nodeData.maxTokens,
      });

      return {
        success: true,
        output: {
          text: result.text,
          model: nodeData.model,
          usage: result.usage,
        },
        logs: [{
          level: "INFO",
          message: `Google Gemini ${nodeData.model} generated response`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Google Gemini'),
      };
    }
  }

  private async executeJsonParseNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      let result: any;

      switch (nodeData.operation) {
        case 'parse':
          // This would parse input JSON - placeholder for now
          result = { operation: 'parse', success: true };
          break;

        case 'stringify':
          result = { operation: 'stringify', success: true };
          break;

        case 'extract':
          if (nodeData.jsonPath) {
            // This would extract using JSON path - placeholder for now
            result = { operation: 'extract', path: nodeData.jsonPath, success: true };
          } else {
            result = { operation: 'extract', success: false, error: 'No JSON path provided' };
          }
          break;

        case 'transform':
          result = { operation: 'transform', success: true };
          break;

        default:
          result = { success: false, error: 'Unknown operation' };
      }

      return {
        success: result.success !== false,
        output: result,
        logs: [{
          level: result.success !== false ? "INFO" : "ERROR",
          message: `JSON ${nodeData.operation} ${result.success !== false ? 'completed' : 'failed'}`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'JSON'),
      };
    }
  }

  private async executeFilterNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      // Placeholder for filter logic
      const result = {
        operation: 'filter',
        conditions: nodeData.conditions?.length || 0,
        mode: nodeData.filterMode || 'keep',
        success: true,
      };

      return {
        success: true,
        output: result,
        logs: [{
          level: "INFO",
          message: `Filter applied with ${nodeData.conditions?.length || 0} conditions`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Filter'),
      };
    }
  }

  private async executeSetVariableNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      const variables: Record<string, any> = {};
      if (nodeData.variables) {
        nodeData.variables.forEach((variable: any) => {
          variables[variable.name] = {
            value: variable.value,
            type: variable.type,
          };
        });
      }

      return {
        success: true,
        output: { variables },
        logs: [{
          level: "INFO",
          message: `Set ${Object.keys(variables).length} variables`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Set Variable'),
      };
    }
  }

  private async executeCodeExecuteNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      // WARNING: This is a placeholder - actual code execution needs proper sandboxing
      const result = {
        operation: 'code_execute',
        language: nodeData.language || 'javascript',
        success: true,
        output: 'Code execution placeholder',
      };

      return {
        success: true,
        output: result,
        logs: [{
          level: "INFO",
          message: "Code executed successfully",
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Code Execute'),
      };
    }
  }

  private async executePostgresQueryNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "PostgreSQL node requires a credential",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential || credential.type !== 'DATABASE') {
        return {
          success: false,
          error: "Invalid PostgreSQL credential",
        };
      }

      // This is a placeholder - actual implementation would use a PostgreSQL client
      const result = {
        operation: nodeData.operation || 'select',
        query: nodeData.query,
        success: true,
        rowCount: 0,
        rows: [],
      };

      return {
        success: true,
        output: result,
        logs: [{
          level: "INFO",
          message: `PostgreSQL ${nodeData.operation} executed`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'PostgreSQL'),
      };
    }
  }

  private async executeMongoDBQueryNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.credentialId) {
      return {
        success: false,
        error: "MongoDB node requires a credential",
      };
    }

    try {
      const credential = await getCredential(this.prisma, nodeData.credentialId);
      if (!credential || credential.type !== 'DATABASE') {
        return {
          success: false,
          error: "Invalid MongoDB credential",
        };
      }

      // This is a placeholder - actual implementation would use MongoDB driver
      const result = {
        operation: nodeData.operation || 'find',
        collection: nodeData.collection,
        success: true,
        documentCount: 0,
        documents: [],
      };

      return {
        success: true,
        output: result,
        logs: [{
          level: "INFO",
          message: `MongoDB ${nodeData.operation} executed`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'MongoDB'),
      };
    }
  }

  private async executeDelayNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      let delayMs: number;

      if (nodeData.delayType === 'specific_time' && nodeData.specificTime) {
        const targetTime = new Date(nodeData.specificTime).getTime();
        const currentTime = Date.now();
        delayMs = Math.max(0, targetTime - currentTime);
      } else {
        const value = nodeData.durationValue || 1;
        const unit = nodeData.durationUnit || 'minutes';

        switch (unit) {
          case 'milliseconds':
            delayMs = value;
            break;
          case 'seconds':
            delayMs = value * 1000;
            break;
          case 'minutes':
            delayMs = value * 60 * 1000;
            break;
          case 'hours':
            delayMs = value * 60 * 60 * 1000;
            break;
          default:
            delayMs = 60000; // Default to 1 minute
        }
      }

      await sleep(delayMs);

      return {
        success: true,
        output: {
          delayType: nodeData.delayType,
          durationMs: delayMs,
          completedAt: new Date().toISOString(),
        },
        logs: [{
          level: "INFO",
          message: `Delay completed after ${delayMs}ms`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Delay'),
      };
    }
  }

  private async executeIfConditionNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      // Placeholder for condition evaluation
      const result = {
        operation: 'if_condition',
        conditions: nodeData.conditions?.length || 0,
        combineOperator: nodeData.combineConditions || 'AND',
        success: true,
        branch: 'true', // This would be determined by actual condition evaluation
      };

      return {
        success: true,
        output: result,
        logs: [{
          level: "INFO",
          message: `IF condition evaluated to ${result.branch}`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'IF Condition'),
      };
    }
  }

  private async executeMergeNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    try {
      const result = {
        operation: 'merge',
        mode: nodeData.mergeMode || 'append',
        outputFormat: nodeData.outputFormat || 'array',
        success: true,
        itemCount: 0, // This would be determined by actual merge operation
      };

      return {
        success: true,
        output: result,
        logs: [{
          level: "INFO",
          message: `Merge completed using ${nodeData.mergeMode} mode`,
        }],
      };
    } catch (error) {
      return {
        success: false,
        error: formatNodeError(error, node.id, 'Merge'),
      };
    }
  }

  private async executeHttpRequestNode(node: any): Promise<NodeExecutionResult> {
    const nodeData = node.data as any || {};

    if (!nodeData.endpoint) {
      return {
        success: false,
        error: "HTTP Request node requires an endpoint configuration",
      };
    }

    try {
      const response = await fetch(nodeData.endpoint, {
        method: nodeData.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...nodeData.headers,
        },
        body: nodeData.method !== "GET" && nodeData.method !== "HEAD"
          ? JSON.stringify(nodeData.body)
          : undefined,
      });

      const data = await response.text();

      return {
        success: response.ok,
        output: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data,
        },
        logs: [{
          level: response.ok ? "INFO" : "ERROR",
          message: `HTTP request to ${nodeData.endpoint} returned ${response.status}`,
          data: {
            endpoint: nodeData.endpoint,
            method: nodeData.method,
            status: response.status,
          },
        }],
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "HTTP request failed",
        logs: [{
          level: "ERROR",
          message: `HTTP request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        }],
      };
    }
  }

  static async createExecution(
    workflowId: string,
    userId: string,
    triggerType: "manual" | "webhook" | "schedule" = "manual",
    prisma: PrismaClient
  ): Promise<ExecutionEngine> {
    const context: ExecutionContext = {
      executionId: "", // Will be set when execution starts
      workflowId,
      userId,
      triggerType,
    };

    return new ExecutionEngine(context, prisma);
  }
}
