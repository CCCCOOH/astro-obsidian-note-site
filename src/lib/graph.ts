// src/lib/graph.ts

export interface GraphNode {
  id: string;
  label: string;
  size: number;
  title: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
