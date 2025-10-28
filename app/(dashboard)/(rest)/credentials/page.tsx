import { getAuth } from "@/lib/auth-utils";
import { credentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { CredentialsContainer } from "@/features/credentials/components/credentials";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Page = async ({ searchParams }: PageProps) => {
  const session = await getAuth();

  const params = await credentialsParamsLoader(searchParams);
  
  // Only prefetch credentials if user is authenticated
  if (session) {
    await prefetchCredentials(params);
  }

  return (
    <HydrateClient>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <CredentialsContainer />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;