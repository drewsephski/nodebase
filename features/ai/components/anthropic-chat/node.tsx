"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { BotIcon } from "lucide-react";
import { AnthropicChatDialog } from "./dialog";

export const AnthropicChatNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const model = props.data?.model || "claude-3-5-sonnet-20241022";
  const systemPrompt = props.data?.systemPrompt || "";
  const credentialName = props.data?.credentialName || "No credential selected";

  const description = `Anthropic ${model} (${credentialName})`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={BotIcon}
        name="Anthropic"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <AnthropicChatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
