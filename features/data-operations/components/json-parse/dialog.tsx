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

const jsonParseFormSchema = z.object({
  operation: z.enum(["parse", "stringify", "extract", "transform"]),
  jsonPath: z.string().optional(),
  transformationRules: z.string().optional(),
  errorHandling: z.enum(["fail", "skip", "default_value"]),
  defaultValue: z.string().optional(),
});

export type JsonParseFormType = z.infer<typeof jsonParseFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const JsonParseDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof jsonParseFormSchema>>({
    resolver: zodResolver(jsonParseFormSchema),
    defaultValues: {
      operation: nodeData?.operation || "parse",
      jsonPath: nodeData?.jsonPath || "",
      transformationRules: nodeData?.transformationRules || "",
      errorHandling: nodeData?.errorHandling || "fail",
      defaultValue: nodeData?.defaultValue || "",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        operation: nodeData.operation || "parse",
        jsonPath: nodeData.jsonPath || "",
        transformationRules: nodeData.transformationRules || "",
        errorHandling: nodeData.errorHandling || "fail",
        defaultValue: nodeData.defaultValue || "",
      });
    }
  }, [nodeData, open, form]);

  const watchOperation = form.watch("operation");
  const watchErrorHandling = form.watch("errorHandling");

  const handleSubmit = (values: z.infer<typeof jsonParseFormSchema>) => {
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
          <DialogTitle>JSON Operations</DialogTitle>
          <DialogDescription>
            Parse, transform, and extract data from JSON
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      <SelectItem value="parse">Parse JSON String</SelectItem>
                      <SelectItem value="stringify">Convert to JSON String</SelectItem>
                      <SelectItem value="extract">Extract Path</SelectItem>
                      <SelectItem value="transform">Transform JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchOperation === "extract" || watchOperation === "transform") && (
              <FormField
                control={form.control}
                name="jsonPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchOperation === "extract" ? "JSON Path" : "JSON Path (Optional)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="$.data.items or data.items[0].name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      JSONPath expression to extract data (e.g., $.data.items)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchOperation === "transform" && (
              <FormField
                control={form.control}
                name="transformationRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transformation Rules</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`{
  "newField": "$.oldField",
  "formattedDate": "{{dateFormat $.timestamp 'YYYY-MM-DD'}}",
  "items": "$.items[*].name"
}`}
                        className="min-h-[100px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      JSON transformation rules or JSONata expressions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="errorHandling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error Handling</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fail">Fail on Error</SelectItem>
                      <SelectItem value="skip">Skip on Error</SelectItem>
                      <SelectItem value="default_value">Use Default Value</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchErrorHandling === "default_value" && (
              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input placeholder="null or {} or []" {...field} />
                    </FormControl>
                    <FormDescription>
                      Default value to use when operation fails
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
