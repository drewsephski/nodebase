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

const openAIFormSchema = z.object({
  credentialId: z.string().min(1, "Please select a credential"),
  model: z.enum(["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  temperature: z.coerce.number().min(0).max(2).default(1),
  maxTokens: z.coerce.number().min(1).max(4096).default(1000),
  responseFormat: z.enum(["text", "json_object"]),
});

export type OpenAIChatFormType = z.infer<typeof openAIFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const OpenAIChatDialog = ({
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

  const form = useForm<z.infer<typeof openAIFormSchema>>({
    resolver: zodResolver(openAIFormSchema),
    defaultValues: {
      credentialId: nodeData?.credentialId || "",
      model: nodeData?.model || "gpt-4o",
      systemPrompt: nodeData?.systemPrompt || "",
      userPrompt: nodeData?.userPrompt || "",
      temperature: nodeData?.temperature || 1,
      maxTokens: nodeData?.maxTokens || 1000,
      responseFormat: nodeData?.responseFormat || "text",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        credentialId: nodeData.credentialId || "",
        model: nodeData.model || "gpt-4o",
        systemPrompt: nodeData.systemPrompt || "",
        userPrompt: nodeData.userPrompt || "",
        temperature: nodeData.temperature || 1,
        maxTokens: nodeData.maxTokens || 1000,
        responseFormat: nodeData.responseFormat || "text",
      });
    }
  }, [nodeData, open, form]);

  const watchCredentialId = form.watch("credentialId");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof openAIFormSchema>) => {
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
          <DialogTitle>OpenAI Chat Completion</DialogTitle>
          <DialogDescription>
            Generate text using OpenAI's chat models
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an OpenAI API credential" />
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
                    API Key credential for OpenAI authentication
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
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    OpenAI model to use for generation
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
                    The main prompt for the AI model
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
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Controls randomness (0 = deterministic, 2 = very random)
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

            <FormField
              control={form.control}
              name="responseFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Format</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="json_object">JSON Object</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format of the expected response
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
