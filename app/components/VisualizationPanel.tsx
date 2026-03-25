'use client';

import { Bus, ChevronRight, AlertCircle, Navigation } from 'lucide-react';
import { AlgorithmResult } from '../lib/algorithms';
import { NodeId } from '../lib/graphData';

interface VisualizationPanelProps {
  astar: AlgorithmResult | null;
  ucs: AlgorithmResult | null;
  start: NodeId;
  destination: NodeId;
}

export default function VisualizationPanel({
  astar,
  ucs,
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
            Jalur terpendek dan urutan ekspansi simpul
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
              name={node}
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
                {entry.node}
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
