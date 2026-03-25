/**
 * graphData.ts
 * ------------
 * Defines the inter-city bus terminal graph for West Java & Jakarta.
 * Each edge contains a `cost` value representing distance/toll cost (in km equivalent).
 * Each node also carries a heuristic `h` value – the straight-line distance
 * estimate to Jakarta (the common goal node), used by the A* algorithm.
 */

export type NodeId =
  | 'Tasikmalaya'
  | 'Garut'
  | 'Bandung'
  | 'Sumedang'
  | 'Cirebon'
  | 'Purwakarta'
  | 'Bekasi'
  | 'Jakarta';

export interface Edge {
  to: NodeId;
  /** Cost in km (distance + toll proxy) */
  cost: number;
}

export interface GraphNode {
  id: NodeId;
  /** Straight-line distance estimate to the goal (Jakarta) in km */
  h: number;
  edges: Edge[];
}

export type Graph = Record<NodeId, GraphNode>;

/** All terminal nodes with adjacency list and heuristics */
export const graph: Graph = {
  Tasikmalaya: {
    id: 'Tasikmalaya',
    h: 280,
    edges: [
      { to: 'Garut', cost: 60 },
      { to: 'Bandung', cost: 130 },
    ],
  },
  Garut: {
    id: 'Garut',
    h: 230,
    edges: [
      { to: 'Tasikmalaya', cost: 60 },
      { to: 'Bandung', cost: 70 },
    ],
  },
  Bandung: {
    id: 'Bandung',
    h: 160,
    edges: [
      { to: 'Garut', cost: 70 },
      { to: 'Tasikmalaya', cost: 130 },
      { to: 'Sumedang', cost: 45 },
      { to: 'Purwakarta', cost: 75 },
      { to: 'Cirebon', cost: 130 },
    ],
  },
  Sumedang: {
    id: 'Sumedang',
    h: 170,
    edges: [
      { to: 'Bandung', cost: 45 },
      { to: 'Cirebon', cost: 100 },
    ],
  },
  Cirebon: {
    id: 'Cirebon',
    h: 210,
    edges: [
      { to: 'Bandung', cost: 130 },
      { to: 'Sumedang', cost: 100 },
      { to: 'Purwakarta', cost: 95 },
    ],
  },
  Purwakarta: {
    id: 'Purwakarta',
    h: 80,
    edges: [
      { to: 'Bandung', cost: 75 },
      { to: 'Cirebon', cost: 95 },
      { to: 'Bekasi', cost: 55 },
    ],
  },
  Bekasi: {
    id: 'Bekasi',
    h: 20,
    edges: [
      { to: 'Purwakarta', cost: 55 },
      { to: 'Jakarta', cost: 25 },
    ],
  },
  Jakarta: {
    id: 'Jakarta',
    h: 0,
    edges: [{ to: 'Bekasi', cost: 25 }],
  },
};

/** Ordered list of all terminal names for UI dropdowns */
export const terminals: NodeId[] = [
  'Tasikmalaya',
  'Garut',
  'Bandung',
  'Sumedang',
  'Cirebon',
  'Purwakarta',
  'Bekasi',
  'Jakarta',
];
