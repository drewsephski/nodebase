"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import {
  useUpdateWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflows";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useAtomValue } from "jotai";
import { editorAtom } from "@/features/editor/store/atoms";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  const editor = useAtomValue(editorAtom);
  const saveWorkflow = useUpdateWorkflow();

  const handleSave = () => {
    if (!editor) {
      return;
    }
    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    saveWorkflow.mutateAsync({
      id: workflowId,
      nodes,
      edges,
    });
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      <Button size="sm" onClick={handleSave} disabled={saveWorkflow.isPending}>
        <SaveIcon className="size-4 mr-2" />
        Save
      </Button>
      <AnimatedThemeToggler />
    </div>
  );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflowName = useUpdateWorkflowName();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkflowName.mutateAsync({ id: workflowId, name });
    } catch {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setName(workflow.name);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <BreadcrumbItem
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:text-foreground transition-colors"
      >
        {workflow.name}
      </BreadcrumbItem>
    );
  }

  return (
    <BreadcrumbItem>
      <Input
        disabled={updateWorkflowName.isPending}
        ref={inputRef}
        value={name}
        onKeyDown={handleKeyDown}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        className="h-7 w-auto min-w-[100px] px-2"
      />
    </BreadcrumbItem>
  );
};

export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row gap-x-4 w-full items-center">
        <EditorBreadcrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  );
};
