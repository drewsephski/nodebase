/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as apiKeys from "../apiKeys.js";
import type * as approvals from "../approvals.js";
import type * as executions from "../executions.js";
import type * as mcpServers from "../mcpServers.js";
import type * as templates from "../templates.js";
import type * as userLLMKeys from "../userLLMKeys.js";
import type * as userMCPs from "../userMCPs.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  apiKeys: typeof apiKeys;
  approvals: typeof approvals;
  executions: typeof executions;
  mcpServers: typeof mcpServers;
  templates: typeof templates;
  userLLMKeys: typeof userLLMKeys;
  userMCPs: typeof userMCPs;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
