"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const postgresFormSchema = z.object({
  credentialId: z.string().min(1, "Please select a database credential"),
  operation: z.enum(["select", "insert", "update", "delete"]),
  query: z.string().min(1, "SQL query is required"),
  parameters: z.string().optional(),
  returnMode: z.enum(["all_rows", "first_row", "row_count"]),
});

export type PostgresQueryFormType = z.infer<typeof postgresFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const PostgresQueryDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  // Fetch available credentials
  const { data: credentials = [] } = useQuery({
    queryKey: ["credentials"],
    queryFn: async () => {
      const response = await fetch("/api/trpc/credentials.list");
      const data = await response.json();
      return data.result?.data || [];
    },
  });

  const form = useForm<z.infer<typeof postgresFormSchema>>({
    resolver: zodResolver(postgresFormSchema),
    defaultValues: {
      credentialId: nodeData?.credentialId || "",
      operation: nodeData?.operation || "select",
      query: nodeData?.query || "",
      parameters: nodeData?.parameters || "",
      returnMode: nodeData?.returnMode || "all_rows",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        credentialId: nodeData.credentialId || "",
        operation: nodeData.operation || "select",
        query: nodeData.query || "",
        parameters: nodeData.parameters || "",
        returnMode: nodeData.returnMode || "all_rows",
      });
    }
  }, [nodeData, open, form]);

  const watchCredentialId = form.watch("credentialId");
  const watchOperation = form.watch("operation");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof postgresFormSchema>) => {
    // Update node data
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...values,
                credentialName: selectedCredential?.name || "Unknown credential"
              }
            }
          : node
      )
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PostgreSQL Query</DialogTitle>
          <DialogDescription>
            Execute SQL queries against a PostgreSQL database
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Only use parameterized queries to prevent SQL injection attacks.
                Never concatenate user input directly into SQL strings.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a database credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials
                        .filter((cred: any) => cred.type === "DATABASE")
                        .map((cred: any) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.name} ({cred.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Database credential containing PostgreSQL connection details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="select">Execute Query (SELECT)</SelectItem>
                      <SelectItem value="insert">Insert Data</SelectItem>
                      <SelectItem value="update">Update Data</SelectItem>
                      <SelectItem value="delete">Delete Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SQL Query</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={watchOperation === "select"
                        ? "SELECT * FROM users WHERE id = $1"
                        : "INSERT INTO users (name, email) VALUES ($1, $2)"
                      }
                      className="min-h-[120px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    SQL query to execute. Use $1, $2, etc. for parameters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchOperation === "insert" || watchOperation === "update") && (
              <FormField
                control={form.control}
                name="parameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameters (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='["John Doe", "john@example.com"]'
                        className="min-h-[80px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      JSON array of parameters for the query (e.g., ["value1", "value2"])
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="returnMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_rows">All Rows</SelectItem>
                      <SelectItem value="first_row">First Row</SelectItem>
                      <SelectItem value="row_count">Row Count</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    What data to return from the query result
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
