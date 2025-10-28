"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ClockIcon } from "lucide-react";
import { ScheduleTriggerDialog } from "./dialog";

export const ScheduleTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const scheduleType = props.data?.scheduleType || "cron";
  const cronExpression = props.data?.cronExpression || "0 0 * * *";
  const intervalValue = props.data?.intervalValue || 1;
  const intervalUnit = props.data?.intervalUnit || "hours";

  let description = "";
  if (scheduleType === "cron") {
    description = `Cron: ${cronExpression}`;
  } else if (scheduleType === "interval") {
    description = `Every ${intervalValue} ${intervalUnit}`;
  } else {
    description = "Schedule trigger";
  }

  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={ClockIcon}
        name="Schedule"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <ScheduleTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
