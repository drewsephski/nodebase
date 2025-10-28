import { prefetchWorkflows, prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { getAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import {
  WorkflowsContainer,
  WorkflowsList,
  WorkflowsLoading,
  WorkflowsError,
} from "@/features/workflows/components/workflows";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  const session = await getAuth();
  const params = await workflowsParamsLoader(searchParams);
  
  // Always prefetch workflows (for both authenticated and unauthenticated users)
  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowsError />}>
          <Suspense fallback={<WorkflowsLoading />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};
export default Page;
