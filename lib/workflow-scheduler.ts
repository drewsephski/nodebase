import { ExecutionEngine } from "@/lib/execution-engine";
import { ExecutionQueue } from "@/lib/execution-queue";
import prisma from "@/lib/db";

export class WorkflowScheduler {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log("Starting workflow scheduler...");

    // Process jobs every 10 seconds
    this.intervalId = setInterval(async () => {
      await this.processJobs();
    }, 10000);

    // Process jobs immediately on start
    await this.processJobs();
  }

  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log("Workflow scheduler stopped");
  }

  private async processJobs(): Promise<void> {
    try {
      const queue = new ExecutionQueue(prisma);

      // Check if there are pending jobs
      const pendingCount = await queue.getPendingJobsCount();
      if (pendingCount === 0) {
        return;
      }

      console.log(`Processing ${pendingCount} pending jobs...`);

      // Process jobs one by one
      let job;
      while ((job = await queue.dequeueJob()) !== null) {
        try {
          console.log(`Executing workflow ${job.workflowId} for user ${job.userId} (Job ID: ${job.jobId})`);

          const engine = await ExecutionEngine.createExecution(
            job.workflowId,
            job.userId,
            job.triggerType,
            prisma
          );

          await engine.executeWorkflow();

          await queue.markJobCompleted(job.jobId);
          console.log(`Successfully executed workflow ${job.workflowId}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error(`Failed to execute workflow ${job.workflowId}:`, errorMessage);
          await queue.markJobFailed(job.jobId, errorMessage);
        }
      }

    } catch (error) {
      console.error("Error processing jobs:", error);
    }
  }
}

// Global scheduler instance
let scheduler: WorkflowScheduler | null = null;

export interface JobData {
  workflowId: string;
  userId: string;
  triggerType: "webhook" | "schedule";
  scheduledAt?: Date;
  webhookData?: any;
  jobId: string;
}

export function getScheduler(): WorkflowScheduler {
  if (!scheduler) {
    scheduler = new WorkflowScheduler();
  }
  return scheduler;
}
