/**
 * Execution Context Manager
 *
 * Manages workflow execution state including variables set by SET_VARIABLE nodes
 * and outputs from previous nodes. Provides methods for variable templating
 * and data passing between nodes during execution.
 */

export interface ExecutionContextData {
  variables: Record<string, any>;
  nodeOutputs: Record<string, any>;
}

export class ExecutionContextManager {
  private context: ExecutionContextData;

  constructor() {
    this.context = {
      variables: {},
      nodeOutputs: {},
    };
  }

  /**
   * Set a workflow variable
   */
  setVariable(name: string, value: any, type?: string): void {
    this.context.variables[name] = {
      value,
      type: type || typeof value,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a workflow variable
   */
  getVariable(name: string): any {
    const variable = this.context.variables[name];
    return variable ? variable.value : undefined;
  }

  /**
   * Get all variables
   */
  getAllVariables(): Record<string, any> {
    const variables: Record<string, any> = {};
    for (const [key, variable] of Object.entries(this.context.variables)) {
      variables[key] = variable.value;
    }
    return variables;
  }

  /**
   * Set output from a node execution
   */
  setNodeOutput(nodeId: string, output: any): void {
    this.context.nodeOutputs[nodeId] = {
      output,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get output from a previous node
   */
  getNodeOutput(nodeId: string): any {
    const nodeOutput = this.context.nodeOutputs[nodeId];
    return nodeOutput ? nodeOutput.output : undefined;
  }

  /**
   * Get all node outputs
   */
  getAllNodeOutputs(): Record<string, any> {
    const outputs: Record<string, any> = {};
    for (const [nodeId, nodeOutput] of Object.entries(this.context.nodeOutputs)) {
      outputs[nodeId] = nodeOutput.output;
    }
    return outputs;
  }

  /**
   * Resolve template variables in a string
   * Supports {{variable}} syntax for simple variables
   * and {{json variable}} syntax for JSON stringification
   */
  resolveTemplate(template: string): string {
    if (!template || typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      const trimmed = expression.trim();

      // Handle JSON stringification syntax: {{json variable}}
      if (trimmed.startsWith('json ')) {
        const varName = trimmed.substring(5).trim();
        const value = this.getVariable(varName) || this.getNodeOutput(varName);
        try {
          return JSON.stringify(value);
        } catch (error) {
          console.warn(`Failed to stringify variable ${varName}:`, error);
          return 'null';
        }
      }

      // Handle simple variable syntax: {{variable}}
      const value = this.getVariable(trimmed) || this.getNodeOutput(trimmed);

      if (value === undefined || value === null) {
        return '';
      }

      // Convert to string for template replacement
      return String(value);
    });
  }

  /**
   * Resolve template variables in an object (recursive)
   */
  resolveTemplateInObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.resolveTemplate(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveTemplateInObject(item));
    }

    if (obj && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveTemplateInObject(value);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * Clear all context data
   */
  clear(): void {
    this.context = {
      variables: {},
      nodeOutputs: {},
    };
  }

  /**
   * Get current context snapshot
   */
  getSnapshot(): ExecutionContextData {
    return JSON.parse(JSON.stringify(this.context));
  }

  /**
   * Restore context from snapshot
   */
  restore(snapshot: ExecutionContextData): void {
    this.context = JSON.parse(JSON.stringify(snapshot));
  }

  /**
   * Check if a variable exists
   */
  hasVariable(name: string): boolean {
    return name in this.context.variables;
  }

  /**
   * Check if a node output exists
   */
  hasNodeOutput(nodeId: string): boolean {
    return nodeId in this.context.nodeOutputs;
  }

  /**
   * Delete a variable
   */
  deleteVariable(name: string): void {
    delete this.context.variables[name];
  }

  /**
   * Delete a node output
   */
  deleteNodeOutput(nodeId: string): void {
    delete this.context.nodeOutputs[nodeId];
  }
}

// Export types for use in other files
export type { ExecutionContextData };
