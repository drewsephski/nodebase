import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai"
import * as Sentry from "@sentry/nextjs";
const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
    { id: "execute-ai" },
    { event: "execute/ai" },
    async ({ event, step }) => {
        await step.sleep("pretend", "5s");

        Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' });
        console.warn("Somethings missing");
        console.error("Error to track");
        console.info("Something went wrong");

        const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-text",
            generateText, {
            system: "You are a helpful assistant.",
            prompt: "Latest version of Nextjs?",
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
            model: google("gemini-2.0-flash"),
        }
        )
        const { steps: openaiSteps } = await step.ai.wrap("openai-generate-text",
            generateText, {
            system: "You are a helpful assistant.",
            prompt: "Latest version of Nextjs?",
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
            model: openai("gpt-4o"),
        }
        )
        const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text",
            generateText, {
            system: "You are a helpful assistant.",
            prompt: "Latest version of Nextjs?",
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
            model: anthropic("claude-3-5-sonnet-20241022"),
        }
        )
        return { geminiSteps, openaiSteps, anthropicSteps };
    },
);