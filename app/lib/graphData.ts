/**
 * graphData.ts
 * ------------
 * Graph builder that reads the real SmartBus dataset from a separate JSON file.
 * The dataset stores terminal locations, road distances, and the graph topology.
 */

import dataset from './data/smartbus-dataset.json';

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
  /** Road-distance cost in km */
  cost: number;
}

export interface GraphNode {
  id: NodeId;
  displayName: string;
  lat: number;
  lon: number;
  /** Straight-line distance estimate to the goal (Jakarta) in km */
  h: number;
  edges: Edge[];
}

export type Graph = Record<NodeId, GraphNode>;

type DatasetNode = {
  id: NodeId;
  displayName: string;
  lat: number;
  lon: number;
  sourceUrl: string;
};

type SmartBusDataset = {
  metadata: {
    project: string;
    description: string;
    sources: {
      locations: string;
      roadDistances: string;
      heuristic: string;
    };
  };
  terminals: DatasetNode[];
  connections: Record<NodeId, NodeId[]>;
  roadDistanceKm: Record<NodeId, Partial<Record<NodeId, number>>>;
};

const smartBusDataset = dataset as SmartBusDataset;
const terminalProfiles = Object.fromEntries(
  smartBusDataset.terminals.map((terminal) => [terminal.id, terminal]),
) as Record<NodeId, DatasetNode>;

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(bLat - aLat);
  const deltaLon = toRadians(bLon - aLon);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function estimateHeuristic(from: NodeId): number {
  const origin = terminalProfiles[from];
  const destination = terminalProfiles.Jakarta;
  return Math.floor(haversineKm(origin.lat, origin.lon, destination.lat, destination.lon));
}

function buildGraph(): Graph {
  return (smartBusDataset.terminals.map((terminal) => terminal.id) as NodeId[]).reduce((accumulator, id) => {
    const profile = terminalProfiles[id];
    accumulator[id] = {
      id,
      displayName: profile.displayName,
      lat: profile.lat,
      lon: profile.lon,
      h: estimateHeuristic(id),
      edges: smartBusDataset.connections[id].map((to) => ({
        to,
        cost:
          smartBusDataset.roadDistanceKm[id][to] ??
          Math.max(1, Math.round(haversineKm(profile.lat, profile.lon, terminalProfiles[to].lat, terminalProfiles[to].lon))),
      })),
    };
    return accumulator;
  }, {} as Graph);
}

export const graph: Graph = buildGraph();

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

export function getTerminalLabel(id: NodeId): string {
  return graph[id].displayName;
}
