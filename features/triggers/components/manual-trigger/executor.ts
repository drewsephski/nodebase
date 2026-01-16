import type { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type manualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<manualTriggerData> = async({
    nodeId,
    context,
    step,
    publish,
}) => {
    console.log(`Manual Trigger Executor - Node ID: ${nodeId}`);

    // Publish loading state
    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    const result = await step.run("manual-trigger", async() => context);

    // Publish success state
    await publish(
        manualTriggerChannel().status({
            nodeId,
            status: "success",
        }),
    );

    return result;
}