import { AlgorithmResult } from './algorithms';

export interface NumericSummary {
  runs: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

export interface BenchmarkResult {
  runs: number;
  warmupRuns: number;
  executionTime: NumericSummary;
  nodesVisited: NumericSummary;
  totalCost: NumericSummary;
  maxQueueSize: NumericSummary;
  pathLength: NumericSummary;
  stablePath: boolean;
}

export function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${ms.toFixed(6)} ms`;
  }
  return `${ms.toFixed(4)} ms`;
}

function summarize(values: number[]): NumericSummary {
  if (values.length === 0) {
    throw new Error('Benchmark requires at least one sample.');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const total = values.reduce((accumulator, value) => accumulator + value, 0);
  const mean = total / values.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  const variance =
    values.reduce((accumulator, value) => accumulator + (value - mean) ** 2, 0) /
    values.length;

  return {
    runs: values.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median,
    stdDev: Math.sqrt(variance),
  };
}

export function benchmarkAlgorithm(
  runner: () => AlgorithmResult,
  runs = 25,
  warmupRuns = 5,
): BenchmarkResult {
  if (runs <= 0) {
    throw new Error('Benchmark runs must be greater than zero.');
  }

  if (warmupRuns < 0) {
    throw new Error('Benchmark warmup runs cannot be negative.');
  }

  for (let i = 0; i < warmupRuns; i++) {
    runner();
  }

  const results = Array.from({ length: runs }, () => runner());
  const firstPath = results[0].path.join(' -> ');

  return {
    runs,
    warmupRuns,
    executionTime: summarize(results.map((result) => result.executionTime)),
    nodesVisited: summarize(results.map((result) => result.nodesVisited)),
    totalCost: summarize(results.map((result) => result.totalCost)),
    maxQueueSize: summarize(results.map((result) => result.maxQueueSize)),
    pathLength: summarize(results.map((result) => result.path.length)),
    stablePath: results.every((result) => result.path.join(' -> ') === firstPath),
  };
}

export function summarizeNumericValues(values: number[]): NumericSummary {
  return summarize(values);
}