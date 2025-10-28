import { createTRPCRouter } from '../init';
import { workFlowRouter } from '@/features/workflows/server/routers';
import { credentialsRouter } from '@/features/credentials/server/routers';
import { workflowGeneratorRouter } from '@/features/ai/server/workflow-generator';

export const appRouter = createTRPCRouter({
    workflows: workFlowRouter,
    credentials: credentialsRouter,
    ai: workflowGeneratorRouter,
});

export type AppRouter = typeof appRouter; 
