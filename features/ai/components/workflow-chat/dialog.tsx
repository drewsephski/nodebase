"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NodeType } from "@/lib/generated/prisma";
import { SparkleIcon, SendIcon, AlertCircleIcon } from "lucide-react";

const workflowSchema = z.object({
  name: z.string(),
  description: z.string(),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "INITIAL",
        "MANUAL_TRIGGER",
        "HTTP_REQUEST",
        "WEBHOOK_TRIGGER",
        "SCHEDULE_TRIGGER",
        "SLACK_SEND_MESSAGE",
        "DISCORD_SEND_MESSAGE",
        "EMAIL_SEND",
        "OPENAI_CHAT",
        "ANTHROPIC_CHAT",
        "GOOGLE_GEMINI_CHAT",
        "JSON_PARSE",
        "FILTER",
        "SET_VARIABLE",
        "CODE_EXECUTE",
        "POSTGRES_QUERY",
        "MONGODB_QUERY",
        "DELAY",
        "IF_CONDITION",
        "MERGE",
      ]),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.record(z.any()),
    })
  ),
  edges: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
    })
  ),
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkflowGenerated: (workflow: z.infer<typeof workflowSchema>) => void;
}

export const WorkflowChatDialog = ({
  open,
  onOpenChange,
  onWorkflowGenerated,
}: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<z.infer<typeof workflowSchema> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const google = createGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!,
  });

  const systemPrompt = `You are a workflow automation expert. Generate valid workflow configurations based on user descriptions. Use available node types: MANUAL_TRIGGER, HTTP_REQUEST, SLACK_SEND_MESSAGE, DISCORD_SEND_MESSAGE, EMAIL_SEND, OPENAI_CHAT, ANTHROPIC_CHAT, GOOGLE_GEMINI_CHAT, JSON_PARSE, FILTER, SET_VARIABLE, CODE_EXECUTE, POSTGRES_QUERY, MONGODB_QUERY, DELAY, IF_CONDITION, MERGE, WEBHOOK_TRIGGER, SCHEDULE_TRIGGER.

Respond with a JSON object containing:
- name: string (workflow name)
- description: string (brief description)
- nodes: array of objects with id, type, position {x, y}, data (object)
- edges: array of objects with source, target, sourceHandle, targetHandle

Position nodes logically from left to right, top to bottom. Always start with a trigger node.`;

  const examplePrompts = [
    "Send daily email report",
    "Monitor website uptime",
    "Process form submissions",
  ];

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    setError(null);
    setGeneratedWorkflow(null);

    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash-exp"),
        system: systemPrompt,
        prompt: content,
        experimental_output: workflowSchema,
      });

      const parsedWorkflow = workflowSchema.parse(JSON.parse(text));
      setGeneratedWorkflow(parsedWorkflow);

      const assistantMessage: Message = {
        role: "assistant",
        content: `I've generated a workflow: "${parsedWorkflow.name}". Click "Create Workflow" to add it to your workspace.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error generating workflow:", err);
      setError("Failed to generate workflow. Please try again.");
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't generate a workflow from that description. Please try rephrasing or provide more details.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateWorkflow = () => {
    if (generatedWorkflow) {
      onWorkflowGenerated(generatedWorkflow);
      onOpenChange(false);
      // Reset state
      setMessages([]);
      setInput("");
      setError(null);
      setGeneratedWorkflow(null);
    }
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === "user") {
        sendMessage(lastUserMessage.content);
      }
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparkleIcon className="w-5 h-5" />
            Create Workflow with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you want your workflow to do, and I'll generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Example prompts */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt) => (
                <Badge
                  key={prompt}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          )}

          {/* Chat messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 border rounded-md p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    Generating workflow...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error}
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Workflow preview */}
          {generatedWorkflow && (
            <div className="border rounded-md p-4 bg-muted/50">
              <h4 className="font-medium mb-2">{generatedWorkflow.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {generatedWorkflow.description}
              </p>
              <div className="text-xs text-muted-foreground">
                {generatedWorkflow.nodes.length} nodes, {generatedWorkflow.edges.length} connections
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your workflow..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isGenerating) {
                sendMessage(input);
              }
            }}
            disabled={isGenerating}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isGenerating || !input.trim()}
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {generatedWorkflow && (
            <Button onClick={handleCreateWorkflow}>
              Create Workflow
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};