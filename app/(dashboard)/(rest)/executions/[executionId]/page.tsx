import { getAuth } from "@/lib/auth-utils";
import { prefetchExecutionDetails } from "@/features/executions/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { ExecutionDetail } from "@/features/executions/components/execution-detail";

interface PageProps {
  params: Promise<{ executionId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const session = await getAuth();
  const { executionId } = await params;

  // Only prefetch execution details if user is authenticated
  if (session) {
    await prefetchExecutionDetails(executionId);
  }

  return (
    <HydrateClient>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <ExecutionDetail executionId={executionId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
