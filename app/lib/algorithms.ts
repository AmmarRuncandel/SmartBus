/**
 * algorithms.ts
 * ---------------
 * Pure TypeScript implementations of:
 *  - Uniform Cost Search (UCS)  – explores by accumulated g-cost only
 *  - A* Search                  – explores by f(n) = g(n) + h(n)
 *
 * Both use a simple min-heap priority queue and return identical result shapes.
 */

import { Graph, NodeId } from './graphData';

// ---------------------------------------------------------------------------
// Result Type
// ---------------------------------------------------------------------------

export interface AlgorithmResult {
  /** Ordered list of terminal names representing the optimal path */
  path: NodeId[];
  /** Total accumulated edge cost along the optimal path */
  totalCost: number;
  /** Wall-clock execution time in milliseconds (via performance.now) */
  executionTime: number;
  /** Number of distinct nodes popped from the priority queue */
  nodesVisited: number;
  /** Step-by-step log of node expansions for visualization */
  expansionLog: { node: NodeId; gCost: number; fCost?: number }[];
}

// ---------------------------------------------------------------------------
// Minimal Priority Queue (Min-Heap)
// ---------------------------------------------------------------------------

interface PQItem<T> {
  priority: number;
  value: T;
}

class MinPriorityQueue<T> {
  private heap: PQItem<T>[] = [];

  enqueue(value: T, priority: number): void {
    this.heap.push({ priority, value });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): PQItem<T> | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  get size(): number {
    return this.heap.length;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].priority <= this.heap[i].priority) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// ---------------------------------------------------------------------------
// Uniform Cost Search (UCS)
// ---------------------------------------------------------------------------

/**
 * Explores the graph using only accumulated edge cost (g).
 * Guaranteed to find the lowest-cost path.
 */
export function runUCS(
  graph: Graph,
  start: NodeId,
  goal: NodeId
): AlgorithmResult {
  const t0 = performance.now();

  const pq = new MinPriorityQueue<{ node: NodeId; path: NodeId[]; cost: number }>();
  pq.enqueue({ node: start, path: [start], cost: 0 }, 0);

  const visited = new Set<NodeId>();
  const expansionLog: AlgorithmResult['expansionLog'] = [];
  let nodesVisited = 0;

  while (pq.size > 0) {
    const item = pq.dequeue()!;
    const { node, path, cost } = item.value;

    if (visited.has(node)) continue;
    visited.add(node);
    nodesVisited++;
    expansionLog.push({ node, gCost: cost });

    if (node === goal) {
      const executionTime = performance.now() - t0;
      return { path, totalCost: cost, executionTime, nodesVisited, expansionLog };
    }

    for (const edge of graph[node].edges) {
      if (!visited.has(edge.to)) {
        const newCost = cost + edge.cost;
        pq.enqueue(
          { node: edge.to, path: [...path, edge.to], cost: newCost },
          newCost
        );
      }
    }
  }

  // No path found
  const executionTime = performance.now() - t0;
  return { path: [], totalCost: Infinity, executionTime, nodesVisited, expansionLog };
}

// ---------------------------------------------------------------------------
// A* Search
// ---------------------------------------------------------------------------

/**
 * Explores using f(n) = g(n) + h(n).
 * h(n) is the pre-computed straight-line estimate stored on each graph node.
 * More efficient than UCS when a good heuristic is available.
 */
export function runAStar(
  graph: Graph,
  start: NodeId,
  goal: NodeId
): AlgorithmResult {
  const t0 = performance.now();

  const pq = new MinPriorityQueue<{ node: NodeId; path: NodeId[]; gCost: number }>();
  const startH = graph[start].h;
  pq.enqueue({ node: start, path: [start], gCost: 0 }, 0 + startH);

  const visited = new Set<NodeId>();
  const gScores = new Map<NodeId, number>();
  gScores.set(start, 0);

  const expansionLog: AlgorithmResult['expansionLog'] = [];
  let nodesVisited = 0;

  while (pq.size > 0) {
    const item = pq.dequeue()!;
    const { node, path, gCost } = item.value;

    if (visited.has(node)) continue;
    visited.add(node);
    nodesVisited++;
    const h = graph[node].h;
    expansionLog.push({ node, gCost, fCost: gCost + h });

    if (node === goal) {
      const executionTime = performance.now() - t0;
      return { path, totalCost: gCost, executionTime, nodesVisited, expansionLog };
    }

    for (const edge of graph[node].edges) {
      if (visited.has(edge.to)) continue;
      const newG = gCost + edge.cost;
      const bestG = gScores.get(edge.to) ?? Infinity;
      if (newG < bestG) {
        gScores.set(edge.to, newG);
        const fCost = newG + graph[edge.to].h;
        pq.enqueue({ node: edge.to, path: [...path, edge.to], gCost: newG }, fCost);
      }
    }
  }

  // No path found
  const executionTime = performance.now() - t0;
  return { path: [], totalCost: Infinity, executionTime, nodesVisited, expansionLog };
}
