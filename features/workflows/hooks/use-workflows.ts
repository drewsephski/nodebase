import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getMany.queryOptions());
};

export const useCreateWorkflow = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow ${data.name} created`);
            queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions());
            // Return the created workflow data for component-level navigation
            return data;
        },
        onError: (error) => {
            toast.error(`Failed to create workflow: ${error.message}`);
        },
    }))
};

  