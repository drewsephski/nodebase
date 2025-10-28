"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { VariableIcon } from "lucide-react";
import { SetVariableDialog } from "./dialog";

export const SetVariableNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const variables = props.data?.variables || [];

  const description = `${variables.length} variable${variables.length !== 1 ? 's' : ''} set`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={VariableIcon}
        name="Set Variable"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <SetVariableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
