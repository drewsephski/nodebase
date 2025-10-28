"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { CodeIcon } from "lucide-react";
import { CodeExecuteDialog } from "./dialog";

export const CodeExecuteNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const language = props.data?.language || "javascript";
  const inputVar = props.data?.inputVar || "input";
  const outputVar = props.data?.outputVar || "output";

  const description = `${language} (${inputVar} → ${outputVar})`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={CodeIcon}
        name="Code"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <CodeExecuteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
