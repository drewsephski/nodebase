import type { Node, Edge } from "@xyflow/react";

export interface GuestWorkflow {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

const GUEST_WORKFLOWS_KEY = "guest-workflows";

export function saveGuestWorkflow(workflow: GuestWorkflow): void {
  try {
    const existingWorkflows = getGuestWorkflows();
    const updatedWorkflows = existingWorkflows.filter(w => w.id !== workflow.id);
    updatedWorkflows.push(workflow);
    
    localStorage.setItem(GUEST_WORKFLOWS_KEY, JSON.stringify(updatedWorkflows));
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      throw new Error("Local storage quota exceeded. Please clear some space or sign up to save to the cloud.");
    }
    throw error;
  }
}

export function getGuestWorkflows(): GuestWorkflow[] {
  try {
    const stored = localStorage.getItem(GUEST_WORKFLOWS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((workflow: any) => ({
      ...workflow,
      createdAt: new Date(workflow.createdAt),
      updatedAt: new Date(workflow.updatedAt),
    }));
  } catch (error) {
    console.error("Failed to parse guest workflows from localStorage:", error);
    return [];
  }
}

export function getGuestWorkflow(id: string): GuestWorkflow | null {
  const workflows = getGuestWorkflows();
  return workflows.find(w => w.id === id) || null;
}

export function deleteGuestWorkflow(id: string): void {
  try {
    const existingWorkflows = getGuestWorkflows();
    const updatedWorkflows = existingWorkflows.filter(w => w.id !== id);
    localStorage.setItem(GUEST_WORKFLOWS_KEY, JSON.stringify(updatedWorkflows));
  } catch (error) {
    console.error("Failed to delete guest workflow:", error);
    throw error;
  }
}

export function clearGuestWorkflows(): void {
  try {
    localStorage.removeItem(GUEST_WORKFLOWS_KEY);
  } catch (error) {
    console.error("Failed to clear guest workflows:", error);
    throw error;
  }
}

export async function migrateGuestWorkflowsToUser(
  userId: string,
  trpcClient: any
): Promise<string[]> {
  const guestWorkflows = getGuestWorkflows();
  if (guestWorkflows.length === 0) {
    return [];
  }

  const createdWorkflowIds: string[] = [];

  try {
    for (const guestWorkflow of guestWorkflows) {
      // Create the workflow in the database
      const result = await trpcClient.workflows.create.mutate({
        name: guestWorkflow.name,
        nodes: guestWorkflow.nodes,
        edges: guestWorkflow.edges,
      });

      createdWorkflowIds.push(result.id);
    }

    // Clear localStorage after successful migration
    clearGuestWorkflows();

    return createdWorkflowIds;
  } catch (error) {
    console.error("Failed to migrate guest workflows:", error);
    throw new Error("Failed to migrate workflows to your account. Please try again.");
  }
}