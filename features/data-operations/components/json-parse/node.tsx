"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/http-request/base-execution-node";
import { FileJsonIcon } from "lucide-react";
import { JsonParseDialog } from "./dialog";

export const JsonParseNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = "idle";
  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const operation = props.data?.operation || "parse";
  const jsonPath = props.data?.jsonPath || "";

  let description = "";
  switch (operation) {
    case "parse":
      description = "Parse JSON string";
      break;
    case "stringify":
      description = "Convert to JSON string";
      break;
    case "extract":
      description = `Extract: ${jsonPath}`;
      break;
    case "transform":
      description = "Transform JSON";
      break;
    default:
      description = "JSON operation";
  }

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={FileJsonIcon}
        name="JSON"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
      <JsonParseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nodeId={props.id}
        nodeData={props.data}
      />
    </>
  );
});
