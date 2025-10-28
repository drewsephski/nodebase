"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { DatabaseIcon } from "lucide-react";
import { MongoDBQueryDialog } from "./dialog";

export const MongoDBQueryNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const operation = props.data?.operation || "find";
  const collection = props.data?.collection || "";
  const credentialName = props.data?.credentialName || "No credential selected";

  let description = "";
  switch (operation) {
    case "find":
      description = `Find in ${collection}`;
      break;
    case "insert":
      description = `Insert to ${collection}`;
      break;
    case "update":
      description = `Update ${collection}`;
      break;
    case "delete":
      description = `Delete from ${collection}`;
      break;
    case "aggregate":
      description = `Aggregate ${collection}`;
      break;
    default:
      description = "Database operation";
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={DatabaseIcon}
        name="MongoDB"
        description={`${description} (${credentialName})`}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <MongoDBQueryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
