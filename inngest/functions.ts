import { inngest } from "./client";
import prisma from "@/lib/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai"

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
    { id: "execute-ai" },
    { event: "execute/ai" },
    async ({ event, step }) => {
        const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-text",
            generateText, {
            system: "You are a helpful assistant.",
            prompt: "Latest version of Nextjs?",
            model: google("gemini-2.0-flash"),
        }
        )
        const { steps: openaiSteps } = await step.ai.wrap("openai-generate-text",
            generateText, {
            system: "You are a helpful assistant.",
            prompt: "Latest version of Nextjs?",
            model: openai("gpt-4"),
        }
        )
        const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text",
            generateText, {
            system: "You are a helpful assistant.",
            prompt: "Latest version of Nextjs?",
            model: anthropic("claude-4-5-sonnet"),
        }
        )
        return { geminiSteps, openaiSteps, anthropicSteps };
    },
);