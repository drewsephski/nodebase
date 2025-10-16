import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params";

export const useWorkflowParams = () => {
    return useQueryStates(workflowsParams);
};