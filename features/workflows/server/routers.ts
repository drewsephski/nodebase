import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { protectedProcedure } from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";
import prisma from "@/lib/db";
import { PAGINATION } from "@/config/constants";
import { Node, Edge } from "@xyflow/react";
import { Prisma } from "@/lib/generated/prisma";
import { NodeType } from "@/lib/generated/prisma";
import { ExecutionEngine } from "@/lib/execution-engine";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const workFlowRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      await inngest.send({
        name: "workflows/execute.workflow",
        data: {
          workflowId: input.id,
        },
      });

      return workflow;
      // TODO: Execute workflow
  }),
  create: protectedProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: {
          userId: ctx.auth.user.id,
          id: input.id,
        },
      });

      if (!workflow) {
        return { success: false, message: "Workflow not found" };
      }

      await prisma.workflow.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true, message: "Workflow deleted successfully" };
    }),

  updateNodes: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      return await prisma.$transaction(async (tx) => {
        await tx.node.deleteMany({
          where: {
            workflowId: id,
          },
        });
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
            name: node.type || "",
            workflowId: id,
          })),
        });

        await tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        return workflow;
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          userId: ctx.auth.user.id,
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          })
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      return await prisma.$transaction(async (tx) => {
        await tx.node.deleteMany({
          where: {
            workflowId: id,
          },
        });
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
            name: node.type || "",
            workflowId: id,
          })),
        });

        await tx.connection.deleteMany({
          where: {
            workflow: id,
          },
        });
        await tx.connection.createMany({
          data: edges.map((edge) => ({
            workflow: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle || "main",
            toInput: edge.targetHandle || "main",
          })),
        });

        return await tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
        });
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),

  getMany: baseProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async (opts) => {
      const { page, pageSize, search } = opts.input;
      
      // Get fresh session from auth
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      // If user is not authenticated, return empty list
      if (!session?.user) {
        return {
          items: [],
          page: 1,
          pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: session.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: session.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        console.log("DATABASE_URL available:", !!process.env.DATABASE_URL);
        console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);

        // Verify workflow ownership
        const workflow = await prisma.workflow.findUnique({
          where: {
            id,
            userId: ctx.auth.user.id,
          },
        });

        if (!workflow) {
          throw new Error("Workflow not found");
        }

        // Check if prisma client is available
        if (!prisma) {
          throw new Error("Database connection not available");
        }

        // Create execution engine and run workflow
        const engine = await ExecutionEngine.createExecution(id, ctx.auth.user.id, "manual", prisma);
        await engine.executeWorkflow();

        return { success: true };
      } catch (error) {
        console.error("Workflow execution error:", error);
        throw error;
      }
    }),

  getExecutions: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      })
    )
    .query(async ({ ctx, input }) => {
      const { workflowId, page, pageSize } = input;

      // Verify workflow ownership
      const workflow = await prisma.workflow.findUnique({
        where: {
          id: workflowId,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const [executions, totalCount] = await Promise.all([
        prisma.execution.findMany({
          where: { workflowId },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            steps: true,
            logs: {
              orderBy: { createdAt: "asc" },
              take: 10, // Limit logs for performance
            },
          },
        }),
        prisma.execution.count({
          where: { workflowId },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        executions,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  triggerWebhook: protectedProcedure
    .input(z.object({ id: z.string(), data: z.record(z.string(), z.unknown()).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // Verify workflow ownership
      const workflow = await prisma.workflow.findUnique({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Enqueue the webhook execution
      const { ExecutionQueue } = await import("@/lib/execution-queue");
      const queue = new ExecutionQueue(prisma);
      const jobId = await queue.enqueueJob({
        workflowId: id,
        userId: ctx.auth.user.id,
        triggerType: "webhook",
        webhookData: data,
      });

      return { jobId, message: "Workflow execution queued via webhook" };
    }),

  triggerSchedule: protectedProcedure
    .input(z.object({ id: z.string(), scheduledAt: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const { id, scheduledAt } = input;

      // Verify workflow ownership
      const workflow = await prisma.workflow.findUnique({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Enqueue the scheduled execution
      const { ExecutionQueue } = await import("@/lib/execution-queue");
      const queue = new ExecutionQueue(prisma);
      const jobId = await queue.enqueueJob({
        workflowId: id,
        userId: ctx.auth.user.id,
        triggerType: "schedule",
        scheduledAt,
      });

      return { jobId, message: "Workflow execution scheduled" };
    }),
});
