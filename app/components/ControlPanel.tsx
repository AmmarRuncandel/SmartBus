'use client';

import { MapPin, Play, RotateCcw, ChevronDown } from 'lucide-react';
import { NodeId, graph, terminals } from '../lib/graphData';
import TerminalSelect from './ControlPanel/TerminalSelect';
import { ALGORITHM_BADGES } from './ControlPanel/constants';

interface ControlPanelProps {
  start: NodeId;
  destination: NodeId;
  visualizationMode: 'comparison' | 'merged';
  isLoading: boolean;
  isBenchmarking?: boolean;
  benchmarkRuns: number;
  benchmarkRunOptions?: number[];
  onStartChange: (val: NodeId) => void;
  onDestinationChange: (val: NodeId) => void;
  onVisualizationModeChange: (mode: 'comparison' | 'merged') => void;
  onRun: () => void;
  onBenchmark?: () => void;
  onBenchmarkRunsChange?: (runs: number) => void;
  onReset: () => void;
}

export default function ControlPanel({
  start,
  destination,
  visualizationMode,
  isLoading,
  isBenchmarking = false,
  benchmarkRuns,
  benchmarkRunOptions = [10, 25, 50, 100],
  onStartChange,
  onDestinationChange,
  onVisualizationModeChange,
  onRun,
  onBenchmark,
  onBenchmarkRunsChange,
  onReset,
}: ControlPanelProps) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: '#EEEEEE',
        border: '1px solid rgba(219,26,26,0.15)',
        boxShadow: '0 4px 32px rgba(26,26,26,0.10)',
      }}
    >
      {/* Judul panel */}
      <div
        className="flex items-center gap-2 pb-3"
        style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
        >
          <MapPin size={16} color="#EEEEEE" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
            Pengaturan Simulasi
          </h3>
          <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
            Pilih rute yang ingin dianalisis
          </p>
        </div>
      </div>

      {/* Terminal asal */}
      <TerminalSelect
        label="Terminal Asal"
        id="start-terminal"
        value={start}
        options={terminals}
        excludeValue={destination}
        onChange={(v) => onStartChange(v as NodeId)}
        accentColor="#DB1A1A"
        getOptionLabel={(id) => graph[id as NodeId].displayName}
      />

      {/* Pemisah arah */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(26,26,26,0.12)' }} />
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: 'rgba(219,26,26,0.1)',
            border: '1px solid rgba(219,26,26,0.25)',
          }}
        >
          <ChevronDown size={16} color="#DB1A1A" />
        </div>
        <div className="flex-1 h-px" style={{ background: 'rgba(26,26,26,0.12)' }} />
      </div>

      {/* Terminal tujuan */}
      <TerminalSelect
        label="Terminal Tujuan"
        id="destination-terminal"
        value={destination}
        options={terminals}
        excludeValue={start}
        onChange={(v) => onDestinationChange(v as NodeId)}
        accentColor="#BD114A"
        getOptionLabel={(id) => graph[id as NodeId].displayName}
      />

      {/* Tombol aksi */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          id="run-simulation-btn"
          onClick={onRun}
          disabled={isLoading || isBenchmarking}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-[13px] leading-tight transition-all duration-200 active:scale-95"
          style={{
            background: isLoading
              ? 'rgba(219,26,26,0.5)'
              : 'linear-gradient(135deg, #DB1A1A, #BD114A)',
            color: '#EEEEEE',
            boxShadow: isLoading ? 'none' : '0 4px 16px rgba(219,26,26,0.35)',
            cursor: isLoading || isBenchmarking ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? (
            <span
              className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'rgba(238,238,238,0.5)',
                borderTopColor: '#EEEEEE',
              }}
            />
          ) : (
            <Play size={12} fill="#EEEEEE" />
          )}
          {isLoading ? 'Menghitung...' : 'Jalankan Simulasi'}
        </button>

        <button
          id="reset-btn"
          onClick={onReset}
          disabled={isLoading || isBenchmarking}
          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-[13px] font-semibold leading-tight transition-all duration-200 active:scale-95"
          style={{
            background: 'rgba(26,26,26,0.07)',
            color: '#1A1A1A',
            border: '1px solid rgba(26,26,26,0.12)',
            cursor: isLoading || isBenchmarking ? 'not-allowed' : 'pointer',
          }}
        >
          <RotateCcw size={12} />
          Atur Ulang
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="visualization-mode"
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(26,26,26,0.45)' }}
        >
          Mode Visualisasi
        </label>
        <select
          id="visualization-mode"
          value={visualizationMode}
          onChange={(event) =>
            onVisualizationModeChange(event.target.value as 'comparison' | 'merged')
          }
          disabled={isLoading || isBenchmarking}
          className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
          style={{
            background: 'rgba(26,26,26,0.06)',
            color: '#1A1A1A',
            border: '1px solid rgba(26,26,26,0.16)',
            cursor: isLoading || isBenchmarking ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="comparison">Comparasi (A* vs UCS)</option>
          <option value="merged">Penggabungan (Overlay)</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="benchmark-runs"
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(26,26,26,0.45)' }}
        >
          Jumlah Run Benchmark
        </label>
        <select
          id="benchmark-runs"
          value={benchmarkRuns}
          onChange={(event) => onBenchmarkRunsChange?.(Number(event.target.value))}
          disabled={isLoading || isBenchmarking || !onBenchmarkRunsChange}
          className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
          style={{
            background: 'rgba(26,26,26,0.06)',
            color: '#1A1A1A',
            border: '1px solid rgba(26,26,26,0.16)',
            cursor:
              isLoading || isBenchmarking || !onBenchmarkRunsChange
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {benchmarkRunOptions.map((runs) => (
            <option key={runs} value={runs}>
              {runs} run
            </option>
          ))}
        </select>

        <button
          id="benchmark-simulation-btn"
          onClick={onBenchmark}
          disabled={isLoading || isBenchmarking || !onBenchmark}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold leading-tight transition-all duration-200 active:scale-95"
          style={{
            background: 'rgba(26,26,26,0.04)',
            color: '#1A1A1A',
            border: '1px dashed rgba(26,26,26,0.18)',
            cursor: isLoading || isBenchmarking || !onBenchmark ? 'not-allowed' : 'pointer',
          }}
        >
          {isBenchmarking ? (
            <span
              className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'rgba(26,26,26,0.25)',
                borderTopColor: '#DB1A1A',
              }}
            />
          ) : null}
          {isBenchmarking ? 'Benchmarking...' : `Benchmark ${benchmarkRuns}x`}
        </button>
      </div>

      {/* Keterangan rumus algoritma */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {ALGORITHM_BADGES.map(({ name, rumus, keterangan, color }) => (
          <div
            key={name}
            className="p-2.5 rounded-xl"
            style={{
              background: 'rgba(26,26,26,0.05)',
              border: `1px solid ${color}25`,
            }}
          >
            <p className="text-xs font-bold" style={{ color }}>
              {name}
            </p>
            <p
              className="text-xs font-mono mt-0.5"
              style={{ color: 'rgba(26,26,26,0.55)' }}
            >
              {rumus}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'rgba(26,26,26,0.4)' }}
            >
              {keterangan}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
