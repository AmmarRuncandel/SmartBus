'use client';

import { Bus, ChevronRight, AlertCircle, Navigation } from 'lucide-react';
import { AlgorithmResult } from '../lib/algorithms';
import { NodeId, graph } from '../lib/graphData';

interface VisualizationPanelProps {
  astar: AlgorithmResult | null;
  ucs: AlgorithmResult | null;
  start: NodeId;
  destination: NodeId;
  mode: 'comparison' | 'merged';
}

export default function VisualizationPanel({
  astar,
  ucs,
  mode,
}: VisualizationPanelProps) {
  const hasResults = astar && ucs;

  return (
    <div className="flex flex-col gap-4">
      {/* Judul panel */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
        >
          <Navigation size={16} color="#EEEEEE" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
            Visualisasi Rute
          </h3>
          <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
            {mode === 'comparison'
              ? 'Jalur terpendek dan urutan ekspansi simpul'
              : 'Overlay rute dan timeline kunjungan gabungan'}
          </p>
        </div>
      </div>

      {!hasResults ? (
        /* Kondisi awal sebelum simulasi */
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-14 gap-3"
          style={{
            background: '#EEEEEE',
            border: '1.5px dashed rgba(219,26,26,0.25)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(219,26,26,0.08)' }}
          >
            <Bus size={26} color="#DB1A1A" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'rgba(26,26,26,0.5)' }}>
            Belum ada hasil simulasi
          </p>
          <p
            className="text-xs text-center max-w-xs"
            style={{ color: 'rgba(26,26,26,0.35)' }}
          >
            Pilih terminal asal dan tujuan, lalu klik{' '}
            <strong>Jalankan Simulasi</strong> untuk melihat hasilnya.
          </p>
        </div>
      ) : (
        <>
          {mode === 'comparison' ? (
            <>
              {/* Tampilan jalur optimal */}
              <TampilJalur result={astar} label="Jalur Terbaik A*" color="#DB1A1A" />
              <TampilJalur result={ucs} label="Jalur Terbaik UCS" color="#BD114A" />

              {/* Log ekspansi simpul berdampingan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LogEkspansi
                  title="Urutan Kunjungan A*"
                  log={astar.expansionLog}
                  color="#DB1A1A"
                  tampilkanFCost
                />
                <LogEkspansi
                  title="Urutan Kunjungan UCS"
                  log={ucs.expansionLog}
                  color="#BD114A"
                  tampilkanFCost={false}
                />
              </div>
            </>
          ) : (
            <>
              <TampilJalurGabungan astar={astar} ucs={ucs} />
              <TimelineGabungan astar={astar} ucs={ucs} />
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponen tampilan jalur rute
// ---------------------------------------------------------------------------

function TampilJalur({
  result,
  label,
  color,
}: {
  result: AlgorithmResult;
  label: string;
  color: string;
}) {
  if (!result.path.length) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: '#EEEEEE', border: `1px solid ${color}20` }}
      >
        <AlertCircle size={16} color={color} />
        <span className="text-sm font-medium" style={{ color: 'rgba(26,26,26,0.6)' }}>
          {label}: Tidak ada jalur yang ditemukan
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: '#EEEEEE',
        border: `1px solid ${color}22`,
        boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: color }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color }}
          >
            {label}
          </span>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: `${color}15`, color }}
        >
          {result.totalCost} km
        </span>
      </div>

      {/* Rantai simpul rute */}
      <div className="flex flex-wrap items-center gap-1.5">
        {result.path.map((node, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <BadgeSimpul
              name={graph[node].displayName}
              color={color}
              isFirst={idx === 0}
              isLast={idx === result.path.length - 1}
            />
            {idx < result.path.length - 1 && (
              <ChevronRight size={14} color={`${color}80`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeSimpul({
  name,
  color,
  isFirst,
  isLast,
}: {
  name: string;
  color: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const ditandai = isFirst || isLast;
  return (
    <div
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all"
      style={{
        background: ditandai ? color : `${color}12`,
        color: ditandai ? '#EEEEEE' : color,
        border: `1px solid ${color}30`,
      }}
    >
      <Bus size={10} />
      <span>{name}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponen log ekspansi simpul
// ---------------------------------------------------------------------------

interface EntriLog {
  node: string;
  gCost: number;
  fCost?: number;
}

function LogEkspansi({
  title,
  log,
  color,
  tampilkanFCost,
}: {
  title: string;
  log: EntriLog[];
  color: string;
  tampilkanFCost: boolean;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#EEEEEE',
        border: `1px solid ${color}20`,
        boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
      }}
    >
      {/* Header log */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{
          background: `${color}10`,
          borderBottom: `1px solid ${color}20`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: color }}
        />
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {title}
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${color}15`, color }}
        >
          {log.length} langkah
        </span>
      </div>

      {/* Baris log */}
      <div className="p-3 flex flex-col gap-1.5 max-h-60 overflow-y-auto">
        {log.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all"
            style={{
              background:
                idx % 2 === 0 ? 'rgba(26,26,26,0.04)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs w-5 text-center"
                style={{ color: 'rgba(26,26,26,0.3)' }}
              >
                {idx + 1}
              </span>
              <Bus size={11} color={color} />
              <span className="font-semibold" style={{ color: '#1A1A1A' }}>
                {graph[entry.node as NodeId].displayName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono"
                style={{ color: 'rgba(26,26,26,0.5)' }}
              >
                g={entry.gCost}
              </span>
              {tampilkanFCost && entry.fCost !== undefined && (
                <span className="font-mono font-bold" style={{ color }}>
                  f={entry.fCost}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TampilJalurGabungan({
  astar,
  ucs,
}: {
  astar: AlgorithmResult;
  ucs: AlgorithmResult;
}) {
  const astarNodes = new Set(astar.path);
  const ucsNodes = new Set(ucs.path);
  const unionPath = Array.from(new Set([...astar.path, ...ucs.path]));

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: '#EEEEEE',
        border: '1px solid rgba(26,26,26,0.16)',
        boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: '#1A1A1A' }}
        >
          Jalur Gabungan A* + UCS
        </span>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <LegendaMini color="#DB1A1A" label="A*" />
          <LegendaMini color="#BD114A" label="UCS" />
          <LegendaMini color="#7A1FA2" label="Irisan" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {unionPath.map((node, idx) => {
          const inAStar = astarNodes.has(node);
          const inUcs = ucsNodes.has(node);
          const isBoth = inAStar && inUcs;
          const color = isBoth ? '#7A1FA2' : inAStar ? '#DB1A1A' : '#BD114A';

          return (
            <div key={node + String(idx)} className="flex items-center gap-1.5">
              <BadgeSimpul
                name={graph[node].displayName}
                color={color}
                isFirst={idx === 0}
                isLast={idx === unionPath.length - 1}
              />
              {idx < unionPath.length - 1 && (
                <ChevronRight size={14} color="rgba(26,26,26,0.35)" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineGabungan({
  astar,
  ucs,
}: {
  astar: AlgorithmResult;
  ucs: AlgorithmResult;
}) {
  const maxSteps = Math.max(astar.expansionLog.length, ucs.expansionLog.length);
  const rows = Array.from({ length: maxSteps }, (_, i) => {
    const aStep = astar.expansionLog[i];
    const uStep = ucs.expansionLog[i];

    return {
      index: i + 1,
      astarNode: aStep ? graph[aStep.node as NodeId].displayName : '-',
      ucsNode: uStep ? graph[uStep.node as NodeId].displayName : '-',
      sameNode: !!aStep && !!uStep && aStep.node === uStep.node,
    };
  });

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#EEEEEE',
        border: '1px solid rgba(26,26,26,0.16)',
        boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center"
        style={{
          background: 'rgba(26,26,26,0.04)',
          borderBottom: '1px solid rgba(26,26,26,0.10)',
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: '#1A1A1A' }}
        >
          Timeline Sinkron Kunjungan Node
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(26,26,26,0.08)', color: '#1A1A1A' }}
        >
          {maxSteps} langkah
        </span>
      </div>

      <div className="p-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {rows.map((row) => (
          <div
            key={row.index}
            className="grid grid-cols-[44px_1fr_1fr] items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: row.sameNode
                ? 'rgba(122,31,162,0.08)'
                : row.index % 2 === 0
                  ? 'rgba(26,26,26,0.04)'
                  : 'transparent',
            }}
          >
            <span
              className="font-mono text-center"
              style={{ color: 'rgba(26,26,26,0.35)' }}
            >
              {row.index}
            </span>
            <span className="font-semibold" style={{ color: '#DB1A1A' }}>
              {row.astarNode}
            </span>
            <span className="font-semibold" style={{ color: '#BD114A' }}>
              {row.ucsNode}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendaMini({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span style={{ color: 'rgba(26,26,26,0.65)' }}>{label}</span>
    </span>
  );
}
