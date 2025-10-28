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
import { useSuspenseExecutions } from "../hooks/use-executions";
import { EntitySearch } from "@/components/entity-components";
import { useExecutionParams } from "../hooks/use-execution-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Badge } from "@/components/ui/badge";

export const ExecutionsContainer = () => {
  const [params, setParams] = useExecutionParams();
  const { data, isLoading, error } = useSuspenseExecutions();

  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  if (error) {
    return <ErrorView message={error.message} />;
  }

  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Executions"
          description="View workflow execution history"
          newButtonLabel="Run Workflow"
          onNew={() => {
            // Handle run workflow action
          }}
        />
      }
      search={
        <EntitySearch
          placeholder="Search executions..."
          value={searchValue}
          onChange={onSearchChange}
        />
      }
      pagination={
        <EntityPagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={(page) => setParams({ page })}
        />
      }
    >
      <ExecutionsList
        executions={data.executions}
        isLoading={isLoading}
      />
    </EntityContainer>
  );
};

interface ExecutionsListProps {
  executions: Array<{
    id: string;
    workflowId: string;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    error: string | null;
    triggeredBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    steps: Array<{
      id: string;
      status: string;
      startedAt: Date | null;
      completedAt: Date | null;
      error: string | null;
    }>;
    logs: Array<{
      id: string;
      level: string;
      message: string;
      createdAt: Date;
    }>;
  }>;
  isLoading?: boolean;
}

export const ExecutionsList = ({
  executions,
  isLoading,
}: ExecutionsListProps) => {
  if (isLoading) {
    return <LoadingView message="Loading executions..." />;
  }

  if (executions.length === 0) {
    return (
      <EmptyView
        message="No executions found. Run a workflow to see execution history."
        onNew={() => {
          // Handle run workflow action
        }}
      />
    );
  }

  return (
    <EntityList
      items={executions}
      renderItem={(execution) => (
        <ExecutionItem
          key={execution.id}
          execution={execution}
        />
      )}
      getKey={(execution) => execution.id}
    />
  );
};

interface ExecutionItemProps {
  execution: {
    id: string;
    workflowId: string;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    error: string | null;
    triggeredBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    steps: Array<{
      id: string;
      status: string;
      startedAt: Date | null;
      completedAt: Date | null;
      error: string | null;
    }>;
    logs: Array<{
      id: string;
      level: string;
      message: string;
      createdAt: Date;
    }>;
  };
}

const ExecutionItem = ({ execution }: ExecutionItemProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "RUNNING":
        return <Badge variant="default">Running</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <EntityItem
      title={`Execution ${execution.id.slice(0, 8)}`}
      subtitle={`Started ${execution.createdAt.toLocaleString()}`}
      href={`/executions/${execution.id}`}
      actions={getStatusBadge(execution.status)}
    />
  );
};
