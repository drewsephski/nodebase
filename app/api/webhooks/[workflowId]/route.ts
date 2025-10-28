import { NextRequest, NextResponse } from "next/server";
import { ExecutionQueue } from "@/lib/execution-queue";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;

    // Verify workflow exists and is owned by a user
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { id: true, userId: true },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Get webhook data from request body
    const webhookData = await request.json();

    // Enqueue the execution job
    const queue = new ExecutionQueue(prisma);
    const jobId = await queue.enqueueJob({
      workflowId,
      userId: workflow.userId,
      triggerType: "webhook",
      webhookData,
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: "Workflow execution queued",
    });

  } catch (error) {
    console.error("Webhook execution error:", error);
    return NextResponse.json(
      { error: "Failed to queue workflow execution" },
      { status: 500 }
    );
  }
}
