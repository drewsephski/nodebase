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

const codeExecuteFormSchema = z.object({
  language: z.enum(["javascript"]),
  code: z.string().min(1, "Code is required"),
  inputVar: z.string().min(1, "Input variable name is required"),
  outputVar: z.string().min(1, "Output variable name is required"),
});

export type CodeExecuteFormType = z.infer<typeof codeExecuteFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeData?: any;
}

export const CodeExecuteDialog = ({
  open,
  onOpenChange,
  nodeId,
  nodeData,
}: Props) => {
  const { setNodes } = useReactFlow();

  const form = useForm<z.infer<typeof codeExecuteFormSchema>>({
    resolver: zodResolver(codeExecuteFormSchema),
    defaultValues: {
      language: nodeData?.language || "javascript",
      code: nodeData?.code || "",
      inputVar: nodeData?.inputVar || "input",
      outputVar: nodeData?.outputVar || "output",
    },
  });

  useEffect(() => {
    if (open && nodeData) {
      form.reset({
        language: nodeData.language || "javascript",
        code: nodeData.code || "",
        inputVar: nodeData.inputVar || "input",
        outputVar: nodeData.outputVar || "output",
      });
    }
  }, [nodeData, open, form]);

  const handleSubmit = (values: z.infer<typeof codeExecuteFormSchema>) => {
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execute Code</DialogTitle>
          <DialogDescription>
            Execute JavaScript code with access to workflow data
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inputVar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Variable</FormLabel>
                    <FormControl>
                      <Input placeholder="input" {...field} />
                    </FormControl>
                    <FormDescription>
                      Variable name for input data
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outputVar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Variable</FormLabel>
                    <FormControl>
                      <Input placeholder="output" {...field} />
                    </FormControl>
                    <FormDescription>
                      Variable name for output data
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`// Available variables:
// ${form.watch("inputVar")} - input data from previous nodes
// ${form.watch("outputVar")} - assign your result here

// Example:
const result = ${form.watch("inputVar")}.map(item => ({
  ...item,
  processed: true
}));

${form.watch("outputVar")} = result;`}
                      className="min-h-[300px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    JavaScript code to execute. The input variable contains data from previous nodes.
                    Assign your result to the output variable.
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
