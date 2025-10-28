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

const emailFormSchema = z.object({
  provider: z.enum(["sendgrid", "mailgun", "smtp"]),
  credentialId: z.string().min(1, "Please select a credential"),
  from: z.string().min(1, "From email is required").refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Please enter a valid email address"
  ),
  to: z.string().min(1, "Recipient email is required").refine(
    (val) => {
      const emails = val.split(',').map(email => email.trim());
      return emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    },
    "Please enter valid email addresses"
  ),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  htmlBody: z.string().optional(),
  attachments: z.string().optional(),
});

export type EmailSendFormType = z.infer<typeof emailFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const EmailSendDialog = ({
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

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      provider: nodeData?.provider || "sendgrid",
      credentialId: nodeData?.credentialId || "",
      from: nodeData?.from || "",
      to: nodeData?.to || "",
      cc: nodeData?.cc || "",
      bcc: nodeData?.bcc || "",
      subject: nodeData?.subject || "",
      body: nodeData?.body || "",
      htmlBody: nodeData?.htmlBody || "",
      attachments: nodeData?.attachments || "",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        provider: nodeData.provider || "sendgrid",
        credentialId: nodeData.credentialId || "",
        from: nodeData.from || "",
        to: nodeData.to || "",
        cc: nodeData.cc || "",
        bcc: nodeData.bcc || "",
        subject: nodeData.subject || "",
        body: nodeData.body || "",
        htmlBody: nodeData.htmlBody || "",
        attachments: nodeData.attachments || "",
      });
    }
  }, [nodeData, open, form]);

  const watchCredentialId = form.watch("credentialId");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof emailFormSchema>) => {
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Send an email using SMTP or email service API
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Email service provider to use for sending
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an email credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials
                        .filter((cred: any) => cred.type === "API_KEY" || cred.type === "CUSTOM" || cred.type === "SMTP")
                        .map((cred: any) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.name} ({cred.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    API Key credential for email service (SendGrid, Mailgun, etc.) or SMTP configuration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Input placeholder="sender@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email address that will appear as the sender
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="recipient@example.com, another@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of recipient email addresses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CC (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="cc@example.com, another@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of CC email addresses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bcc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BCC (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="bcc@example.com, another@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of BCC email addresses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject line" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Body (Text)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Plain text email content..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Plain text version of the email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="htmlBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTML Body (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="<p>Email content with <strong>HTML formatting</strong>...</p>"
                      className="min-h-[120px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    HTML version of the email (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="attachment1.pdf, https://example.com/file.pdf" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of file paths or URLs to attach
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
