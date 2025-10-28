"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { SparkleIcon } from "lucide-react";
import { GoogleGeminiChatDialog } from "./dialog";

export const GoogleGeminiChatNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const model = props.data?.model || "gemini-2.0-flash-exp";
  const systemPrompt = props.data?.systemPrompt || "";
  const credentialName = props.data?.credentialName || "No credential selected";

  const description = `Google Gemini ${model} (${credentialName})`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={SparkleIcon}
        name="Google Gemini"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <GoogleGeminiChatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
