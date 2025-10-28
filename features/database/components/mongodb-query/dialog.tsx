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

const mongodbFormSchema = z.object({
  credentialId: z.string().min(1, "Please select a database credential"),
  collection: z.string().min(1, "Collection name is required"),
  operation: z.enum(["find", "insert", "update", "delete", "aggregate"]),
  query: z.string().optional(),
  options: z.string().optional(),
});

export type MongoDBQueryFormType = z.infer<typeof mongodbFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const MongoDBQueryDialog = ({
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

  const form = useForm<z.infer<typeof mongodbFormSchema>>({
    resolver: zodResolver(mongodbFormSchema),
    defaultValues: {
      credentialId: nodeData?.credentialId || "",
      collection: nodeData?.collection || "",
      operation: nodeData?.operation || "find",
      query: nodeData?.query || "",
      options: nodeData?.options || "",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        credentialId: nodeData.credentialId || "",
        collection: nodeData.collection || "",
        operation: nodeData.operation || "find",
        query: nodeData.query || "",
        options: nodeData.options || "",
      });
    }
  }, [nodeData, open, form]);

  const watchCredentialId = form.watch("credentialId");
  const watchOperation = form.watch("operation");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof mongodbFormSchema>) => {
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
          <DialogTitle>MongoDB Query</DialogTitle>
          <DialogDescription>
            Execute operations against a MongoDB collection
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    Database credential containing MongoDB connection details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="users" {...field} />
                  </FormControl>
                  <FormDescription>
                    MongoDB collection to operate on
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
                      <SelectItem value="find">Find Documents</SelectItem>
                      <SelectItem value="insert">Insert Document(s)</SelectItem>
                      <SelectItem value="update">Update Documents</SelectItem>
                      <SelectItem value="delete">Delete Documents</SelectItem>
                      <SelectItem value="aggregate">Aggregate Pipeline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchOperation === "find" || watchOperation === "update" || watchOperation === "delete" || watchOperation === "aggregate") && (
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchOperation === "find" ? "Filter Query (JSON)" :
                       watchOperation === "update" ? "Filter Query (JSON)" :
                       watchOperation === "delete" ? "Filter Query (JSON)" :
                       "Aggregate Pipeline (JSON)"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={watchOperation === "find"
                          ? '{"name": "John", "age": {"$gte": 18}}'
                          : watchOperation === "update"
                          ? '{"name": "John"}'
                          : watchOperation === "delete"
                          ? '{"status": "inactive"}'
                          : '[{"$match": {"status": "active"}}, {"$group": {"_id": "$category", "count": {"$sum": 1}}} ]'
                        }
                        className="min-h-[100px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchOperation === "aggregate"
                        ? "MongoDB aggregation pipeline as JSON array"
                        : "MongoDB query filter as JSON object"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchOperation === "insert" && (
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document(s) to Insert (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"name": "John Doe", "email": "john@example.com", "age": 30}'
                        className="min-h-[100px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Single document or array of documents to insert
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchOperation === "update" && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Update Operation (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"$set": {"status": "active", "updatedAt": new Date()}}'
                        className="min-h-[80px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      MongoDB update operation (e.g., {`{"$set": {...}, "$inc": {...}}`})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(watchOperation === "find" || watchOperation === "aggregate") && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Options (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={watchOperation === "find"
                          ? '{"sort": {"createdAt": -1}, "limit": 10, "projection": {"password": 0}}'
                          : '{"allowDiskUse": true, "maxTimeMS": 10000}'
                        }
                        className="min-h-[80px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchOperation === "find"
                        ? "Query options (sort, limit, projection, etc.)"
                        : "Aggregation options (allowDiskUse, maxTimeMS, etc.)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
