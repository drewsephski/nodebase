import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    userId: session?.user?.id || null,
    session,
  };
});
const t = initTRPC.create({
});
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
const session = await auth.api.getSession({
  headers: await headers(),
})
if (!session) {
  throw new TRPCError({ code: 'UNAUTHORIZED',
    message: 'Unauthorized',
   });
}
    return next({ctx: { ...ctx, auth: session }});
});