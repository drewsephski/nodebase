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

const geminiFormSchema = z.object({
  credentialId: z.string().min(1, "Please select a credential"),
  model: z.enum(["gemini-2.0-flash-exp", "gemini-1.5-pro"]),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  temperature: z.coerce.number().min(0).max(2).default(1),
  maxTokens: z.coerce.number().min(1).max(8192).default(2048),
});

export type GoogleGeminiChatFormType = z.infer<typeof geminiFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const GoogleGeminiChatDialog = ({
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

  const form = useForm<z.infer<typeof geminiFormSchema>>({
    resolver: zodResolver(geminiFormSchema),
    defaultValues: {
      credentialId: nodeData?.credentialId || "",
      model: nodeData?.model || "gemini-2.0-flash-exp",
      systemPrompt: nodeData?.systemPrompt || "",
      userPrompt: nodeData?.userPrompt || "",
      temperature: nodeData?.temperature || 1,
      maxTokens: nodeData?.maxTokens || 2048,
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        credentialId: nodeData.credentialId || "",
        model: nodeData.model || "gemini-2.0-flash-exp",
        systemPrompt: nodeData.systemPrompt || "",
        userPrompt: nodeData.userPrompt || "",
        temperature: nodeData.temperature || 1,
        maxTokens: nodeData.maxTokens || 2048,
      });
    }
  }, [nodeData, open, form]);

  const watchCredentialId = form.watch("credentialId");

  // Get credential name for display
  const selectedCredential = credentials.find((cred: any) => cred.id === watchCredentialId);

  const handleSubmit = (values: z.infer<typeof geminiFormSchema>) => {
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
          <DialogTitle>Google Gemini Chat</DialogTitle>
          <DialogDescription>
            Generate text using Google's Gemini models
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google AI Credential</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Google AI credential" />
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
                    API Key credential for Google AI authentication
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
                      <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Google Gemini model to use for generation
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
                    The main prompt for the Gemini model
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
                      <Input type="number" min="1" max="8192" {...field} />
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
