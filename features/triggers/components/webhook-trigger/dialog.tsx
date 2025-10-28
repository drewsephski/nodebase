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
import { Checkbox } from "@/components/ui/checkbox";
import { useReactFlow } from "@xyflow/react";

export type WebhookTriggerFormType = z.infer<typeof webhookFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

const webhookFormSchema = z.object({
  webhookPath: z.string().min(1, "Webhook path is required").default("/webhook"),
  methods: z.array(z.enum(["GET", "POST", "PUT", "DELETE"])).min(1, "At least one method must be selected"),
  authType: z.enum(["NONE", "API_KEY", "BEARER_TOKEN"]),
  responseTemplate: z.string().default('{"status": "received"}'),
});

export const WebhookTriggerDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      webhookPath: nodeData?.webhookPath || "/webhook",
      methods: nodeData?.methods || ["POST"],
      authType: nodeData?.authType || "NONE",
      responseTemplate: nodeData?.responseTemplate || '{"status": "received"}',
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        webhookPath: nodeData.webhookPath || "/webhook",
        methods: nodeData.methods || ["POST"],
        authType: nodeData.authType || "NONE",
        responseTemplate: nodeData.responseTemplate || '{"status": "received"}',
      });
    }
  }, [nodeData, open, form]);

  const handleSubmit = (values: z.infer<typeof webhookFormSchema>) => {
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
          <DialogTitle>Webhook Trigger</DialogTitle>
          <DialogDescription>
            Configure webhook endpoint to receive HTTP requests
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="webhookPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Path</FormLabel>
                  <FormControl>
                    <Input placeholder="/webhook" {...field} />
                  </FormControl>
                  <FormDescription>
                    The path where the webhook will be accessible (e.g., /my-webhook)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="methods"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">HTTP Methods</FormLabel>
                    <FormDescription>
                      Select which HTTP methods this webhook should accept
                    </FormDescription>
                  </div>
                  {["GET", "POST", "PUT", "DELETE"].map((method) => (
                    <FormField
                      key={method}
                      control={form.control}
                      name="methods"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={method}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(method)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, method])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== method
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {method}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authentication type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">No Authentication</SelectItem>
                      <SelectItem value="API_KEY">API Key</SelectItem>
                      <SelectItem value="BEARER_TOKEN">Bearer Token</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Authentication method for webhook requests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responseTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Template</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[80px] p-2 border rounded-md font-mono text-sm"
                      placeholder='{"status": "received", "timestamp": "{{timestamp}}"}'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    JSON response template sent back to webhook caller
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
