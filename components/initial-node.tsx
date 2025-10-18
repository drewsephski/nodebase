"use client";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo } from "react";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./workflow-node";

export const InitialNode = memo((props: NodeProps) => {
  return (
    <WorkflowNode showToolbar={false}>
    <PlaceholderNode {...props} onClick={() => {}}>
      <div className="size-4 cursor-pointer items-center justify-center flex">
        <PlusIcon className="size-4" />
      </div>
    </PlaceholderNode>
    </WorkflowNode>
  );
});
