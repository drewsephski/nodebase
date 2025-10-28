"use client";

import { useSuspenseExecutions } from "@/features/workflows/hooks/use-workflows";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, PlayIcon } from "lucide-react";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircleIcon className="size-4 text-green-500" />;
    case "FAILED":
      return <XCircleIcon className="size-4 text-red-500" />;
    case "RUNNING":
      return <PlayIcon className="size-4 text-blue-500" />;
    case "PENDING":
      return <ClockIcon className="size-4 text-gray-500" />;
    case "CANCELLED":
      return <AlertCircleIcon className="size-4 text-orange-500" />;
    default:
      return <ClockIcon className="size-4 text-gray-500" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "FAILED":
      return "destructive";
    case "RUNNING":
      return "secondary";
    case "PENDING":
      return "outline";
    case "CANCELLED":
      return "outline";
    default:
      return "outline";
  }
};

export const ExecutionHistory = ({ workflowId }: { workflowId: string }) => {
  const { data: executionsData } = useSuspenseExecutions(workflowId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayIcon className="size-5" />
          Execution History
        </CardTitle>
        <CardDescription>
          Recent workflow executions and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {executionsData.executions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No executions yet. Click &quot;Run&quot; to execute this workflow.
            </div>
          ) : (
            <div className="space-y-4">
              {executionsData.executions.map((execution) => (
                <div key={execution.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className="font-medium">
                        Execution #{execution.id.slice(-8)}
                      </span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-3" />
                      Started {formatDistanceToNow(new Date(execution.createdAt))} ago
                    </div>
                    {execution.startedAt && (
                      <div className="flex items-center gap-2">
                        <PlayIcon className="size-3" />
                        Running for {formatDistanceToNow(new Date(execution.startedAt))}
                      </div>
                    )}
                    {execution.completedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="size-3" />
                        Completed {formatDistanceToNow(new Date(execution.completedAt))} ago
                      </div>
                    )}
                  </div>

                  {execution.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-2">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Error: {execution.error}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Triggered by: {execution.triggeredBy || "manual"}
                  </div>

                  {execution.steps.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Steps:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {execution.steps.slice(0, 6).map((step) => (
                          <Badge
                            key={step.id}
                            variant={step.status === "COMPLETED" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {step.nodeId.slice(-6)}: {step.status}
                          </Badge>
                        ))}
                        {execution.steps.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{execution.steps.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {execution.logs.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Recent Logs:</p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {execution.logs.slice(0, 3).map((log) => (
                          <div key={log.id} className="text-xs bg-muted p-1 rounded">
                            <span className={`font-medium ${
                              log.level === "ERROR" ? "text-red-600" :
                              log.level === "WARN" ? "text-orange-600" :
                              "text-muted-foreground"
                            }`}>
                              {log.level}:
                            </span>{" "}
                            {log.message}
                          </div>
                        ))}
                        {execution.logs.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{execution.logs.length - 3} more logs
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
