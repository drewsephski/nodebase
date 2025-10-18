import { requireAuth } from "@/lib/auth-utils";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { Editor } from "@/features/editor/components/editor";
import {
  EditorError,
  EditorLoading,
} from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";

interface PageProps {
  params: Promise<{ workflowId: string }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  const { workflowId } = await params;
  prefetchWorkflow(workflowId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <EditorHeader workflowId={workflowId} />
          <main className="flex-1">
            <Editor workflowId={workflowId} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
