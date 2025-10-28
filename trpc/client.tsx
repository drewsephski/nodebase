'use client';
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';
import superjson from 'superjson';
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
  })();
  return `${base}/api/trpc`;
}
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          // Enhanced error handling with detailed logging
          onError: ({ error, path, input, ctx, type }) => {
            console.error('tRPC Error:', {
              error: error.message,
              code: error.code,
              path,
              input,
              type,
              url: getUrl(),
              httpStatus: error.data?.httpStatus,
              stack: error.stack,
            });
          },
          // Retry logic with exponential backoff, avoiding retries on auth errors
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          retryCondition: (error, attemptIndex) => {
            // Don't retry on authentication errors (401, 403)
            if (error.data?.httpStatus === 401 || error.data?.httpStatus === 403) {
              return false;
            }
            // Retry on network errors, 5xx server errors, or other transient issues (up to 3 attempts)
            return (
              attemptIndex < 3 &&
              (error.code === 'INTERNAL_SERVER_ERROR' ||
                error.code === 'TIMEOUT' ||
                !error.data?.httpStatus ||
                error.data.httpStatus >= 500)
            );
          },
          // Custom fetch to detect HTML responses and throw descriptive errors
          fetch: async (input, init) => {
            const response = await fetch(input, init);
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
              throw new Error(
                `Received HTML response instead of JSON from ${input}. This may indicate an authentication error, server error page, or misconfigured API endpoint. Check server logs and authentication state.`
              );
            }
            return response;
          },
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
