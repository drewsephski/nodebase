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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { Plus, Trash2 } from "lucide-react";

const conditionSchema = z.object({
  fieldPath: z.string().min(1, "Field path is required"),
  operator: z.enum(["equals", "not_equals", "contains", "greater_than", "less_than", "exists", "regex"]),
  value: z.string(),
});

const ifConditionFormSchema = z.object({
  combineConditions: z.enum(["AND", "OR"]),
  conditions: z.array(conditionSchema).min(1, "At least one condition is required"),
});

export type IfConditionFormType = z.infer<typeof ifConditionFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const IfConditionDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof ifConditionFormSchema>>({
    resolver: zodResolver(ifConditionFormSchema),
    defaultValues: {
      combineConditions: nodeData?.combineConditions || "AND",
      conditions: nodeData?.conditions || [{ fieldPath: "", operator: "equals", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        combineConditions: nodeData.combineConditions || "AND",
        conditions: nodeData.conditions || [{ fieldPath: "", operator: "equals", value: "" }],
      });
    }
  }, [nodeData, open, form]);

  const handleSubmit = (values: z.infer<typeof ifConditionFormSchema>) => {
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

  const addCondition = () => {
    append({ fieldPath: "", operator: "equals", value: "" });
  };

  const removeCondition = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>IF Condition</DialogTitle>
          <DialogDescription>
            Route workflow execution based on conditions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="combineConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Combine Conditions</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AND">AND - All conditions must match</SelectItem>
                      <SelectItem value="OR">OR - Any condition can match</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Conditions</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Condition {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name={`conditions.${index}.fieldPath`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Path</FormLabel>
                          <FormControl>
                            <Input placeholder="$.status or data.items[0].active" {...field} />
                          </FormControl>
                          <FormDescription>
                            Path to the field to check
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`conditions.${index}.operator`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operator</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="equals">equals</SelectItem>
                              <SelectItem value="not_equals">not equals</SelectItem>
                              <SelectItem value="contains">contains</SelectItem>
                              <SelectItem value="greater_than">greater than</SelectItem>
                              <SelectItem value="less_than">less than</SelectItem>
                              <SelectItem value="exists">exists</SelectItem>
                              <SelectItem value="regex">regex match</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`conditions.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Input placeholder="expected value" {...field} />
                          </FormControl>
                          <FormDescription>
                            Value to compare against
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>How it works:</strong> If all conditions are met (based on your selected combination),
                the workflow will continue through the &quot;true&quot; output. Otherwise, it will go through the "false" output.
              </p>
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
