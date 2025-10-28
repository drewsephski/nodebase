import { getAuth } from "@/lib/auth-utils";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { ExecutionsContainer } from "@/features/executions/components/executions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Page = async ({ searchParams }: PageProps) => {
  const session = await getAuth();

  const params = await executionsParamsLoader(searchParams);
  
  // Only prefetch executions if user is authenticated
  if (session) {
    await prefetchExecutions({
      workflowId: params.workflowId,
      page: params.page,
      pageSize: params.pageSize,
    });
  }

  return (
    <HydrateClient>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <ExecutionsContainer />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;