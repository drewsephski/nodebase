import type { NodeExecutor } from "@/features/executions/types";

type manualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<manualTriggerData> = async({
    nodeId,
    context,
    step,
}) => {
    // TODO: publish "loading" state

    const result = await step.run("manual-trigger", async() => context);

    // TODO: publish "success" state
    return result;
}