"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import {
  GlobeIcon,
  MousePointerIcon,
  WebhookIcon,
  ClockIcon,
  MessageSquareIcon,
  MessageCircleIcon,
  MailIcon,
  BrainCircuitIcon,
  BotIcon,
  SparkleIcon,
  FileJsonIcon,
  FilterIcon,
  VariableIcon,
  CodeIcon,
  DatabaseIcon,
  TimerIcon,
  GitBranchIcon,
  MergeIcon,
} from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NodeType } from "@/lib/generated/prisma";
import { Separator } from "@/components/ui/separator";

export type NodeTypeOption = {
  label: string;
  icon: React.ComponentType<{ className?: string }> | string;
  description: string;
  type: NodeType;
  category: "trigger" | "action";
};

const triggerNodes: NodeTypeOption[] = [
  {
    label: "Trigger manually",
    icon: MousePointerIcon,
    description: "Runs the flow manually",
    type: NodeType.MANUAL_TRIGGER,
    category: "trigger",
  },
  {
    label: "Webhook",
    icon: WebhookIcon,
    description: "Triggered by HTTP webhook",
    type: NodeType.WEBHOOK_TRIGGER,
    category: "trigger",
  },
  {
    label: "Schedule",
    icon: ClockIcon,
    description: "Triggered on a schedule",
    type: NodeType.SCHEDULE_TRIGGER,
    category: "trigger",
  },
];

const executionNodes: NodeTypeOption[] = [
  // Communication
  {
    label: "HTTP Request",
    icon: GlobeIcon,
    description: "Makes an HTTP request",
    type: NodeType.HTTP_REQUEST,
    category: "action",
  },
  {
    label: "Slack",
    icon: MessageSquareIcon,
    description: "Send Slack message",
    type: NodeType.SLACK_SEND_MESSAGE,
    category: "action",
  },
  {
    label: "Discord",
    icon: MessageCircleIcon,
    description: "Send Discord message",
    type: NodeType.DISCORD_SEND_MESSAGE,
    category: "action",
  },
  {
    label: "Email",
    icon: MailIcon,
    description: "Send email",
    type: NodeType.EMAIL_SEND,
    category: "action",
  },

  // AI Services
  {
    label: "OpenAI",
    icon: BrainCircuitIcon,
    description: "Chat with OpenAI models",
    type: NodeType.OPENAI_CHAT,
    category: "action",
  },
  {
    label: "Anthropic",
    icon: BotIcon,
    description: "Chat with Claude",
    type: NodeType.ANTHROPIC_CHAT,
    category: "action",
  },
  {
    label: "Google Gemini",
    icon: SparkleIcon,
    description: "Chat with Gemini",
    type: NodeType.GOOGLE_GEMINI_CHAT,
    category: "action",
  },

  // Data Operations
  {
    label: "JSON",
    icon: FileJsonIcon,
    description: "Parse and transform JSON",
    type: NodeType.JSON_PARSE,
    category: "action",
  },
  {
    label: "Filter",
    icon: FilterIcon,
    description: "Filter items by conditions",
    type: NodeType.FILTER,
    category: "action",
  },
  {
    label: "Set Variable",
    icon: VariableIcon,
    description: "Set workflow variables",
    type: NodeType.SET_VARIABLE,
    category: "action",
  },
  {
    label: "Code",
    icon: CodeIcon,
    description: "Execute JavaScript code",
    type: NodeType.CODE_EXECUTE,
    category: "action",
  },

  // Database
  {
    label: "PostgreSQL",
    icon: DatabaseIcon,
    description: "Query PostgreSQL database",
    type: NodeType.POSTGRES_QUERY,
    category: "action",
  },
  {
    label: "MongoDB",
    icon: DatabaseIcon,
    description: "Query MongoDB database",
    type: NodeType.MONGODB_QUERY,
    category: "action",
  },

  // Utilities
  {
    label: "Delay",
    icon: TimerIcon,
    description: "Wait for duration",
    type: NodeType.DELAY,
    category: "action",
  },
  {
    label: "IF",
    icon: GitBranchIcon,
    description: "Conditional branching",
    type: NodeType.IF_CONDITION,
    category: "action",
  },
  {
    label: "Merge",
    icon: MergeIcon,
    description: "Merge multiple inputs",
    type: NodeType.MERGE,
    category: "action",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  
  const handleNodeSelect = useCallback((nodeType: NodeTypeOption) => {
    if (nodeType.type === NodeType.MANUAL_TRIGGER) {
      const nodes = getNodes();
      const hasManualTrigger = nodes.some(
        (node) => node.type === NodeType.MANUAL_TRIGGER
      );

      if (hasManualTrigger) {
        toast.error("You can only have one manual trigger");
        return;
      }
    }
    
    const createNodeAtPosition = (x: number, y: number) => {
      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL
        );
        
        const flowPosition = screenToFlowPosition({ x, y });
        const newNode = {
          id: createId(),
          data: {},
          type: nodeType.type,
          position: flowPosition,
        };
        
        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });
    };

    // For demo workflows (unauthenticated), add node to center
    createNodeAtPosition(window.innerWidth / 2, window.innerHeight / 2);
    onOpenChange(false);
  }, [setNodes, getNodes, screenToFlowPosition, onOpenChange]);

  const handleDragStart = useCallback((e: React.DragEvent, nodeType: NodeTypeOption) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/reactflow'));
      const nodeType = data.nodeType as NodeTypeOption;
      
      if (nodeType) {
        handleNodeSelect(nodeType);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }, [handleNodeSelect]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts the workflow.
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((node) => {
            const Icon = node.icon;

            return (
              <div
                key={node.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(node)}
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={node.label}
                      className="size-5 object-contain rounded-sm"
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{node.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {node.description}
                    </span>
                    <span className="text-xs text-blue-500 mt-1">
                      Drag to canvas or click to add
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Separator />
        <div>
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Actions
          </div>
          {executionNodes.map((node) => {
            const Icon = node.icon;

            return (
              <div
                key={node.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                onClick={() => handleNodeSelect(node)}
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <img
                      src={Icon}
                      alt={node.label}
                      className="size-5 object-contain rounded-sm"
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{node.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {node.description}
                    </span>
                    <span className="text-xs text-blue-500 mt-1">
                      Drag to canvas or click to add
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
