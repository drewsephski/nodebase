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
import { Slider } from "@/components/ui/slider";
import { useReactFlow } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";

const anthropicFormSchema = z.object({
  credentialId: z.string().min(1, "Please select a credential"),
  model: z.enum(["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"]),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  temperature: z.coerce.number().min(0).max(1).default(1),
  maxTokens: z.coerce.number().min(1).max(4096).default(1000),
});

export type AnthropicChatFormType = z.infer<typeof anthropicFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const AnthropicChatDialog = ({
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

  const form = useForm<z.infer<typeof anthropicFormSchema>>({
    resolver: zodResolver(anthropicFormSchema),
    defaultValues: {
      credentialId: nodeData?.credentialId || "",
      model: nodeData?.model || "claude-3-5-sonnet-20241022",
      systemPrompt: nodeData?.systemPrompt || "",
      userPrompt: nodeData?.userPrompt || "",
      temperature: nodeData?.temperature || 1,
      maxTokens: nodeData?.maxTokens || 1000,
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        credentialId: nodeData.credentialId || "",
        model: nodeData.model || "claude-3-5-sonnet-20241022",
        systemPrompt: nodeData.systemPrompt || "",
        userPrompt: nodeData.userPrompt || "",
        temperature: nodeData.temperature || 1,
        maxTokens: nodeData.maxTokens || 1000,
      });
    }
  }, [nodeData, open, form]);

  const watchCredentialId = form.watch("credentialId");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof anthropicFormSchema>) => {
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
          <DialogTitle>Anthropic Claude Chat</DialogTitle>
          <DialogDescription>
            Generate text using Anthropic's Claude models
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anthropic Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Anthropic API credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials
                        .filter((cred: any) => cred.type === "API_KEY")
                        .map((cred: any) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.name} ({cred.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    API Key credential for Anthropic authentication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Anthropic Claude model to use for generation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    System message to set the behavior of the assistant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Generate a summary of the following text..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main prompt for the Claude model
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Controls randomness (0 = deterministic, 1 = very random)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="4096" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum length of the response
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
