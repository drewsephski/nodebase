import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
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
  await requireAuth();

  const params = await workflowsParamsLoader(searchParams);
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
