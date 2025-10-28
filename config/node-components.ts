import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/lib/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";

// Triggers
import { WebhookTriggerNode } from "@/features/triggers/components/webhook-trigger/node";
import { ScheduleTriggerNode } from "@/features/triggers/components/schedule-trigger/node";

// Communication
import { SlackSendNode } from "@/features/communication/components/slack-send/node";
import { DiscordSendNode } from "@/features/communication/components/discord-send/node";
import { EmailSendNode } from "@/features/communication/components/email-send/node";

// AI Services
import { OpenAIChatNode } from "@/features/ai/components/openai-chat/node";
import { AnthropicChatNode } from "@/features/ai/components/anthropic-chat/node";
import { GoogleGeminiChatNode } from "@/features/ai/components/google-gemini-chat/node";

// Data Operations
import { JsonParseNode } from "@/features/data-operations/components/json-parse/node";
import { FilterNode } from "@/features/data-operations/components/filter/node";
import { SetVariableNode } from "@/features/data-operations/components/set-variable/node";
import { CodeExecuteNode } from "@/features/data-operations/components/code-execute/node";

// Database
import { PostgresQueryNode } from "@/features/database/components/postgres-query/node";
import { MongoDBQueryNode } from "@/features/database/components/mongodb-query/node";

// Utilities
import { DelayNode } from "@/features/utilities/components/delay/node";
import { IfConditionNode } from "@/features/utilities/components/if-condition/node";
import { MergeNode } from "@/features/utilities/components/merge/node";

export const nodeComponents = {
  // Core nodes
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,

  // Triggers
  [NodeType.WEBHOOK_TRIGGER]: WebhookTriggerNode,
  [NodeType.SCHEDULE_TRIGGER]: ScheduleTriggerNode,

  // Communication
  [NodeType.SLACK_SEND_MESSAGE]: SlackSendNode,
  [NodeType.DISCORD_SEND_MESSAGE]: DiscordSendNode,
  [NodeType.EMAIL_SEND]: EmailSendNode,

  // AI Services
  [NodeType.OPENAI_CHAT]: OpenAIChatNode,
  [NodeType.ANTHROPIC_CHAT]: AnthropicChatNode,
  [NodeType.GOOGLE_GEMINI_CHAT]: GoogleGeminiChatNode,

  // Data Operations
  [NodeType.JSON_PARSE]: JsonParseNode,
  [NodeType.FILTER]: FilterNode,
  [NodeType.SET_VARIABLE]: SetVariableNode,
  [NodeType.CODE_EXECUTE]: CodeExecuteNode,

  // Database
  [NodeType.POSTGRES_QUERY]: PostgresQueryNode,
  [NodeType.MONGODB_QUERY]: MongoDBQueryNode,

  // Utilities
  [NodeType.DELAY]: DelayNode,
  [NodeType.IF_CONDITION]: IfConditionNode,
  [NodeType.MERGE]: MergeNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

