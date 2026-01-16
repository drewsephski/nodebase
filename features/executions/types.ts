import { GetStepTools, Inngest } from "inngest";
import { Realtime } from "@inngest/realtime"

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams<TData = Record<string, unknown>> {
    data: TData;
    nodeId: string;
    context: WorkflowContext;
    step: StepTools;
    publish: Realtime.PublishFn;
};

export type NodeExecutor<TData = Record<string, unknown>> = (
    params: NodeExecutorParams<TData>,
) => Promise<WorkflowContext>;

