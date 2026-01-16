// features/executions/nodes/httpRequest/executor.ts
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  console.log(`HTTP Request Executor - Node ID: ${nodeId}`, {
    data,
    hasEndpoint: !!data.endpoint,
    hasVariableName: !!data.variableName,
    hasMethod: !!data.method,
  });

  // Publish loading state first
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );
    
  if (!data.endpoint) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("HTTP endpoint is required");
  }

  if (!data.variableName) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Variable name is required");
  }
  if (!data.method) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Method is required");
  }

  try {

  const result = await step.run("http-request", async () => {
    const endpoint = Handlebars.compile(data.endpoint)(context);
    const method = data.method;

    const options: KyOptions = {
      method,
      timeout: data.timeoutMs ?? 30000,
      headers: {
        ...(data.headers ?? {}),
      },
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const template = Handlebars.compile(data.body || "{}");
      const resolved = template(context);

      // Validate JSON - throw error if invalid
      let payload: unknown;
      try {
        payload = JSON.parse(resolved);
      } catch (error) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError(`Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Prefer ky `json`—it sets Content-Type and stringifies safely
      options.json = payload;
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });
  await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(`HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


