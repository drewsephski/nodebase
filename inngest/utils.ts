import toposort from "toposort";
import { Node } from "@xyflow/react";
import { Connection } from "@xyflow/react";

export const topologicalSort = (
    nodes: Node[],
    connections: Connection[]
): Node[] => {
    
    if (connections.length === 0) {
        return nodes;
    }
    

    const edges: [string, string][] = connections.map((conn) => [
        conn.source, 
        conn.target,
    ]);

    const connectedNodeIds = new Set<string>();
    for (const conn of connections) {
        connectedNodeIds.add(conn.source);
        connectedNodeIds.add(conn.target);
    }

    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            edges.push([node.id, node.id]);
        }
    }

    let sortedNodeIds: string[];
    try {
        sortedNodeIds = toposort(edges);
    } catch (error) {
        if (error instanceof Error && error.message.includes("Cyclic")) {
            // Return original order if there's a cycle
            throw new Error("Workflow contains a cycle");
        }
        throw error;
    }
    
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};
