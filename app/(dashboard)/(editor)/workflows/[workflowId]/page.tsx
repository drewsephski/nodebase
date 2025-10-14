import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{ workflowId: string }>;
}

// http://localhost:3000/workflows/123

const Page = async ({ params }: PageProps) => {
    await requireAuth();
  const { workflowId } = await params;

  return <p>Workflow id: {workflowId}</p>;
}

export default Page;
