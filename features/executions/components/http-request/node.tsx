"use client";

import type { NodeProps, Node } from "@xyflow/react";
import { BaseExecutionNode } from "./base-execution-node";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { HttpRequestDialog } from "./dialog";
import { $strip } from "better-auth";
import {
  output,
  ZodObject,
  ZodURL,
  ZodEnum,
  ZodOptional,
  ZodString,
} from "zod";
import { useReactFlow } from "@xyflow/react";
import { FormType } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
  [key: string]: unknown;
};
type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();


  const nodeStatus = "initial";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: FormType) => {
    setNodes((nodes) => nodes.map((node) => {
        if (node.id === props.id) {
            return {
                ...node,
                data: {
                    ...node.data,
                    endpoint: values.endpoint,
                    method: values.method,
                    body: values.body,
                },
            };
        }
        return node;
    }));
    setDialogOpen(false);
  };

  const nodeData = props.data;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} ${nodeData.endpoint}`
    : "Not Configured";

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultEndpoint={nodeData.endpoint}
        defaultMethod={nodeData.method}
        defaultBody={nodeData.body}
      />
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
