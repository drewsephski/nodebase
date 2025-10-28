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

const mergeFormSchema = z.object({
  mergeMode: z.enum(["append", "merge", "combine"]),
  joinKey: z.string().optional(),
  outputFormat: z.enum(["array", "object"]),
});

export type MergeFormType = z.infer<typeof mergeFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const MergeDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof mergeFormSchema>>({
    resolver: zodResolver(mergeFormSchema),
    defaultValues: {
      mergeMode: nodeData?.mergeMode || "append",
      joinKey: nodeData?.joinKey || "",
      outputFormat: nodeData?.outputFormat || "array",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        mergeMode: nodeData.mergeMode || "append",
        joinKey: nodeData.joinKey || "",
        outputFormat: nodeData.outputFormat || "array",
      });
    }
  }, [nodeData, open, form]);

  const watchMergeMode = form.watch("mergeMode");

  const handleSubmit = (values: z.infer<typeof mergeFormSchema>) => {
    // Update node data
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...values } }
          : node
      )
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Merge Data</DialogTitle>
          <DialogDescription>
            Combine data from multiple input sources
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mergeMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merge Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="append">Append Arrays</SelectItem>
                      <SelectItem value="merge">Merge by Key</SelectItem>
                      <SelectItem value="combine">Combine Objects</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchMergeMode === "merge" && (
              <FormField
                control={form.control}
                name="joinKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Key</FormLabel>
                    <FormControl>
                      <Input placeholder="id or userId" {...field} />
                    </FormControl>
                    <FormDescription>
                      Field name to merge objects by (e.g., "id", "userId")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="outputFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Format</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format of the merged output data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Append Arrays:</strong> Combines multiple arrays into one array</p>
                <p><strong>Merge by Key:</strong> Merges objects with matching key values</p>
                <p><strong>Combine Objects:</strong> Merges all input objects into a single object</p>
              </div>
            </div>

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
