"use client";

import type { NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "./base-execution-node";
import { GlobeIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

export const HttpRequestNode = memo((props: NodeProps) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} ${nodeData.endpoint}`
    : "Not Configured";

  return (
    <BaseExecutionNode
      {...props}
      icon={GlobeIcon}
      name="HTTP Request"
      description={description}
    />
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
