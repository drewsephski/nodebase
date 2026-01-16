import { channel, topic } from "@inngest/realtime";

export const HTTP_REQUEST_CHANNEL_NAME = "http-request-execution";

export const httpRequestChannel = channel(HTTP_REQUEST_CHANNEL_NAME)
    .addTopic(
        topic("status").type<{
            nodeId: string,
            status: "loading" | "success" | "error";
        }>(),
    );