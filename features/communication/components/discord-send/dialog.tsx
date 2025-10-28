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

const discordFormSchema = z.object({
  authMethod: z.enum(["webhook", "bot_token"]),
  webhookUrl: z.string().optional(),
  credentialId: z.string().optional(),
  channel: z.string().optional(),
  messageContent: z.string().min(1, "Message content is required"),
  username: z.string().optional(),
  avatarUrl: z.string().optional(),
  embedJson: z.string().optional(),
}).refine(
  (data) => {
    if (data.authMethod === "bot_token") {
      return data.channel && data.channel.trim().length > 0;
    }
    return true;
  },
  {
    message: "Channel is required when using bot token authentication",
    path: ["channel"],
  }
);

export type DiscordSendFormType = z.infer<typeof discordFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const DiscordSendDialog = ({
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

  const form = useForm<z.infer<typeof discordFormSchema>>({
    resolver: zodResolver(discordFormSchema),
    defaultValues: {
      authMethod: nodeData?.authMethod || "webhook",
      webhookUrl: nodeData?.webhookUrl || "",
      credentialId: nodeData?.credentialId || "",
      channel: nodeData?.channel || "",
      messageContent: nodeData?.messageContent || "",
      username: nodeData?.username || "",
      avatarUrl: nodeData?.avatarUrl || "",
      embedJson: nodeData?.embedJson || "",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        authMethod: nodeData.authMethod || "webhook",
        webhookUrl: nodeData.webhookUrl || "",
        credentialId: nodeData.credentialId || "",
        channel: nodeData.channel || "",
        messageContent: nodeData.messageContent || "",
        username: nodeData.username || "",
        avatarUrl: nodeData.avatarUrl || "",
        embedJson: nodeData.embedJson || "",
      });
    }
  }, [nodeData, open, form]);

  const watchAuthMethod = form.watch("authMethod");
  const watchCredentialId = form.watch("credentialId");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof discordFormSchema>) => {
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
          <DialogTitle>Send Discord Message</DialogTitle>
          <DialogDescription>
            Send a message to a Discord channel via webhook or bot
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="authMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="webhook">Webhook URL</SelectItem>
                      <SelectItem value="bot_token">Bot Token</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchAuthMethod === "webhook" && (
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://discord.com/api/webhooks/..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Discord webhook URL for sending messages
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchAuthMethod === "bot_token" && (
              <>
                <FormField
                  control={form.control}
                  name="credentialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord Bot Credential</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Discord bot credential" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {credentials
                            .filter((cred: any) => cred.type === "BEARER_TOKEN")
                            .map((cred: any) => (
                              <SelectItem key={cred.id} value={cred.id}>
                                {cred.name} ({cred.type})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Bearer Token credential containing Discord bot token
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
                      <FormLabel>Channel ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456789012345678"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Discord channel ID where the message will be sent
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="messageContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello from nodebase! 🚀"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Main message content to send to Discord
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username Override (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="n8n Bot" {...field} />
                  </FormControl>
                  <FormDescription>
                    Override the bot&apos;s username for this message
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom avatar URL for the message author
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embedJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embeds (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`[
  {
    "title": "n8n Workflow",
    "description": "Message sent successfully!",
    "color": 3447003
  }
]`}
                      className="min-h-[100px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Rich embed objects as JSON array (optional)
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
