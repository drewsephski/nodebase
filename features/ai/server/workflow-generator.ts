import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NodeType } from "@/lib/generated/prisma";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Zod schema for workflow generation output
const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NodeType),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()).optional().default({}),
});

const WorkflowEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

const GeneratedWorkflowSchema = z.object({
  name: z.string(),
  description: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});

export const workflowGeneratorRouter = createTRPCRouter({
  generateWorkflow: baseProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional().default([]),
      })
    )
    .mutation(async ({ input }) => {
      const { prompt, conversationHistory } = input;

      // Simple rate limiting by IP (in production, use proper rate limiting)
      const identifier = 'anonymous'; // In production, get from headers
      if (!checkRateLimit(identifier)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('Google AI API key not configured');
      }

      try {
        const google = createGoogleGenerativeAI({
          apiKey,
        });

        // Build conversation context
        const messages = [
          {
            role: 'system' as const,
            content: `You are an expert workflow automation assistant. Generate complete, executable workflows based on user descriptions.

Available Node Types and Their Purposes:

TRIGGERS (Always start workflows with one of these):
- MANUAL_TRIGGER: Manual execution trigger
- WEBHOOK_TRIGGER: HTTP webhook trigger for external events
- SCHEDULE_TRIGGER: Time-based trigger for recurring tasks

COMMUNICATION:
- SLACK_SEND_MESSAGE: Send messages to Slack channels
- DISCORD_SEND_MESSAGE: Send messages to Discord channels
- EMAIL_SEND: Send emails via SMTP providers
- TELEGRAM_SEND_MESSAGE: Send messages to Telegram

AI SERVICES:
- OPENAI_CHAT: Generate text using OpenAI models
- ANTHROPIC_CHAT: Generate text using Anthropic models
- GOOGLE_GEMINI_CHAT: Generate text using Google Gemini

DATA PROCESSING:
- HTTP_REQUEST: Make HTTP requests to APIs
- JSON_PARSE: Parse and transform JSON data
- FILTER: Filter data based on conditions
- SET_VARIABLE: Store and manipulate variables
- CODE_EXECUTE: Run custom JavaScript code
- IF_CONDITION: Conditional branching
- MERGE: Combine multiple data streams

DATABASE:
- POSTGRES_QUERY: Execute PostgreSQL queries
- MONGODB_QUERY: Execute MongoDB queries

UTILITIES:
- DELAY: Add time delays between steps

WORKFLOW DESIGN BEST PRACTICES:
1. Always start with exactly one trigger node
2. Position nodes logically from left to right, top to bottom
3. Use meaningful node names and descriptions
4. Connect nodes in a logical flow
5. Include error handling where appropriate
6. Keep workflows focused on a single purpose

Position nodes with reasonable spacing (200px horizontal, 100px vertical between nodes).

Return a valid JSON object with this exact structure:
{
  "name": "Workflow Name",
  "description": "Brief description of what the workflow does",
  "nodes": [
    {
      "id": "unique-node-id",
      "type": "NODE_TYPE",
      "position": {"x": 100, "y": 100},
      "data": {"key": "value"}
    }
  ],
  "edges": [
    {
      "source": "source-node-id",
      "target": "target-node-id",
      "sourceHandle": "main",
      "targetHandle": "main"
    }
  ]
}`
          },
          ...conversationHistory.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user' as const,
            content: prompt,
          },
        ];

        const result = await generateText({
          model: google('gemini-1.5-flash'),
          messages,
          temperature: 0.7,
          maxTokens: 4000,
        });

        // Parse and validate the response
        const workflowText = result.text.trim();
        
        // Try to extract JSON from the response
        let jsonMatch = workflowText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }

        const workflowData = JSON.parse(jsonMatch[0]);
        const validatedWorkflow = GeneratedWorkflowSchema.parse(workflowData);

        // Log the generation for monitoring
        console.log(`Workflow generated: ${validatedWorkflow.name} with ${validatedWorkflow.nodes.length} nodes`);

        return validatedWorkflow;
      } catch (error) {
        console.error('Workflow generation error:', error);
        throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
});