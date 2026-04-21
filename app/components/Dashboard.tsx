'use client';

import { useState, useCallback, useEffect } from 'react';
import { AlgorithmResult, runAStar, runHybridAStarUCS, runUCS } from '../lib/algorithms';
import { graph, NodeId, terminals, getTerminalLabel } from '../lib/graphData';
import { benchmarkAlgorithm, BenchmarkResult, formatDuration } from '../lib/benchmark';
import ControlPanel from './ControlPanel';
import VisualizationPanel from './VisualizationPanel';
import AnalyticsCards from './AnalyticsCards';
import BenchmarkSummary from './BenchmarkSummary';
import ScrollReveal from './ui/ScrollReveal';
import DashboardSkeleton from './dashboard/DashboardSkeleton';

interface HasilSimulasi {
  astar: AlgorithmResult;
  ucs: AlgorithmResult;
}

interface HasilBenchmark {
  astar: BenchmarkResult;
  ucs: BenchmarkResult;
  runs: number;
}

export default function Dashboard() {
  const [start, setStart] = useState<NodeId>('Tasikmalaya');
  const [destination, setDestination] = useState<NodeId>('Jakarta');
  const [simulationMode, setSimulationMode] = useState<'comparison' | 'hybrid'>('comparison');
  const [benchmarkRuns, setBenchmarkRuns] = useState(25);
  const [hasil, setHasil] = useState<HasilSimulasi | null>(null);
  const [hasilHybrid, setHasilHybrid] = useState<AlgorithmResult | null>(null);
  const [hasilBenchmark, setHasilBenchmark] = useState<HasilBenchmark | null>(null);
  const [sedangBerjalan, setSedangBerjalan] = useState(false);
  const [sedangBenchmark, setSedangBenchmark] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsBootLoading(false);
    }, 850);

    return () => window.clearTimeout(timer);
  }, []);

  const jalankanSimulasi = useCallback(async () => {
    if (start === destination) return;

    setSedangBerjalan(true);
    setHasil(null);
    setHasilHybrid(null);

    // Jeda singkat agar animasi loading terlihat
    await new Promise((r) => setTimeout(r, 300));

    if (simulationMode === 'comparison') {
      // Warm-up ringan untuk mengurangi bias JIT pada pengukuran satu kali run
      runAStar(graph, start, destination);
      runUCS(graph, start, destination);

      const astar = runAStar(graph, start, destination);
      const ucs = runUCS(graph, start, destination);
      setHasil({ astar, ucs });
      setHasilHybrid(null);
    } else {
      runHybridAStarUCS(graph, start, destination);
      const hybrid = runHybridAStarUCS(graph, start, destination);
      setHasilHybrid(hybrid);
      setHasil(null);
      setHasilBenchmark(null);
    }

    setSedangBerjalan(false);
  }, [destination, simulationMode, start]);

  const jalankanBenchmark = useCallback(async () => {
    if (start === destination || simulationMode !== 'comparison') return;

    setSedangBenchmark(true);
    setHasilBenchmark(null);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const astar = benchmarkAlgorithm(() => runAStar(graph, start, destination), benchmarkRuns);
    const ucs = benchmarkAlgorithm(() => runUCS(graph, start, destination), benchmarkRuns);

    setHasilBenchmark({ astar, ucs, runs: benchmarkRuns });
    setSedangBenchmark(false);
  }, [benchmarkRuns, destination, simulationMode, start]);

  const aturUlang = useCallback(() => {
    setHasil(null);
    setHasilHybrid(null);
    setHasilBenchmark(null);
    setStart('Tasikmalaya');
    setDestination('Jakarta');
  }, []);

  return (
    <main
      id="dashboard"
      className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-10"
      style={{ background: '#EEEEEE' }}
    >
      {/* Pemisah seksi */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="flex-1 h-px"
          style={{ background: 'rgba(26,26,26,0.1)' }}
        />
        <span
          className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(219,26,26,0.1)',
            color: '#DB1A1A',
            border: '1px solid rgba(219,26,26,0.25)',
          }}
        >
          Dasbor Simulasi
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: 'rgba(26,26,26,0.1)' }}
        />
      </div>

      {/* Tata letak utama */}
      {isBootLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Kolom kiri: panel kontrol */}
        <div className="flex flex-col gap-6">
          <ScrollReveal>
            <ControlPanel
              start={start}
              destination={destination}
              simulationMode={simulationMode}
              isLoading={sedangBerjalan}
              isBenchmarking={sedangBenchmark}
              benchmarkRuns={benchmarkRuns}
              onStartChange={setStart}
              onDestinationChange={setDestination}
              onSimulationModeChange={setSimulationMode}
              onRun={jalankanSimulasi}
              onBenchmark={jalankanBenchmark}
              onBenchmarkRunsChange={setBenchmarkRuns}
              onReset={aturUlang}
            />
          </ScrollReveal>

          {/* Peta jaringan terminal */}
          <ScrollReveal delayMs={80}>
            <div
              className="rounded-2xl p-4"
              style={{
                background: '#EEEEEE',
                border: '1px solid rgba(26,26,26,0.10)',
                boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'rgba(26,26,26,0.45)' }}
              >
                Jaringan Terminal
              </p>
              <div className="flex flex-wrap gap-1.5">
                {terminals.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background:
                        t === start
                          ? '#DB1A1A'
                          : t === destination
                            ? '#BD114A'
                            : 'rgba(26,26,26,0.07)',
                      color:
                        t === start || t === destination
                          ? '#EEEEEE'
                          : '#1A1A1A',
                    }}
                  >
                    {getTerminalLabel(t)}
                  </span>
                ))}
              </div>
              <div
                className="flex gap-4 mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}
              >
                <ItemLegenda color="#DB1A1A" label="Asal" />
                <ItemLegenda color="#BD114A" label="Tujuan" />
                <ItemLegenda color="rgba(26,26,26,0.25)" label="Transit" />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Kolom kanan: hasil simulasi */}
        <div className="flex flex-col gap-6">
          {/* Visualisasi jalur */}
          <ScrollReveal delayMs={100}>
            <div
              className="rounded-2xl p-6"
              style={{
                background: '#EEEEEE',
                border: '1px solid rgba(26,26,26,0.09)',
                boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
              }}
            >
              <VisualizationPanel
                astar={hasil?.astar ?? null}
                ucs={hasil?.ucs ?? null}
                hybrid={hasilHybrid}
                start={start}
                destination={destination}
                mode={simulationMode}
              />
            </div>
          </ScrollReveal>

          {simulationMode === 'comparison' ? (
            <ScrollReveal delayMs={140}>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: '#EEEEEE',
                  border: '1px solid rgba(26,26,26,0.09)',
                  boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
                }}
              >
                <AnalyticsCards
                  astar={hasil?.astar ?? null}
                  ucs={hasil?.ucs ?? null}
                />
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal delayMs={140}>
              <HybridSummaryCard hybrid={hasilHybrid} />
            </ScrollReveal>
          )}

          {simulationMode === 'comparison' && hasilBenchmark && (
            <ScrollReveal delayMs={180}>
              <BenchmarkSummary astar={hasilBenchmark.astar} ucs={hasilBenchmark.ucs} />
            </ScrollReveal>
          )}
        </div>
      </div>
      )}
    </main>
  );
}

function HybridSummaryCard({ hybrid }: { hybrid: AlgorithmResult | null }) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{
        background: '#EEEEEE',
        border: '1px solid rgba(26,26,26,0.09)',
        boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
      }}
    >
      <h3 className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
        Ringkasan Hybrid A*-UCS
      </h3>
      <p className="text-xs mt-1" style={{ color: 'rgba(26,26,26,0.5)' }}>
        Satu pipeline pencarian dengan prioritas adaptif g + alpha*h.
      </p>

      {hybrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <MiniMetric label="Biaya Rute" value={`${hybrid.totalCost} km`} />
          <MiniMetric label="Simpul Dievaluasi" value={`${hybrid.nodesVisited}`} />
          <MiniMetric label="Puncak Antrian" value={`${hybrid.maxQueueSize}`} />
          <MiniMetric label="Waktu Eksekusi" value={formatDuration(hybrid.executionTime)} />
        </div>
      ) : (
        <p className="text-xs mt-4" style={{ color: 'rgba(26,26,26,0.45)' }}>
          Jalankan simulasi untuk melihat metrik hybrid.
        </p>
      )}
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'rgba(26,26,26,0.04)', border: '1px solid rgba(26,26,26,0.08)' }}
    >
      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(26,26,26,0.5)' }}>
        {label}
      </p>
      <p className="text-sm font-bold mt-1" style={{ color: '#1A1A1A' }}>
        {value}
      </p>
    </div>
  );
}

function ItemLegenda({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
      <span className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
        {label}
      </span>
    </div>
  );
}
