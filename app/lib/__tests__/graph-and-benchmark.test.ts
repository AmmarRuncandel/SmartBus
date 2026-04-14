import { describe, expect, it } from 'vitest';
import { benchmarkAlgorithm, summarizeNumericValues } from '../benchmark';
import { graph, terminals, type NodeId } from '../graphData';
import { runAStar, runUCS } from '../algorithms';

function dijkstraToGoal(goal: NodeId) {
  const distances = Object.fromEntries(
    terminals.map((terminal) => [terminal, Number.POSITIVE_INFINITY]),
  ) as Record<NodeId, number>;
  distances[goal] = 0;

  const unvisited = new Set<NodeId>(terminals);

  while (unvisited.size > 0) {
    let current: NodeId | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const terminal of unvisited) {
      if (distances[terminal] < bestDistance) {
        bestDistance = distances[terminal];
        current = terminal;
      }
    }

    if (!current) break;
    unvisited.delete(current);

    for (const edge of graph[current].edges) {
      const candidate = distances[current] + edge.cost;
      if (candidate < distances[edge.to]) {
        distances[edge.to] = candidate;
      }
    }
  }

  return distances;
}

describe('SmartBus heuristic audit', () => {
  it('is admissible for every terminal', () => {
    const shortestToGoal = dijkstraToGoal('Jakarta');

    for (const terminal of terminals) {
      expect(graph[terminal].h).toBeLessThanOrEqual(shortestToGoal[terminal]);
    }
  });

  it('is consistent across all edges', () => {
    for (const terminal of terminals) {
      for (const edge of graph[terminal].edges) {
        expect(graph[terminal].h).toBeLessThanOrEqual(edge.cost + graph[edge.to].h);
      }
    }
  });
});

describe('A* and UCS results', () => {
  it('produce the same optimal route cost on the main corridor', () => {
    const start: NodeId = 'Tasikmalaya';
    const goal: NodeId = 'Jakarta';

    const astar = runAStar(graph, start, goal);
    const ucs = runUCS(graph, start, goal);

    expect(astar.totalCost).toBe(ucs.totalCost);
    expect(astar.path).toEqual(ucs.path);
    expect(astar.path[0]).toBe(start);
    expect(astar.path[astar.path.length - 1]).toBe(goal);
    expect(astar.nodesVisited).toBeGreaterThan(0);
    expect(ucs.nodesVisited).toBeGreaterThan(0);
  });
});

describe('Benchmark statistics', () => {
  it('summarize numeric samples with median and standard deviation', () => {
    const stats = summarizeNumericValues([10, 20, 30, 40]);

    expect(stats.runs).toBe(4);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(40);
    expect(stats.mean).toBe(25);
    expect(stats.median).toBe(25);
    expect(stats.stdDev).toBeCloseTo(Math.sqrt(125), 10);
  });

  it('collects stable multi-run benchmark results', () => {
    const benchmark = benchmarkAlgorithm(() => runAStar(graph, 'Tasikmalaya', 'Jakarta'), 5);

    expect(benchmark.runs).toBe(5);
    expect(benchmark.stablePath).toBe(true);
    expect(benchmark.executionTime.median).toBeGreaterThanOrEqual(0);
    expect(benchmark.executionTime.stdDev).toBeGreaterThanOrEqual(0);
    expect(benchmark.nodesVisited.mean).toBeGreaterThan(0);
  });
});
