import { useState, useEffect, useCallback, useRef } from 'react';
import { Workflow, WorkflowNode, WorkflowEdge, MCPServer } from '@/lib/workflow/types';
import {
  saveWorkflow as saveWorkflowToStorage,
  getWorkflows,
  getWorkflow,
  deleteWorkflow as deleteWorkflowFromStorage,
  setCurrentWorkflow,
  getCurrentWorkflowId,
  saveMCPServer,
  getMCPServers,
} from '@/lib/workflow/storage';

export function useWorkflow(workflowId?: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [convexId, setConvexId] = useState<string | null>(null); // Track Convex ID
  const saveToConvexTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load workflow from Redis via API
  useEffect(() => {
    const loadWorkflow = async () => {
      setLoading(true);

      if (workflowId) {
        // Fetch workflow from API (Redis)
        try {
          const response = await fetch('/api/workflows');
          const data = await response.json();
          const workflows = data.workflows || [];
          const loaded = workflows.find((w: any) => w.id === workflowId);

          if (loaded) {
            // Fetch full workflow details
            const fullWorkflow = await fetch(`/api/workflows/${workflowId}`).then(r => r.json());
            const workflowData = fullWorkflow.workflow || loaded;
            setWorkflow(workflowData);
            // Store the Convex ID for future saves
            setConvexId(workflowData._convexId || workflowData._id || null);
          } else {
            createNewWorkflow();
          }
        } catch (error) {
          console.error('Failed to load workflow from Convex:', error);
          createNewWorkflow();
        }
      } else {
        createNewWorkflow();
      }

      setLoading(false);
    };

    loadWorkflow();
  }, [workflowId]);

  // Load all workflows from API
  const loadWorkflows = useCallback(async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows from API:', error);
      setWorkflows([]);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Create new workflow
  const createNewWorkflow = useCallback(() => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: 'New Workflow',
      nodes: [
        {
          id: 'node_0',
          type: 'start',
          position: { x: 250, y: 100 },
          data: { label: 'Start' },
        },
        {
          id: 'node_1',
          type: 'agent',
          position: { x: 250, y: 250 },
          data: {
            label: 'Agent',
            name: 'My agent',
            instructions: 'You are a helpful assistant.',
            model: 'gpt-4.1',
            includeChatHistory: true,
            tools: [],
            outputFormat: 'Text',
          },
        },
      ],
      edges: [
        {
          id: 'edge_0_1',
          source: 'node_0',
          target: 'node_1',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWorkflow(newWorkflow);
    // No longer save to localStorage
    // Workflow will be saved via API when user makes changes

    return newWorkflow;
  }, []);

  // Save workflow with debounce to prevent multiple rapid saves
  // Use useCallback with minimal deps to prevent infinite loops
  const saveWorkflow = useCallback(async (updates?: Partial<Workflow>) => {
    // If no workflow exists yet, create a new one from updates
    if (!workflow) {
      if (!updates || !updates.nodes || !updates.edges) {
        console.warn('⚠️ Cannot save workflow: no workflow state and incomplete updates');
        return;
      }

      // Create a complete workflow from updates
      const newWorkflow: Workflow = {
        id: updates.id || `workflow_${Date.now()}`,
        name: updates.name || 'New Workflow',
        description: updates.description,
        nodes: updates.nodes,
        edges: updates.edges,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setWorkflow(newWorkflow);

      // Save immediately to Convex
      try {
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWorkflow),
        });
        const data = await response.json();
        console.log('💾 New workflow saved to Convex:', data.success ? 'SUCCESS' : 'FAILED');

        // Store the Convex ID from the response
        if (data.success && data.workflowId) {
          setConvexId(data.workflowId);
        }
      } catch (error) {
        console.error('Failed to save new workflow to Convex:', error);
      }
      return;
    }

    const updated: Workflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setWorkflow(updated);

    // Clear any pending save timeout
    if (saveToConvexTimeoutRef.current) {
      clearTimeout(saveToConvexTimeoutRef.current);
    }

    // Debounce the save to Convex to prevent rapid saves
    saveToConvexTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        const data = await response.json();
        console.log('💾 [AUTO-SAVE] Workflow synced to Convex:', data.success ? '✅ SUCCESS' : '❌ FAILED');

        // Store the Convex ID from the response
        if (data.success && data.workflowId) {
          setConvexId(data.workflowId);
        }

        // Don't reload workflows on every save - only when explicitly needed
        // This prevents unnecessary re-fetches and duplicate saves
      } catch (error) {
        console.error('❌ Failed to save workflow to Convex:', error);
      }
    }, 1000); // 1000ms debounce to batch rapid saves
  }, [workflow, loadWorkflows]);

  // Update nodes
  const updateNodes = useCallback((nodes: WorkflowNode[]) => {
    if (!workflow) {
      console.warn('⚠️ updateNodes called but no workflow exists');
      return;
    }

    console.log('📝 updateNodes called with', nodes.length, 'nodes');
    saveWorkflow({ nodes });
  }, [workflow, saveWorkflow]);

  // Update edges
  const updateEdges = useCallback((edges: WorkflowEdge[]) => {
    if (!workflow) return;

    saveWorkflow({ edges });
  }, [workflow, saveWorkflow]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, data: any) => {
    if (!workflow) return;

    const nodes = workflow.nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    );

    updateNodes(nodes);
  }, [workflow, updateNodes]);

  // Delete workflow
  const deleteWorkflow = useCallback((id: string) => {
    deleteWorkflowFromStorage(id);
    loadWorkflows();

    if (workflow?.id === id) {
      createNewWorkflow();
    }
  }, [workflow, loadWorkflows, createNewWorkflow]);

  return {
    workflow,
    workflows,
    loading,
    convexId, // Expose Convex ID for templates and other features
    saveWorkflow,
    updateNodes,
    updateEdges,
    updateNodeData,
    deleteWorkflow,
    createNewWorkflow,
    loadWorkflows,
  };
}

export function useMCPServers() {
  const [servers, setServers] = useState<MCPServer[]>([]);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = () => {
    const loaded = getMCPServers();
    setServers(loaded);
  };

  const addServer = useCallback((server: MCPServer) => {
    saveMCPServer(server);
    loadServers();
  }, []);

  const updateServer = useCallback((id: string, updates: Partial<MCPServer>) => {
    const existing = servers.find(s => s.id === id);
    if (existing) {
      saveMCPServer({ ...existing, ...updates });
      loadServers();
    }
  }, [servers]);

  return {
    servers,
    addServer,
    updateServer,
    loadServers,
  };
}
