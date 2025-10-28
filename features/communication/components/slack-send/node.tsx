"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { MessageSquareIcon } from "lucide-react";
import { SlackSendDialog } from "./dialog";

export const SlackSendNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const channel = props.data?.channel || "#general";
  const messageType = props.data?.messageType || "text";
  const credentialName = props.data?.credentialName || "No credential selected";

  const description = `Send ${messageType} to ${channel} (${credentialName})`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={MessageSquareIcon}
        name="Slack"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <SlackSendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
