"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { DatabaseIcon } from "lucide-react";
import { PostgresQueryDialog } from "./dialog";

export const PostgresQueryNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const operation = props.data?.operation || "select";
  const credentialName = props.data?.credentialName || "No credential selected";

  let description = "";
  switch (operation) {
    case "select":
      description = "SELECT query";
      break;
    case "insert":
      description = "INSERT operation";
      break;
    case "update":
      description = "UPDATE operation";
      break;
    case "delete":
      description = "DELETE operation";
      break;
    default:
      description = "Database query";
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={DatabaseIcon}
        name="PostgreSQL"
        description={`${description} (${credentialName})`}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <PostgresQueryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
