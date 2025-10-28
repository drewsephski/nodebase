import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type ExecutionsInput = inferInput<typeof trpc.workflows.getExecutions>;

export const prefetchExecutions = (params: ExecutionsInput) => {
  return prefetch(trpc.workflows.getExecutions.queryOptions(params));
};

export const prefetchExecutionDetails = (executionId: string) => {
  return prefetch(trpc.workflows.getExecutionDetails.queryOptions({ executionId }));
};
