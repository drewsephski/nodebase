"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { GitBranchIcon } from "lucide-react";
import { IfConditionDialog } from "./dialog";

export const IfConditionNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const conditions = props.data?.conditions || [];
  const combineConditions = props.data?.combineConditions || "AND";

  let description = "";
  if (conditions.length === 0) {
    description = "No conditions set";
  } else {
    description = `${conditions.length} condition${conditions.length !== 1 ? 's' : ''} (${combineConditions})`;
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={GitBranchIcon}
        name="IF"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <IfConditionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
