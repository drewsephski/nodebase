import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionParams } from "./use-execution-params";

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionParams();

  return useSuspenseQuery(
    trpc.workflows.getExecutions.queryOptions({
      workflowId: params.workflowId,
      page: params.page,
      pageSize: params.pageSize,
    })
  );
};

export const useSuspenseExecutionDetails = (executionId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.workflows.getExecutionDetails.queryOptions({ executionId })
  );
};
