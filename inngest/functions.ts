import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { NodeType } from "@/lib/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";

export const executeWorkflow = inngest.createFunction(
    { 
        id: "execute-workflow",
        retries: 0, //TODO: fix
    },
    { 
        event: "workflows/execute.workflow",
        channels: [
            httpRequestChannel(),
            manualTriggerChannel(),
        ] },
    async ({ event, step, publish }) => {
        const workflowId = event.data.workflowId;

        if (!workflowId) {
            throw new NonRetriableError("Workflow ID is missing");
        }

        const sortedNodes = await step.run("prepare-workflow", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: {
                    id: workflowId,
                },
                include: {
                    nodes: true,
                    connections: true,
                },
            });

            // Transform database nodes to React Flow nodes
            const reactFlowNodes = workflow.nodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position as { x: number; y: number },
                data: (node.data as Record<string, unknown>) || {},
            }));

            // Transform database connections to React Flow edges
            const reactFlowConnections = workflow.connections.map((connection) => ({
                id: connection.id,
                source: connection.fromNodeId,
                target: connection.toNodeId,
                sourceHandle: connection.fromOutput,
                targetHandle: connection.toInput,
            }));

            return topologicalSort(reactFlowNodes, reactFlowConnections);
        });

        let context = event.data.initialData || {};

        for (const node of sortedNodes) {
            console.log(`Executing node: ${node.id}, type: ${node.type}`);
            const executor = getExecutor(node.type as NodeType);
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step,
                publish,
            });
        }

        return { 
            workflowId,
            result: context,
            
         };
    },
);