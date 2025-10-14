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
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast("AI Job Queued");
    },
    onError: () => {
      toast("AI Job Failed");
    },
  }));

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast("Workflow Job Queued");
    },
    onError: () => {
      toast("Workflow Job Failed");
    },
  }));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">

      protected server component
      <div>
        {JSON.stringify(data, null, 2)}
      </div>
      <Button disabled={testAi.isPending} onClick=
        {() => testAi.mutate()}> Test AI
      </Button>
      <Button disabled={create.isPending} onClick=
        {() => create.mutate()}>

        Create workflow
      </Button>
      <LogoutButton />
    </div>
  );
};

export default Page;
