"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

interface InlineWorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name: string;
  };
}

export function InlineWorkflowEditor({
  isOpen,
  onClose,
  initialData,
}: InlineWorkflowEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: initialData || {
      name: "",
    },
  });

  const onSubmit = async () => {
    try {
      // In a real implementation, you would save the workflow here
      // and then redirect to the workflow editor
      const workflowId = "new-workflow"; // Replace with actual workflow ID from API
      
      toast.success("Workflow created successfully!");
      onClose();
      router.push(`/workflows/${workflowId}`);
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Workflow" : "Create New Workflow"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Workflow"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Workflow"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
