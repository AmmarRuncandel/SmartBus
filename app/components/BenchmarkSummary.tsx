'use client';

import { Sigma, GitCompareArrows, CheckCircle2 } from 'lucide-react';
import { BenchmarkResult, formatDuration } from '../lib/benchmark';

interface BenchmarkSummaryProps {
  astar: BenchmarkResult;
  ucs: BenchmarkResult;
}

export default function BenchmarkSummary({ astar, ucs }: BenchmarkSummaryProps) {
  const fasterMedian = astar.executionTime.median <= ucs.executionTime.median ? 'astar' : 'ucs';

  return (
    <section
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: '#EEEEEE',
        border: '1px solid rgba(26,26,26,0.10)',
        boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
        >
          <GitCompareArrows size={15} color="#EEEEEE" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
            Benchmark Multi-Run
          </h3>
          <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
            Ringkasan multi-run untuk waktu eksekusi, median, dan deviasi standar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BenchmarkCard
          title="A* Search"
          color="#DB1A1A"
          result={astar}
          emphasized={fasterMedian === 'astar'}
        />
        <BenchmarkCard
          title="Uniform Cost Search"
          color="#BD114A"
          result={ucs}
          emphasized={fasterMedian === 'ucs'}
        />
      </div>

      <div
        className="mt-4 rounded-xl p-3 flex items-start gap-2"
        style={{ background: 'rgba(219,26,26,0.06)', border: '1px solid rgba(219,26,26,0.16)' }}
      >
        <CheckCircle2 size={15} color="#DB1A1A" className="mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,26,26,0.58)' }}>
          Benchmark dijalankan berulang pada pasangan asal-tujuan yang sama. Untuk analisis yang lebih stabil,
          median lebih representatif daripada satu kali pengukuran karena mengurangi pengaruh noise runtime.
        </p>
      </div>

      <p className="text-[11px] mt-3" style={{ color: 'rgba(26,26,26,0.45)' }}>
        Warm-up: {astar.warmupRuns} run per algoritma sebelum {astar.runs} run pengukuran.
      </p>
    </section>
  );
}

function BenchmarkCard({
  title,
  color,
  result,
  emphasized,
}: {
  title: string;
  color: string;
  result: BenchmarkResult;
  emphasized: boolean;
}) {
  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#EEEEEE',
        border: `1px solid ${color}${emphasized ? '55' : '25'}`,
        boxShadow: emphasized ? '0 8px 28px rgba(26,26,26,0.10)' : '0 2px 12px rgba(26,26,26,0.07)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${color}, ${color === '#DB1A1A' ? '#BD114A' : '#8B0E37'})` }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: '#EEEEEE' }}>
            {title}
          </p>
          <p className="text-xs" style={{ color: 'rgba(238,238,238,0.75)' }}>
            {result.runs} runs
          </p>
        </div>
        <Sigma size={14} color="#EEEEEE" />
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <BenchmarkMetric label="Median" value={formatDuration(result.executionTime.median)} color={color} />
        <BenchmarkMetric label="Std Dev" value={formatDuration(result.executionTime.stdDev)} color={color} />
        <BenchmarkMetric label="Mean" value={formatDuration(result.executionTime.mean)} color={color} />
        <BenchmarkMetric label="Range" value={`${formatDuration(result.executionTime.min)} - ${formatDuration(result.executionTime.max)}`} color={color} />
      </div>

      <div className="px-4 pb-4 space-y-2">
        <div className="rounded-xl p-3" style={{ background: 'rgba(26,26,26,0.04)' }}>
          <p className="text-xs font-semibold" style={{ color: 'rgba(26,26,26,0.55)' }}>
            Stabilitas jalur
          </p>
          <p className="text-xs mt-1" style={{ color: '#1A1A1A' }}>
            {result.stablePath ? 'Jalur konsisten pada semua run.' : 'Ada variasi jalur antar run.'}
          </p>
        </div>

        <div className="rounded-xl p-3" style={{ background: 'rgba(26,26,26,0.04)' }}>
          <p className="text-xs font-semibold" style={{ color: 'rgba(26,26,26,0.55)' }}>
            Metrik tambahan
          </p>
          <p className="text-xs mt-1" style={{ color: '#1A1A1A' }}>
            Simpul rata-rata {result.nodesVisited.mean.toFixed(2)}, antrian puncak rata-rata {result.maxQueueSize.mean.toFixed(2)}, biaya rata-rata {result.totalCost.mean.toFixed(2)} km.
          </p>
        </div>
      </div>
    </article>
  );
}

function BenchmarkMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(26,26,26,0.5)' }}>
        {label}
      </p>
      <p className="text-sm font-bold mt-1" style={{ color: '#1A1A1A' }}>
        {value}
      </p>
    </div>
  );
}
