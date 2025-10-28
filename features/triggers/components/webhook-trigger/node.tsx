"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { WebhookIcon } from "lucide-react";
import { WebhookTriggerDialog } from "./dialog";

export const WebhookTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const webhookPath = props.data?.webhookPath || "/webhook";
  const description = `Webhook: ${webhookPath}`;

  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={WebhookIcon}
        name="Webhook"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <WebhookTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
