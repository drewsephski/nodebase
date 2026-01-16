// features/executions/nodes/httpRequest/executor.ts
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

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
}) => {
  if (!data.endpoint) {
    throw new NonRetriableError("HTTP endpoint is required");
  }
  if (!data.variableName) {
    throw new NonRetriableError("Variable name is required");
  }
  if (!data.method) {
    throw new NonRetriableError("Method is required");
  }

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

      // Try to parse JSON. If invalid JSON, treat as text with { value: ... }
      let payload: unknown;
      try {
        payload = JSON.parse(resolved);
      } catch {
        payload = { value: resolved };
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

  return result;
};
