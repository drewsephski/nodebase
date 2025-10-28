import { PrismaClient } from "@/lib/generated/prisma";

export interface JobData {
  jobId: string;
  workflowId: string;
  userId: string;
  triggerType: "webhook" | "schedule";
  scheduledAt?: Date;
  webhookData?: Record<string, unknown>;
}

export class ExecutionQueue {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async enqueueJob(jobData: Omit<JobData, 'jobId'>): Promise<string> {
    const job = await this.prisma.executionJob.create({
      data: {
        workflowId: jobData.workflowId,
        userId: jobData.userId,
        triggerType: jobData.triggerType,
        status: "PENDING",
        scheduledAt: jobData.scheduledAt,
        webhookData: jobData.webhookData,
      },
    });

    return job.id;
  }

  async dequeueJob(): Promise<{ jobId: string; workflowId: string; userId: string; triggerType: "webhook" | "schedule"; scheduledAt?: Date; webhookData?: any } | null> {
    // Find the next pending job
    const job = await this.prisma.executionJob.findFirst({
      where: {
        status: "PENDING",
        OR: [
          { scheduledAt: { lte: new Date() } },
          { scheduledAt: null },
        ],
      },
      orderBy: [
        { scheduledAt: "asc" },
        { createdAt: "asc" },
      ],
    });

    if (!job) {
      return null;
    }

    // Mark as processing
    await this.prisma.executionJob.update({
      where: { id: job.id },
      data: { status: "PROCESSING" },
    });

    return {
      jobId: job.id,
      workflowId: job.workflowId,
      userId: job.userId,
      triggerType: job.triggerType as "webhook" | "schedule",
      scheduledAt: job.scheduledAt || undefined,
      webhookData: job.webhookData,
    };
  }

  async markJobCompleted(jobId: string): Promise<void> {
    await this.prisma.executionJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  async markJobFailed(jobId: string, error: string): Promise<void> {
    await this.prisma.executionJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error,
      },
    });
  }

  async getPendingJobsCount(): Promise<number> {
    return await this.prisma.executionJob.count({
      where: { status: "PENDING" },
    });
  }
}
