"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { FilterIcon } from "lucide-react";
import { FilterDialog } from "./dialog";

export const FilterNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const filterMode = props.data?.filterMode || "keep";
  const conditions = props.data?.conditions || [];

  let description = "";
  if (filterMode === "keep") {
    description = `Keep ${conditions.length} condition${conditions.length !== 1 ? 's' : ''}`;
  } else {
    description = `Remove ${conditions.length} condition${conditions.length !== 1 ? 's' : ''}`;
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={FilterIcon}
        name="Filter"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <FilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
