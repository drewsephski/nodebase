import { getAuth } from "@/lib/auth-utils";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { EditorClient } from "@/features/editor/components/editor-client";

interface PageProps {
  params: { workflowId: string };
}

const Page = async ({ params }: PageProps) => {
  const session = await getAuth();
  const { workflowId } = params;
  
  // Only prefetch workflow if it's not a guest workflow or "new"
  if (!workflowId.startsWith("guest-") && workflowId !== "new") {
    try {
      await prefetchWorkflow(workflowId);
    } catch (error) {
      console.error(`Failed to prefetch workflow ${workflowId}:`, error);
    }
  }

  return (
    <HydrateClient>
      <EditorHeader workflowId={workflowId} />
      <main className="flex-1">
        <EditorClient workflowId={workflowId} isAuthenticated={!!session} />
      </main>
    </HydrateClient>
  );
};

export default Page;
