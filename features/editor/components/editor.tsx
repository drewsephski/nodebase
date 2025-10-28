"use client";
  
import { useState, useCallback, useEffect } from "react";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useGuestWorkflow } from "@/features/workflows/hooks/use-guest-workflows";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { createId } from "@paralleldrive/cuid2";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  Background,
  MiniMap,
  Controls,
  Panel,
} from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "@/features/editor/store/atoms";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};
  
interface EditorErrorProps {
  message?: string;
}
  
export const EditorError = ({ message = "Error loading editor" }: EditorErrorProps) => {
  return <ErrorView message={message} />;
};
  
// Guest Editor component for guest workflows
const GuestEditor = ({ workflowId }: { workflowId: string }) => {
  const guestWorkflow = useGuestWorkflow(workflowId);
  const setEditor = useSetAtom(editorAtom);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);
  
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      const nodeType = data.nodeType;
      
      if (nodeType) {
        const reactFlowBounds = (event.target as Element).getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
  
        setNodes((nodes) => {
          const hasInitialTrigger = nodes.some(
            (node) => node.type === "initial"
          );
  
          const newNode = {
            id: createId(),
            type: nodeType.type,
            position,
            data: {},
          };
  
          if (hasInitialTrigger) {
            return [newNode];
          }
          return [...nodes, newNode];
        });
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }, [setNodes]);
  
  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  
  useEffect(() => {
    if (guestWorkflow.data && !isInitialized) {
      setNodes(guestWorkflow.data.nodes || []);
      setEdges(guestWorkflow.data.edges || []);
      setIsInitialized(true);
    }
  }, [guestWorkflow.data, isInitialized]);
  
  if (guestWorkflow.isLoading) return <EditorLoading />;
  if (guestWorkflow.error) return <EditorError message={guestWorkflow.error.message} />;
  if (!guestWorkflow.data) return <EditorError message="No workflow data found" />;
  
  return (
    <div className="size-full text-blue-950">
      <div className="h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          onInit={setEditor}
          fitView
          nodeTypes={nodeComponents}
          proOptions={{
            hideAttribution: true,
          }}
        >
          <Panel position="bottom-center">
            <AddNodeButton />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
  
// Authenticated Editor component for authenticated workflows
const AuthenticatedEditor = ({ workflowId }: { workflowId: string }) => {
  const workflowQuery = useSuspenseWorkflow(workflowId);
  const setEditor = useSetAtom(editorAtom);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);
  
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      const nodeType = data.nodeType;
      
      if (nodeType) {
        const reactFlowBounds = (event.target as Element).getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
  
        setNodes((nodes) => {
          const hasInitialTrigger = nodes.some(
            (node) => node.type === "initial"
          );
  
          const newNode = {
            id: createId(),
            type: nodeType.type,
            position,
            data: {},
          };
  
          if (hasInitialTrigger) {
            return [newNode];
          }
          return [...nodes, newNode];
        });
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }, [setNodes]);
  
  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  
  useEffect(() => {
    if (workflowQuery.data && !isInitialized) {
      setNodes(workflowQuery.data.nodes || []);
      setEdges(workflowQuery.data.edges || []);
      setIsInitialized(true);
    }
  }, [workflowQuery.data, isInitialized]);
  
  return (
    <div className="size-full text-blue-950">
      <div className="h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          onInit={setEditor}
          fitView
          nodeTypes={nodeComponents}
          proOptions={{
            hideAttribution: true,
          }}
        >
          <Panel position="bottom-center">
            <AddNodeButton />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
  
export const Editor = ({ workflowId, isAuthenticated: propIsAuthenticated }: { workflowId: string; isAuthenticated?: boolean }) => {
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  
  const session = authData?.data;
  const isAuthenticated = propIsAuthenticated || !!session;
  const isGuestWorkflow = workflowId.startsWith("guest-");
  
  if (isGuestWorkflow) {
    return <GuestEditor workflowId={workflowId} />;
  } else if (isAuthenticated) {
    return <AuthenticatedEditor workflowId={workflowId} />;
  } else {
    return <EditorError message="Please log in to access this workflow" />;
  }
};
