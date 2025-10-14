import { inngest } from "./client";
import prisma from "@/lib/db";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    console.log("Starting hello world workflow with data:", event.data);

    // Fetch Video
    await step.sleep("fetching", "5s");
    console.log("Video fetched");

    // Transcribing
    await step.sleep("transcribing", "5s");
    console.log("Transcription completed");

    // Sending transcription to AI
    await step.sleep("sending-to-ai", "5s");
    console.log("AI processing completed");

    // Create workflow
    const workflow = await step.run("create-workflow", async () => {
      try {
        const newWorkflow = await prisma.workflow.create({
          data: {
            name: `workflow-from-inngest-${Date.now()}`,
          },
        });
        console.log("Workflow created successfully:", newWorkflow.id);
        return newWorkflow;
      } catch (error) {
        console.error("Failed to create workflow:", error);
        throw error;
      }
    });

    console.log("Hello world workflow completed successfully");
    return workflow;
  },
);