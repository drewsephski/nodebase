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

const delayFormSchema = z.object({
  delayType: z.enum(["fixed", "specific_time"]),
  durationValue: z.coerce.number().min(1, "Duration must be at least 1"),
  durationUnit: z.enum(["milliseconds", "seconds", "minutes", "hours"]),
  specificTime: z.string().optional(),
});

export type DelayFormType = z.infer<typeof delayFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const DelayDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof delayFormSchema>>({
    resolver: zodResolver(delayFormSchema),
    defaultValues: {
      delayType: nodeData?.delayType || "fixed",
      durationValue: nodeData?.durationValue || 1,
      durationUnit: nodeData?.durationUnit || "minutes",
      specificTime: nodeData?.specificTime || "",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        delayType: nodeData.delayType || "fixed",
        durationValue: nodeData.durationValue || 1,
        durationUnit: nodeData.durationUnit || "minutes",
        specificTime: nodeData.specificTime || "",
      });
    }
  }, [nodeData, open, form]);

  const watchDelayType = form.watch("delayType");

  const handleSubmit = (values: z.infer<typeof delayFormSchema>) => {
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
          <DialogTitle>Delay</DialogTitle>
          <DialogDescription>
            Wait for a specified duration or until a specific time
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="delayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delay Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Duration</SelectItem>
                      <SelectItem value="specific_time">Until Specific Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchDelayType === "fixed" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durationValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="milliseconds">Milliseconds</SelectItem>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {watchDelayType === "specific_time" && (
              <FormField
                control={form.control}
                name="specificTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Wait until this specific date and time
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
