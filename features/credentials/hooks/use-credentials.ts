import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialParams } from "./use-credential-params";

export const useSuspenseCredential = (credentialId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id: credentialId }));
};

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialParams();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential ${data.name} created`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        return data;
      },
      onError: (error) => {
        toast.error(`Failed to create credential: ${error.message}`);
      },
    })
  );
};

export const useRemoveCredential = (id: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential removed`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryFilter({ id }));
      },
      onError: (error) => {
        toast.error(`Failed to remove credential: ${error.message}`);
      },
    })
  );
};

export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential ${data.name} updated`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ id: data.id })
        );
        return data;
      },
      onError: (error) => {
        toast.error(`Failed to update credential: ${error.message}`);
      },
    })
  );
};