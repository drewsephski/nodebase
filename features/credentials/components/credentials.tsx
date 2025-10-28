
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
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { EntitySearch } from "@/components/entity-components";
import { useCredentialParams } from "../hooks/use-credential-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

export const CredentialsContainer = () => {
  const [params, setParams] = useCredentialParams();
  const { data, isLoading, error } = useSuspenseCredentials();

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
          title="Credentials"
          description="Manage your API credentials and secrets"
          newButtonLabel="New Credential"
          onNew={() => {
            // Handle create action - will be implemented when dialog is added
          }}
        />
      }
      search={
        <EntitySearch
          placeholder="Search credentials..."
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
      <CredentialsList
        credentials={data.items}
        isLoading={isLoading}
      />
    </EntityContainer>
  );
};

interface CredentialsListProps {
  credentials: Array<{
    id: string;
    name: string;
    type: string;
    data: Record<string, unknown>;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  isLoading?: boolean;
}

export const CredentialsList = ({
  credentials,
  isLoading,
}: CredentialsListProps) => {
  if (isLoading) {
    return <LoadingView message="Loading credentials..." />;
  }

  if (credentials.length === 0) {
    return (
      <EmptyView
        message="No credentials found. Create your first credential to get started."
        onNew={() => {
          // Handle create action
        }}
      />
    );
  }

  return (
    <EntityList
      items={credentials}
      renderItem={(credential) => (
        <CredentialItem
          key={credential.id}
          credential={credential}
        />
      )}
      getKey={(credential) => credential.id}
    />
  );
};

interface CredentialItemProps {
  credential: {
    id: string;
    name: string;
    type: string;
    data: Record<string, unknown>;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const CredentialItem = ({ credential }: CredentialItemProps) => {
  const mutation = useRemoveCredential(credential.id);

  const handleRemove = async () => {
    await mutation.mutateAsync({ id: credential.id });
  };

  return (
    <EntityItem
      title={credential.name}
      subtitle={credential.description || `${credential.type} credential`}
      href={`/credentials/${credential.id}`}
      onRemove={handleRemove}
      isRemoving={mutation.isPending}
    />
  );
};

export const CredentialsLoading = () => <LoadingView message="Loading credentials..." />;

export const CredentialsError = ({ error }: { error: Error }) => (
  <ErrorView message={error.message} />
);