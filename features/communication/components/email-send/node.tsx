"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { MailIcon } from "lucide-react";
import { EmailSendDialog } from "./dialog";

export const EmailSendNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "initial";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const to = props.data?.to || "";
  const subject = props.data?.subject || "";
  const credentialName = props.data?.credentialName || "No credential selected";

  const description = `Send email to ${to} (${credentialName})`;

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={MailIcon}
        name="Email"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <EmailSendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
