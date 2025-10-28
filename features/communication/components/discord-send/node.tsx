"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { MessageCircleIcon } from "lucide-react";
import { DiscordSendDialog } from "./dialog";

export const DiscordSendNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const webhookUrl = props.data?.webhookUrl || "";
  const username = props.data?.username || "";
  const credentialName = props.data?.credentialName || "No credential selected";

  let description = "";
  if (webhookUrl) {
    description = `Discord webhook (${credentialName})`;
  } else if (username) {
    description = `Discord bot: ${username} (${credentialName})`;
  } else {
    description = "Discord message";
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={MessageCircleIcon}
        name="Discord"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <DiscordSendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
