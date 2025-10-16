import { NextRequest, NextResponse } from 'next/server';
import { LangGraphExecutor } from '@/lib/workflow/langgraph';
import { getWorkflow } from '@/lib/workflow/storage';
import { getServerAPIKeys } from '@/lib/api/config';

export const dynamic = 'force-dynamic';

/**
 * Execute workflow using LangGraph
 * POST /api/workflows/:workflowId/execute-langgraph
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;
    const body = await request.json();
    const { input, threadId } = body;

    // Load workflow
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Get API keys
    const apiKeys = getServerAPIKeys();

    // Create LangGraph executor
    const executor = new LangGraphExecutor(workflow, undefined, apiKeys || undefined);

    // Execute workflow
    const result = await executor.execute(input, { threadId });

    return NextResponse.json({
      success: true,
      executionId: result.id,
      status: result.status,
      nodeResults: result.nodeResults,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
    });
  } catch (error) {
    console.error('LangGraph execution error:', error);
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
