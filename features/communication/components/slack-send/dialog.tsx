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

const slackFormSchema = z.object({
  credentialId: z.string().min(1, "Please select a credential"),
  channel: z.string().min(1, "Channel is required"),
  messageType: z.enum(["text", "blocks"]),
  messageText: z.string().min(1, "Message text is required"),
  blocksJson: z.string().optional(),
});

export type SlackSendFormType = z.infer<typeof slackFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const SlackSendDialog = ({
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

  const form = useForm<z.infer<typeof slackFormSchema>>({
    resolver: zodResolver(slackFormSchema),
    defaultValues: {
      credentialId: nodeData?.credentialId || "",
      channel: nodeData?.channel || "#general",
      messageType: nodeData?.messageType || "text",
      messageText: nodeData?.messageText || "",
      blocksJson: nodeData?.blocksJson || "",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        credentialId: nodeData.credentialId || "",
        channel: nodeData.channel || "#general",
        messageType: nodeData.messageType || "text",
        messageText: nodeData.messageText || "",
        blocksJson: nodeData.blocksJson || "",
      });
    }
  }, [nodeData, open, form]);

  const watchMessageType = form.watch("messageType");
  const watchCredentialId = form.watch("credentialId");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof slackFormSchema>) => {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Slack Message</DialogTitle>
          <DialogDescription>
            Send a message to a Slack channel or user
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slack Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Slack credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials
                        .filter((cred: any) => cred.type === "API_KEY" || cred.type === "BEARER_TOKEN")
                        .map((cred: any) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.name} ({cred.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    API Key or Bearer Token credential for Slack authentication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <FormControl>
                    <Input placeholder="#general or @username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Slack channel (e.g., #general) or user (e.g., @username)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Simple Text</SelectItem>
                      <SelectItem value="blocks">Blocks (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchMessageType === "text" && (
              <FormField
                control={form.control}
                name="messageText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hello from n8n! 🚀"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Message text to send to Slack
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchMessageType === "blocks" && (
              <FormField
                control={form.control}
                name="blocksJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blocks JSON</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`[
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Hello from n8n! 🚀"
    }
  }
]`}
                        className="min-h-[150px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Slack Blocks JSON for rich message formatting
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
