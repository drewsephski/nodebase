"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SaveIcon, PlayIcon } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getGuestWorkflow } from "@/lib/guest-workflow-storage";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import {
  useUpdateWorkflowName,
  useExecuteWorkflow,
  useUpdateWorkflow,
} from "@/features/workflows/hooks/use-workflows";
import { useAtomValue } from "jotai";
import { editorAtom } from "@/features/editor/store/atoms";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useGuestWorkflow, useUpdateGuestWorkflow } from "@/features/workflows/hooks/use-guest-workflows";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  const editor = useAtomValue(editorAtom);
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;
  const isGuest = workflowId.startsWith("guest-");

  const saveWorkflow = useUpdateWorkflow();
  const saveGuestWorkflow = useUpdateGuestWorkflow();
  const executeWorkflow = useExecuteWorkflow();

  const handleSave = () => {
    if (!editor) {
      return;
    }
    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    if (isGuest) {
      saveGuestWorkflow.mutateAsync({
        id: workflowId,
        nodes,
        edges,
      });
    } else {
      if (!isAuthenticated) {
        // Redirect to sign up for unauthenticated users
        window.location.href = "/?auth=signup";
        return;
      }
      saveWorkflow.mutateAsync({
        id: workflowId,
        nodes,
        edges,
      });
    }
  };

  const handleExecute = () => {
    if (isGuest || !isAuthenticated) {
      // Redirect to sign up for unauthenticated users or guest
      window.location.href = "/?auth=signup";
      return;
    }

    executeWorkflow.mutate({ id: workflowId });
  };

  const isDisabledExecute = isGuest || !isAuthenticated || executeWorkflow.isPending;
  const isDisabledSave = (!isAuthenticated && !isGuest) || (isGuest ? saveGuestWorkflow.isPending : saveWorkflow.isPending);

  const saveButtonText = isGuest ? "Save Locally" : isAuthenticated ? "Save" : "Sign up to save";
  const executeButtonText = isAuthenticated ? "Run" : "Sign up to run";

  return (
    <div className="ml-auto flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleExecute}
        disabled={isDisabledExecute}
        variant={isDisabledExecute ? "outline" : "default"}
      >
        <PlayIcon className="size-4 mr-2" />
        {executeButtonText}
      </Button>
      {isGuest ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isDisabledSave}
              variant="default"
            >
              <SaveIcon className="size-4 mr-2" />
              {saveButtonText}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sign up to save to cloud</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isDisabledSave}
          variant={isDisabledSave ? "outline" : "default"}
        >
          <SaveIcon className="size-4 mr-2" />
          {saveButtonText}
        </Button>
      )}
      <AnimatedThemeToggler />
    </div>
  );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const trpc = useTRPC();
  const isGuest = workflowId.startsWith("guest-");
  const { data: workflow } = useQuery(
    isGuest
      ? {
          queryKey: ["guest-workflow", workflowId],
          queryFn: () => getGuestWorkflow(workflowId),
        }
      : trpc.workflows.getOne.queryOptions({ id: workflowId })
  );
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.useSession(),
  });
  const isAuthenticated = !!authData?.data?.user;

  const updateWorkflowName = useUpdateWorkflowName();
  const updateGuestWorkflow = useUpdateGuestWorkflow();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow?.name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow?.name) {
      setName(workflow.name);
    }
  }, [workflow?.name]);

  useEffect(() => {
    if (isEditing && inputRef.current && (isAuthenticated || isGuest)) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, isAuthenticated, isGuest]);

  const handleSave = async () => {
    if (!isAuthenticated && !isGuest) {
      // Redirect to sign up for unauthenticated users
      window.location.href = "/?auth=signup";
      return;
    }

    if (name === workflow?.name) {
      setIsEditing(false);
      return;
    }

    try {
      if (isGuest) {
        await updateGuestWorkflow.mutateAsync({ id: workflowId, name });
      } else {
        await updateWorkflowName.mutateAsync({ id: workflowId, name });
      }
    } catch (error) {
      setName(workflow?.name || "");
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setName(workflow?.name || "");
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <BreadcrumbItem
        onClick={() => {
          if ((isAuthenticated && !isGuest) || isGuest) {
            setIsEditing(true);
          } else {
            window.location.href = "/?auth=signup";
          }
        }}
        className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
      >
        <span>{workflow?.name || "Untitled"}</span>
        {isGuest && <Badge variant="secondary">Guest</Badge>}
        {!isAuthenticated && !isGuest && (
          <span className="text-xs text-muted-foreground">(Sign up to edit)</span>
        )}
      </BreadcrumbItem>
    );
  }

  return (
    <Input
      disabled={(!isAuthenticated && !isGuest) || (isGuest ? updateGuestWorkflow.isPending : updateWorkflowName.isPending)}
      ref={inputRef}
      value={name}
      onKeyDown={handleKeyDown}
      onChange={(e) => setName(e.target.value)}
      onBlur={handleSave}
      className="h-7 w-auto min-w-[100px] px-2"
    />
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
