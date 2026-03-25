'use client';

import { MapPin, Play, RotateCcw, ChevronDown } from 'lucide-react';
import { NodeId, terminals } from '../../lib/graphData';
import TerminalSelect from '../ControlPanel/TerminalSelect';
import { ALGORITHM_BADGES } from '../ControlPanel/constants';

interface ControlPanelProps {
  start: NodeId;
  destination: NodeId;
  isLoading: boolean;
  onStartChange: (val: NodeId) => void;
  onDestinationChange: (val: NodeId) => void;
  onRun: () => void;
  onReset: () => void;
}

export default function ControlPanel({
  start,
  destination,
  isLoading,
  onStartChange,
  onDestinationChange,
  onRun,
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
      />

      {/* Tombol aksi */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          id="run-simulation-btn"
          onClick={onRun}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-[13px] leading-tight transition-all duration-200 active:scale-95"
          style={{
            background: isLoading
              ? 'rgba(219,26,26,0.5)'
              : 'linear-gradient(135deg, #DB1A1A, #BD114A)',
            color: '#EEEEEE',
            boxShadow: isLoading ? 'none' : '0 4px 16px rgba(219,26,26,0.35)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
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
          className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-[13px] font-semibold leading-tight transition-all duration-200 active:scale-95"
          style={{
            background: 'rgba(26,26,26,0.07)',
            color: '#1A1A1A',
            border: '1px solid rgba(26,26,26,0.12)',
          }}
        >
          <RotateCcw size={12} />
          Atur Ulang
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
