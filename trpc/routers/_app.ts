import { createTRPCRouter, protectedProcedure, premiumProcedure} from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
    testAi: premiumProcedure.mutation(async () => {
        await inngest.send({
            name: "execute/ai",
        });

        return { success: true, message: "Job Queued" };
    }),
    getWorkflows: protectedProcedure.query(({ ctx }) => {
        return prisma.workflow.findMany();
    }),
    createWorkflow: protectedProcedure.mutation(async () => {
        try {
            await inngest.send({
                name: 'test/hello.world',
                data: {
                    email: 'drewsepeczi@gmail.com',
                },
            });
            return { success: true, message: "Job Queued" };
        } catch (error) {
            console.error('Failed to send inngest event:', error);
            // For now, just return success without inngest
            return { success: true, message: "Workflow creation simulated (inngest unavailable)" };
        }
    }),
});
export type AppRouter = typeof appRouter; 