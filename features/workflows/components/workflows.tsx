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
import type { Workflow } from "@/lib/generated/prisma";
import { PackageOpenIcon, WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// Utility function to transform date strings to Date objects
const transformWorkflowDates = (workflow: any): Workflow => {
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

export const WorkflowsList = () => {
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

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const { modal, handleError } = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        // Navigate to the newly created workflow
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
        isCreating={createWorkflow.isPending}
      />
      {modal}
    </>
  );
};

export const WorkflowsPagination = () => {
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

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error loading workflows" />;
};

export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
      onSuccess: (data) => {
        // Navigate to the newly created workflow
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
  const removeWorkflow = useRemoveWorkflow(data.id);

  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id }, {
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
