import { useQueryStates } from "nuqs";
import { executionsParams } from "../params";

export const useExecutionParams = () => useQueryStates(executionsParams);
