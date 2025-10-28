"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { TimerIcon } from "lucide-react";
import { DelayDialog } from "./dialog";

export const DelayNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const delayType = props.data?.delayType || "fixed";
  const durationValue = props.data?.durationValue || 1;
  const durationUnit = props.data?.durationUnit || "minutes";

  let description = "";
  if (delayType === "fixed") {
    description = `Wait ${durationValue} ${durationUnit}`;
  } else {
    description = "Wait until specific time";
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={TimerIcon}
        name="Delay"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <DelayDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
