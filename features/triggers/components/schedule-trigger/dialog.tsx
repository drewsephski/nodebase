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

// Simple cron validation - basic regex for common patterns
const cronRegex = /^(\*|([0-5]?[0-9])|\*\/([1-9]|[1-5][0-9])) (\*|([0-5]?[0-9])|\*\/([1-9]|[1-5][0-9])) (\*|([0-5]?[0-9])|\*\/([1-9]|[1-5][0-9])) (\*|([0-5]?[0-9])|\*\/([1-9]|[1-5][0-9])) (\*|([0-5]?[0-9])|\*\/([1-9]|[1-5][0-9]))$/;

const scheduleFormSchema = z.object({
  scheduleType: z.enum(["cron", "interval", "specific_time"]),
  cronExpression: z.string().refine((val) => cronRegex.test(val), {
    message: "Invalid cron expression",
  }),
  intervalValue: z.coerce.number().min(1, "Must be at least 1"),
  intervalUnit: z.enum(["seconds", "minutes", "hours", "days"]),
  timezone: z.string().default("UTC"),
});

export type ScheduleTriggerFormType = z.infer<typeof scheduleFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const ScheduleTriggerDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      scheduleType: nodeData?.scheduleType || "cron",
      cronExpression: nodeData?.cronExpression || "0 0 * * *",
      intervalValue: nodeData?.intervalValue || 1,
      intervalUnit: nodeData?.intervalUnit || "hours",
      timezone: nodeData?.timezone || "UTC",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        scheduleType: nodeData.scheduleType || "cron",
        cronExpression: nodeData.cronExpression || "0 0 * * *",
        intervalValue: nodeData.intervalValue || 1,
        intervalUnit: nodeData.intervalUnit || "hours",
        timezone: nodeData.timezone || "UTC",
      });
    }
  }, [nodeData, open, form]);

  const watchScheduleType = form.watch("scheduleType");

  const handleSubmit = (values: z.infer<typeof scheduleFormSchema>) => {
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
          <DialogTitle>Schedule Trigger</DialogTitle>
          <DialogDescription>
            Configure when this workflow should run automatically
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="scheduleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cron">Cron Expression</SelectItem>
                      <SelectItem value="interval">Interval</SelectItem>
                      <SelectItem value="specific_time">Specific Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchScheduleType === "cron" && (
              <FormField
                control={form.control}
                name="cronExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cron Expression</FormLabel>
                    <FormControl>
                      <Input placeholder="0 0 * * *" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cron expression (minute hour day month weekday). Examples:
                      <br />• <code>0 0 * * *</code> - Every day at midnight
                      <br />• <code>*/30 * * * *</code> - Every 30 minutes
                      <br />• <code>0 9 * * 1-5</code> - Weekdays at 9 AM
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchScheduleType === "interval" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="intervalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intervalUnit"
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
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Timezone for schedule execution
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
