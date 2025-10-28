/**
 * Node Execution Helpers
 *
 * Utility functions for common node operations including credential management,
 * data validation, condition evaluation, and error formatting.
 */

import { decrypt } from "./encryption";
import { RetryService } from "./retry";
import type { PrismaClient } from "./generated/prisma";

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  logs: Array<{
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
    data?: any;
  }>;
}

export interface CredentialData {
  id: string;
  name: string;
  type: string;
  data: any;
  userId: string;
}

/**
 * Fetch and decrypt credential by ID
 */
export async function getCredential(
  prisma: PrismaClient,
  credentialId: string
): Promise<CredentialData | null> {
  try {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId }
    });

    if (!credential) {
      return null;
    }

    // Decrypt the credential data
    const decryptedData = decrypt(credential.data as string);

    return {
      id: credential.id,
      name: credential.name,
      type: credential.type,
      data: decryptedData,
      userId: credential.userId,
    };
  } catch (error) {
    console.error(`Failed to fetch credential ${credentialId}:`, error);
    return null;
  }
}

/**
 * Validate node configuration data against a schema
 */
export function validateNodeData<T>(nodeData: any, schema: any): { success: boolean; data?: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(nodeData);
    return { success: true, data: validatedData };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'];
    return { success: false, errors };
  }
}

/**
 * Evaluate a single condition against data
 */
export function evaluateCondition(data: any, condition: {
  fieldPath: string;
  operator: string;
  value: string;
}): boolean {
  try {
    // Extract value from data using field path
    const fieldValue = extractJsonPath(data, condition.fieldPath);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'not_equals':
        return fieldValue !== condition.value;

      case 'contains':
        return String(fieldValue).includes(condition.value);

      case 'greater_than':
        const numValue = Number(fieldValue);
        const numCompare = Number(condition.value);
        return !isNaN(numValue) && !isNaN(numCompare) && numValue > numCompare;

      case 'less_than':
        const numValue2 = Number(fieldValue);
        const numCompare2 = Number(condition.value);
        return !isNaN(numValue2) && !isNaN(numCompare2) && numValue2 < numCompare2;

      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;

      case 'regex':
        try {
          const regex = new RegExp(condition.value);
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }

      default:
        return false;
    }
  } catch (error) {
    console.warn('Error evaluating condition:', error);
    return false;
  }
}

/**
 * Evaluate multiple conditions with AND/OR logic
 */
export function evaluateConditions(
  data: any,
  conditions: Array<{
    fieldPath: string;
    operator: string;
    value: string;
  }>,
  combineOperator: 'AND' | 'OR' = 'AND'
): boolean {
  if (conditions.length === 0) {
    return true;
  }

  const results = conditions.map(condition => evaluateCondition(data, condition));

  if (combineOperator === 'AND') {
    return results.every(result => result);
  } else {
    return results.some(result => result);
  }
}

/**
 * Extract data using JSON path notation
 */
export function extractJsonPath(data: any, path: string): any {
  if (!path || !data) {
    return data;
  }

  try {
    // Handle simple dot notation: "data.items" or "items[0].name"
    const parts = path.split(/\.|\[|\]/).filter(part => part !== '');

    let current = data;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (Array.isArray(current)) {
        const index = parseInt(part);
        if (!isNaN(index)) {
          current = current[index];
        } else {
          return undefined;
        }
      } else if (typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  } catch (error) {
    console.warn(`Error extracting JSON path ${path}:`, error);
    return undefined;
  }
}

/**
 * Format node execution errors consistently
 */
export function formatNodeError(error: any, nodeId: string, nodeType: string): string {
  if (error instanceof Error) {
    return `${nodeType} node (${nodeId}): ${error.message}`;
  }

  if (typeof error === 'string') {
    return `${nodeType} node (${nodeId}): ${error}`;
  }

  return `${nodeType} node (${nodeId}): Unknown error occurred`;
}

/**
 * Create a successful execution result
 */
export function createSuccessResult(output: any, logs: Array<{ level: 'info' | 'warn' | 'error'; message: string; data?: any }> = []): NodeExecutionResult {
  return {
    success: true,
    output,
    logs: logs.map(log => ({
      ...log,
      timestamp: new Date().toISOString(),
    })),
  };
}

/**
 * Create a failed execution result
 */
export function createErrorResult(error: string, logs: Array<{ level: 'info' | 'warn' | 'error'; message: string; data?: any }> = []): NodeExecutionResult {
  return {
    success: false,
    error,
    logs: logs.map(log => ({
      ...log,
      timestamp: new Date().toISOString(),
    })),
  };
}

/**
 * Make HTTP request with retry logic
 */
export async function makeHttpRequest(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  try {
    const response = await RetryService.withRetry(
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'n8n-clone/1.0',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
      },
      retries,
      1000 // 1 second delay between retries
    );

    return { success: true, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Parse JSON safely
 */
export function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Stringify JSON safely
 */
export function safeJsonStringify(data: any, defaultValue: string = 'null'): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
    return defaultValue;
  }
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format timestamp for logs
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Validate email addresses
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a simple UUID
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
