import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createId } from "@paralleldrive/cuid2";
import {
  saveGuestWorkflow,
  getGuestWorkflows,
  getGuestWorkflow,
  deleteGuestWorkflow,
  migrateGuestWorkflowsToUser,
  type GuestWorkflow,
} from "@/lib/guest-workflow-storage";
import { useTRPC } from "@/trpc/client";

// Simple hook for guest workflow params - mimics useWorkflowParams
export const useGuestWorkflowParams = () => {
  // For now, return basic params - can be extended with URL params later
  return [{ search: "", page: 1, pageSize: 10 }];
};

export const useGuestWorkflows = () => {
  const [params] = useGuestWorkflowParams();
  
  return useQuery({
    queryKey: ["guest-workflows", params],
    queryFn: () => {
      const allWorkflows = getGuestWorkflows();
      
      // Apply search filter
      let filteredWorkflows = allWorkflows;
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredWorkflows = allWorkflows.filter(workflow =>
          workflow.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedWorkflows = filteredWorkflows.slice(startIndex, endIndex);
      
      return {
        workflows: paginatedWorkflows,
        total: filteredWorkflows.length,
        page: params.page,
        pageSize: params.pageSize,
      };
    },
  });
};

export const useGuestWorkflow = (workflowId: string) => {
  return useQuery({
    queryKey: ["guest-workflow", workflowId],
    queryFn: () => getGuestWorkflow(workflowId),
    enabled: !!workflowId,
  });
};

export const useCreateGuestWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; nodes?: any[]; edges?: any[] }) => {
      const newWorkflow: GuestWorkflow = {
        id: `guest-${createId()}`,
        name: data.name,
        nodes: data.nodes || [],
        edges: data.edges || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      saveGuestWorkflow(newWorkflow);
      return newWorkflow;
    },
    onSuccess: (data) => {
      toast.success(`Workflow ${data.name} created`);
      queryClient.invalidateQueries({ queryKey: ["guest-workflows"] });
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });
};

export const useUpdateGuestWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name?: string; nodes?: any[]; edges?: any[] }) => {
      const existingWorkflow = getGuestWorkflow(data.id);
      if (!existingWorkflow) {
        throw new Error("Workflow not found");
      }
      
      const updatedWorkflow: GuestWorkflow = {
        ...existingWorkflow,
        name: data.name ?? existingWorkflow.name,
        nodes: data.nodes ?? existingWorkflow.nodes,
        edges: data.edges ?? existingWorkflow.edges,
        updatedAt: new Date(),
      };
      
      saveGuestWorkflow(updatedWorkflow);
      return updatedWorkflow;
    },
    onSuccess: (data) => {
      toast.success("Workflow saved successfully");
      queryClient.invalidateQueries({ queryKey: ["guest-workflows"] });
      queryClient.invalidateQueries({ queryKey: ["guest-workflow", data.id] });
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to save workflow: ${error.message}`);
    },
  });
};

export const useDeleteGuestWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const workflow = getGuestWorkflow(id);
      if (!workflow) {
        throw new Error("Workflow not found");
      }
      
      deleteGuestWorkflow(id);
      return workflow;
    },
    onSuccess: (data) => {
      toast.success(`Workflow ${data.name} removed`);
      queryClient.invalidateQueries({ queryKey: ["guest-workflows"] });
      queryClient.invalidateQueries({ queryKey: ["guest-workflow", data.id] });
    },
    onError: (error) => {
      toast.error(`Failed to remove workflow: ${error.message}`);
    },
  });
};

export const useMigrateGuestWorkflows = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const guestWorkflows = getGuestWorkflows();
      if (guestWorkflows.length === 0) {
        return [];
      }

      toast.info("Migrating your workflows...");
      
      const createdIds = await migrateGuestWorkflowsToUser("", trpc);
      
      toast.success(`${createdIds.length} workflows migrated successfully!`);
      
      // Invalidate authenticated workflows queries
      queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      
      return createdIds;
    },
    onError: (error) => {
      toast.error(`Failed to migrate workflows: ${error.message}`);
    },
  });
};