"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { MergeIcon } from "lucide-react";
import { MergeDialog } from "./dialog";

export const MergeNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const mergeMode = props.data?.mergeMode || "append";
  const joinKey = props.data?.joinKey || "";

  let description = "";
  switch (mergeMode) {
    case "append":
      description = "Append arrays";
      break;
    case "merge":
      description = `Merge by ${joinKey}`;
      break;
    case "combine":
      description = "Combine objects";
      break;
    default:
      description = "Merge data";
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={MergeIcon}
        name="Merge"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <MergeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
