"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSuspenseExecutionDetails } from "../hooks/use-executions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExecutionDetailProps {
  executionId: string;
}

export const ExecutionDetail = ({ executionId }: ExecutionDetailProps) => {
  const { data: execution } = useSuspenseExecutionDetails(executionId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "RUNNING":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Execution Details</h1>
          <p className="text-muted-foreground">
            Execution ID: {execution.id}
          </p>
        </div>
        {getStatusBadge(execution.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Workflow
                </label>
                <p className="text-sm">{execution.workflow.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Triggered By
                </label>
                <p className="text-sm">{execution.triggeredBy || "Manual"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Started At
                </label>
                <p className="text-sm">
                  {execution.startedAt
                    ? new Date(execution.startedAt).toLocaleString()
                    : "Not started"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Completed At
                </label>
                <p className="text-sm">
                  {execution.completedAt
                    ? new Date(execution.completedAt).toLocaleString()
                    : "Not completed"}
                </p>
              </div>
            </div>
            {execution.error && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Error
                </label>
                <p className="text-sm text-red-600">{execution.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Steps</CardTitle>
            <CardDescription>
              {execution.steps.length} total steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {execution.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <Badge variant={step.status === "COMPLETED" ? "secondary" : "outline"}>
                    {step.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {step.error ? "Error" : "OK"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {execution.logs.map((log) => (
              <div key={log.id} className="flex gap-2 text-sm">
                <span className="font-mono text-muted-foreground min-w-[100px]">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
                <Badge variant="outline" className="min-w-[60px]">
                  {log.level}
                </Badge>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
