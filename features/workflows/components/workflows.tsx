"use client";

import {
  EmptyView,
  EntityContainer,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { EntityHeader } from "@/components/entity-components";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useRouter } from "next/navigation";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { EntitySearch } from "@/components/entity-components";
import { useWorkflowParams } from "../hooks/use-workflow-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { authClient } from "@/lib/auth-client";
import type { Workflow } from "@/lib/generated/prisma";
import { PackageOpenIcon, WorkflowIcon, SparkleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { InlineWorkflowEditor } from "./inline-workflow-editor";
import { useState } from "react";
import { useGuestWorkflows, useCreateGuestWorkflow, useDeleteGuestWorkflow, useGuestWorkflowParams } from "../hooks/use-guest-workflows";
import { WorkflowChatDialog } from "@/features/ai/components/workflow-chat/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// Utility function to transform date strings to Date objects
const transformWorkflowDates = (workflow: Workflow): Workflow => {
  return {
    ...workflow,
    createdAt: new Date(workflow.createdAt),
    updatedAt: new Date(workflow.updatedAt),
  };
};

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      placeholder="Search workflows"
      value={searchValue}
      onChange={onSearchChange}
    />
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const createWorkflow = useCreateWorkflow();
  const createGuestWorkflow = useCreateGuestWorkflow();
  const router = useRouter();
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;

  const handleWorkflowGenerated = (workflow: any) => {
    if (isAuthenticated) {
      createWorkflow.mutate(
        { name: workflow.name, nodes: workflow.nodes, edges: workflow.edges },
        {
          onSuccess: (data) => {
            router.push(`/workflows/${data.id}`);
            toast.success("Workflow created with AI!");
          },
        }
      );
    } else {
createWorkflow.mutate(
  {
    name: workflow.name,
    nodes: workflow.nodes,
    edges: workflow.edges
  },
  {
    onSuccess: (data) => {
      router.push(`/workflows/${data.id}`);
      toast.success("Workflow created with AI!");
    },
  }
);
    }
  };

  return (
    <>
      <EntityContainer
        header={<WorkflowsHeader onOpenEditor={() => setShowInlineEditor(true)} onOpenAIChat={() => setShowAIChat(true)} />}
        search={<WorkflowsSearch />}
        pagination={<WorkflowsPagination />}
      >
        {!isAuthenticated && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Try our AI workflow generator! Sign up to save your workflows permanently.
            </AlertDescription>
          </Alert>
        )}
        {children}
      </EntityContainer>
      <InlineWorkflowEditor
        isOpen={showInlineEditor}
        onClose={() => setShowInlineEditor(false)}
      />
      <WorkflowChatDialog
        open={showAIChat}
        onOpenChange={setShowAIChat}
        onWorkflowGenerated={handleWorkflowGenerated}
      />
    </>
  );
};

const AuthenticatedWorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => (
        <WorkflowItem data={transformWorkflowDates(workflow)} />
      )}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

const GuestWorkflowsList = () => {
  const workflows = useGuestWorkflows();

  return (
    <EntityList
      items={workflows.data?.workflows || []}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => (
        <WorkflowItem data={transformWorkflowDates(workflow)} />
      )}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsList = () => {
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;

  return isAuthenticated ? <AuthenticatedWorkflowsList /> : <GuestWorkflowsList />;
};

export const WorkflowsHeader = ({ disabled, onOpenEditor, onOpenAIChat }: { disabled?: boolean; onOpenEditor?: () => void; onOpenAIChat?: () => void }) => {
  const createWorkflow = useCreateWorkflow();
  const createGuestWorkflow = useCreateGuestWorkflow();
  const { modal, handleError } = useUpgradeModal();
  const router = useRouter();
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;

  const handleCreate = () => {
    if (!isAuthenticated) {
      createGuestWorkflow.mutate({ name: "New Workflow" }, {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`);
        },
      });
      return;
    }

    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.id) {
          router.push(`/workflows/${data.id}`);
        }
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending || createGuestWorkflow.isPending}
        extraActions={
          <Button variant="outline" onClick={onOpenAIChat} disabled={disabled}>
            <SparkleIcon className="w-4 h-4 mr-2" />
            Create with AI
          </Button>
        }
      />
      {modal}
    </>
  );
};

const AuthenticatedWorkflowsPagination = () => {
  const [params, setParams] = useWorkflowParams();
  const workflows = useSuspenseWorkflows();

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

const GuestWorkflowsPagination = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const workflows = useGuestWorkflows();
  const total = workflows.data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={totalPages}
      page={page}
      onPageChange={setPage}
    />
  );
};

export const WorkflowsPagination = () => {
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;

  return isAuthenticated ? <AuthenticatedWorkflowsPagination /> : <GuestWorkflowsPagination />;
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error loading workflows" />;
};

export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const createGuestWorkflow = useCreateGuestWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;

  const handleCreate = () => {
    if (!isAuthenticated) {
      createGuestWorkflow.mutate({ name: "New Workflow" }, {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`);
        },
      });
      return;
    }

    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
      onSuccess: (data) => {
        if (data?.id) {
          router.push(`/workflows/${data.id}`);
        }
      },
    });
  };

  return (
    <>
      {modal}
      <EmptyView
        message="No workflows found, create new workflow"
        onNew={handleCreate}
      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;
  const removeWorkflow = isAuthenticated ? useRemoveWorkflow(data.id) : useDeleteGuestWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate(isAuthenticated ? { id: data.id } : data.id, {
      onSuccess: () => {
        toast.success(`Workflow ${data.name} removed`);
      },
      onError: (error) => {
        toast.error(`Failed to remove workflow: ${error.message}`);
      },
    });
  };

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={`Updated ${formatDistanceToNow(data.updatedAt, { addSuffix: true })} • Created ${formatDistanceToNow(data.createdAt, { addSuffix: true })}`}
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
};
