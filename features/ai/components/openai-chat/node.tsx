"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { BrainCircuitIcon } from "lucide-react";
import { OpenAIChatDialog } from "./dialog";

export const OpenAIChatNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const model = props.data?.model || "gpt-4o";
  const systemPrompt = props.data?.systemPrompt || "";
  const credentialName = props.data?.credentialName || "No credential selected";

  const description = `OpenAI ${model} (${credentialName})`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={BrainCircuitIcon}
        name="OpenAI"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <OpenAIChatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
