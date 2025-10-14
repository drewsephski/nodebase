"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LogoutButton } from "./logout";
import { Button } from "@/components/ui/button";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = new QueryClient();
  const {data} = useQuery(trpc.getWorkflows.queryOptions());
  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast("Job Queued");
    },
  }));

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {data && <p>Found {data.length} workflows</p>}
      <Button disabled={create.isPending} onClick={() => create.mutate()}>Create Workflow</Button>
      <LogoutButton />
    </div>
  );
};

export default Page;
