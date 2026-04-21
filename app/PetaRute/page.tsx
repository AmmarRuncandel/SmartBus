'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Bus,
  Info,
  MapPin,
  GitBranch,
  Table2,
  Layers,
  ChevronRight,
  Home,
  ArrowRight,
  Network,
} from 'lucide-react';
import { graph, NodeId, terminals, getTerminalLabel } from '../lib/graphData';
import { runAStar, runUCS } from '../lib/algorithms';
import TerminalSelect from '../components/ControlPanel/TerminalSelect';
import ScrollReveal from '../components/ui/ScrollReveal';

// ---------------------------------------------------------------------------
// Koordinat simpul dalam kanvas SVG (viewBox 1000x520)
// ---------------------------------------------------------------------------
const SVG_WIDTH = 1320;
const SVG_HEIGHT = 720;
const SVG_PADDING_X = 120;
const SVG_PADDING_Y = 88;

const NODE_LAYOUT_OFFSET: Partial<Record<NodeId, { x: number; y: number }>> = {
  Tasikmalaya: { x: -34, y: 40 },
  Garut: { x: 60, y: 22 },
  Bandung: { x: 8, y: -46 },
  Sumedang: { x: 30, y: 8 },
  Cirebon: { x: 26, y: -30 },
  Purwakarta: { x: -24, y: -42 },
  Bekasi: { x: 74, y: -14 },
  Jakarta: { x: 30, y: -8 },
};

const POSISI_SIMPUL: Record<NodeId, { x: number; y: number }> = (() => {
  const latitudes = terminals.map((id) => graph[id].lat);
  const longitudes = terminals.map((id) => graph[id].lon);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const lonRange = Math.max(maxLon - minLon, 0.0001);
  const latRange = Math.max(maxLat - minLat, 0.0001);

  return terminals.reduce((positions, id) => {
    const manualOffset = NODE_LAYOUT_OFFSET[id] ?? { x: 0, y: 0 };
    positions[id] = {
      x:
        SVG_PADDING_X +
        ((graph[id].lon - minLon) / lonRange) * (SVG_WIDTH - SVG_PADDING_X * 2) +
        manualOffset.x,
      y:
        SVG_PADDING_Y +
        ((maxLat - graph[id].lat) / latRange) * (SVG_HEIGHT - SVG_PADDING_Y * 2) +
        manualOffset.y,
    };
    return positions;
  }, {} as Record<NodeId, { x: number; y: number }>);
})();

const WARNA_WILAYAH: Record<NodeId, string> = {
  Tasikmalaya: '#7C3AED',
  Garut:       '#7C3AED',
  Bandung:     '#DB1A1A',
  Sumedang:    '#DB1A1A',
  Cirebon:     '#B45309',
  Purwakarta:  '#0369A1',
  Bekasi:      '#0369A1',
  Jakarta:     '#15803D',
};

function getSisiUnik() {
  const sudahAda = new Set<string>();
  const sisi: { dari: NodeId; ke: NodeId; biaya: number }[] = [];
  for (const node of terminals) {
    for (const edge of graph[node as NodeId].edges) {
      const k = [node, edge.to].sort().join('|');
      if (!sudahAda.has(k)) {
        sudahAda.add(k);
        sisi.push({ dari: node as NodeId, ke: edge.to, biaya: edge.cost });
      }
    }
  }
  return sisi;
}

// ---------------------------------------------------------------------------
export default function PetaRutePage() {
  const [simpulDipilih, setSimpulDipilih] = useState<NodeId | null>(null);
  const [simpulPulse, setSimpulPulse] = useState<NodeId | null>(null);
  const [pulseTick, setPulseTick] = useState(0);
  const [asal, setAsal]     = useState<NodeId>('Tasikmalaya');
  const [tujuan, setTujuan] = useState<NodeId>('Jakarta');
  const [jalurAstar, setJalurAstar] = useState<NodeId[]>([]);
  const [jalurUCS, setJalurUCS]     = useState<NodeId[]>([]);
  const [sudahCari, setSudahCari]   = useState(false);
  // Skeleton state — mirip dengan Dashboard.tsx
  const [isMounted, setIsMounted]   = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 750);
    return () => window.clearTimeout(t);
  }, []);

  const sisiSemua = useMemo(() => getSisiUnik(), []);
  const ruteValid = asal !== tujuan;

  const sisiDiSorot = (dari: NodeId, ke: NodeId, jalur: NodeId[]) => {
    for (let i = 0; i < jalur.length - 1; i++) {
      if (
        (jalur[i] === dari && jalur[i + 1] === ke) ||
        (jalur[i] === ke && jalur[i + 1] === dari)
      ) return true;
    }
    return false;
  };

  const cariJalur = () => {
    if (asal === tujuan) return;
    const ra = runAStar(graph, asal, tujuan);
    const ru = runUCS(graph, asal, tujuan);
    setJalurAstar(ra.path);
    setJalurUCS(ru.path);
    setSudahCari(true);
  };

  const aturUlang = () => {
    setJalurAstar([]);
    setJalurUCS([]);
    setSudahCari(false);
    setSimpulDipilih(null);
  };

  const pilihSebagaiAsal = (node: NodeId) => {
    if (node === tujuan) return;
    setAsal(node);
    setJalurAstar([]);
    setJalurUCS([]);
    setSudahCari(false);
  };

  const pilihSebagaiTujuan = (node: NodeId) => {
    if (node === asal) return;
    setTujuan(node);
    setJalurAstar([]);
    setJalurUCS([]);
    setSudahCari(false);
  };

  const sorotSimpulSebentar = (node: NodeId) => {
    setSimpulPulse(node);
    setPulseTick((value) => value + 1);
    window.setTimeout(() => {
      setSimpulPulse((current) => (current === node ? null : current));
    }, 420);
  };

  const nodeDipilih = simpulDipilih ? graph[simpulDipilih] : null;

  return (
    <div style={{ background: '#EEEEEE', minHeight: '100vh' }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div
        className="pt-[72px]"
        style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2a1010 100%)' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <nav className="flex items-center gap-2 mb-5" style={{ color: 'rgba(238,238,238,0.4)' }}>
            <Link href="/" className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity">
              <Home size={11} /> Beranda
            </Link>
            <ChevronRight size={11} />
            <span className="text-xs" style={{ color: '#DB1A1A' }}>Peta Rute</span>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
                >
                  <Network size={18} color="#EEEEEE" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#EEEEEE' }}>
                  Peta Jaringan Terminal
                </h1>
              </div>
              <p className="text-sm max-w-xl leading-relaxed" style={{ color: 'rgba(238,238,238,0.55)' }}>
                Visualisasi graf 8 terminal bus antar kota di Jawa Barat dan Jakarta
                lengkap dengan bobot sisi (km) dan nilai heuristik h(n) yang dipakai oleh A* dan UCS.
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'rgba(219,26,26,0.15)',
                border: '1px solid rgba(219,26,26,0.35)',
                color: '#EEEEEE',
              }}
            >
              <Bus size={14} /> Ke Dasbor Simulasi
            </Link>
          </div>
        </div>
      </div>

      {/* ── KONTEN ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* ── Skeleton saat belum siap ── */}
        {!isMounted ? (
          <PetaRuteSkeleton />
        ) : (
          <>

          {/* Panel sorot jalur */}
          <ScrollReveal delayMs={0}>
            <div
              className="rounded-2xl p-6"
              style={{
                background: '#EEEEEE',
                border: '1px solid rgba(219,26,26,0.15)',
                boxShadow: '0 4px 32px rgba(26,26,26,0.10)',
              }}
            >
              {/* Judul */}
              <div className="flex items-center gap-2 pb-4 mb-5" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}>
                  <GitBranch size={15} color="#EEEEEE" />
                </div>
                <div>
                  <h2 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>Sorotan Jalur Algoritma</h2>
                  <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
                    Pilih asal dan tujuan untuk menyorot jalur A* (merah) dan UCS (ungu) pada graf
                  </p>
                </div>
              </div>

              {/* Kontrol */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] items-end gap-4">
                <TerminalSelect
                  label="Terminal Asal"
                  id="peta-asal"
                  value={asal}
                  options={terminals}
                  excludeValue={tujuan}
                  onChange={(v) => { setAsal(v as NodeId); aturUlang(); }}
                  accentColor="#DB1A1A"
                />
                <div className="flex items-center justify-center pb-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(219,26,26,0.08)', border: '1px solid rgba(219,26,26,0.2)' }}
                  >
                    <ArrowRight size={14} color="#DB1A1A" />
                  </div>
                </div>
                <TerminalSelect
                  label="Terminal Tujuan"
                  id="peta-tujuan"
                  value={tujuan}
                  options={terminals}
                  excludeValue={asal}
                  onChange={(v) => { setTujuan(v as NodeId); aturUlang(); }}
                  accentColor="#BD114A"
                />
                <div className="flex gap-2 pb-1">
                  <button
                    onClick={cariJalur}
                    disabled={!ruteValid}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95"
                    style={{
                      background: ruteValid
                        ? 'linear-gradient(135deg, #DB1A1A, #BD114A)'
                        : 'rgba(26,26,26,0.18)',
                      color: '#EEEEEE',
                      boxShadow: ruteValid ? '0 4px 16px rgba(219,26,26,0.35)' : 'none',
                      cursor: ruteValid ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <GitBranch size={14} /> Sorot Jalur
                  </button>
                  {sudahCari && (
                    <button
                      onClick={aturUlang}
                      className="px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95"
                      style={{ background: 'rgba(26,26,26,0.07)', color: '#1A1A1A', border: '1px solid rgba(26,26,26,0.12)' }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {!ruteValid && (
                <p className="mt-3 text-xs font-medium" style={{ color: '#B45309' }}>
                  Terminal asal dan tujuan tidak boleh sama.
                </p>
              )}

              {/* Hasil jalur dengan pop-fade */}
              {sudahCari && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="pop-fade is-visible" style={{ transitionDelay: '0ms' }}>
                    <HasilJalur label="Jalur A*" jalur={jalurAstar} color="#DB1A1A" />
                  </div>
                  <div className="pop-fade is-visible" style={{ transitionDelay: '80ms' }}>
                    <HasilJalur label="Jalur UCS" jalur={jalurUCS} color="#7C3AED" />
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Graf SVG + Panel simpul */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

            {/* ── Graf SVG ─────── */}
            <ScrollReveal delayMs={60}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#EEEEEE',
                  border: '1px solid rgba(26,26,26,0.10)',
                  boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
                }}
              >
                {/* Header */}
                <div className="px-5 py-3.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
                  <div className="flex items-center gap-2">
                    <Layers size={14} color="#DB1A1A" />
                    <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>Graf Jaringan Terminal</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(26,26,26,0.4)' }}>
                    <LegendaGaris warna="#DB1A1A" label="Jalur A*" solid />
                    <LegendaGaris warna="#7C3AED" label="Jalur UCS" solid />
                    <LegendaGaris warna="rgba(26,26,26,0.3)" label="Koneksi" solid={false} />
                  </div>
                </div>

                {/* SVG */}
                <div className="relative w-full pb-[66%] sm:pb-[58%] lg:pb-[54%]">
                  <svg
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                    className="absolute inset-0 w-full h-full"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    <defs>
                      <pattern id="peta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,26,26,0.035)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#peta-grid)" />

                    {/* Sisi (edges) — dua garis paralel jika A* dan UCS berbagi sisi */}
                    {sisiSemua.map(({ dari, ke, biaya }) => {
                      const p1 = POSISI_SIMPUL[dari];
                      const p2 = POSISI_SIMPUL[ke];
                      const x1 = p1.x, y1 = p1.y;
                      const x2 = p2.x, y2 = p2.y;
                      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                      const sorotA = sisiDiSorot(dari, ke, jalurAstar);
                      const sorotU = sisiDiSorot(dari, ke, jalurUCS);

                      const dx = x2 - x1, dy = y2 - y1;
                      const panjang = Math.sqrt(dx * dx + dy * dy) || 1;
                      const nx = -dy / panjang, ny = dx / panjang;
                      const OFFSET = 5;
                      const labelOffset = sorotA && sorotU ? 0 : 11;
                      const lx = mx + nx * labelOffset;
                      const ly = my + ny * labelOffset;

                      if (sorotA && sorotU) {
                        return (
                          <g key={`${dari}-${ke}`}>
                            <line x1={x1 + nx * OFFSET} y1={y1 + ny * OFFSET}
                              x2={x2 + nx * OFFSET} y2={y2 + ny * OFFSET}
                              stroke="#DB1A1A" strokeWidth={3} />
                            <line x1={x1 - nx * OFFSET} y1={y1 - ny * OFFSET}
                              x2={x2 - nx * OFFSET} y2={y2 - ny * OFFSET}
                              stroke="#7C3AED" strokeWidth={3} />
                            <rect x={mx - 19} y={my - 9.5} width={38} height={19} rx={5}
                              fill="rgba(238,238,238,0.95)" stroke="rgba(26,26,26,0.12)" strokeWidth={0.8} />
                            <rect x={mx - 19} y={my - 9.5} width={19} height={19} rx={5}
                              fill="#DB1A1A" opacity={0.85} />
                            <rect x={mx} y={my - 9.5} width={19} height={19} rx={5}
                              fill="#7C3AED" opacity={0.85} />
                            <text x={mx} y={my + 4.8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#EEEEEE">
                              {biaya} km
                            </text>
                          </g>
                        );
                      }

                      const warna = sorotA ? '#DB1A1A' : sorotU ? '#7C3AED' : 'rgba(26,26,26,0.18)';
                      const tebal = sorotA || sorotU ? 3 : 1.5;

                      return (
                        <g key={`${dari}-${ke}`}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={warna} strokeWidth={tebal}
                            strokeDasharray={sorotA || sorotU ? undefined : '6 4'} />
                          <rect x={lx - 19} y={ly - 9.5} width={38} height={19} rx={5}
                            fill={sorotA ? '#DB1A1A' : sorotU ? '#7C3AED' : 'rgba(238,238,238,0.92)'}
                            stroke={warna} strokeWidth={0.8} />
                          <text x={lx} y={ly + 4.8} textAnchor="middle" fontSize="9" fontWeight="700"
                            fill={sorotA || sorotU ? '#EEEEEE' : 'rgba(26,26,26,0.7)'}>
                            {biaya} km
                          </text>
                        </g>
                      );
                    })}

                    {/* Simpul (nodes) — inisial dari nama terminal real */}
                    {terminals.map((id) => {
                      const pos = POSISI_SIMPUL[id as NodeId];
                      const cx = pos.x, cy = pos.y;
                      const warnaWilayah = WARNA_WILAYAH[id as NodeId];
                      const dipilih  = simpulDipilih === id;
                      const diAstar  = jalurAstar.includes(id as NodeId);
                      const diUCS    = jalurUCS.includes(id as NodeId);
                      const isAsal   = id === asal && sudahCari;
                      const isTujuan = id === tujuan && sudahCari;
                      const pentingDiMobile = dipilih || id === asal || id === tujuan;

                      const warnaNode = isAsal ? '#DB1A1A'
                        : isTujuan ? '#15803D'
                        : diAstar ? '#DB1A1A'
                        : diUCS ? '#7C3AED'
                        : warnaWilayah;

                      const inisial = getTerminalLabel(id as NodeId)
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((bagian) => bagian[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <g
                          key={id}
                          className="peta-node-group"
                          data-important={pentingDiMobile ? 'true' : 'false'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSimpulDipilih(dipilih ? null : id as NodeId);
                            sorotSimpulSebentar(id as NodeId);
                          }}
                        >
                          {simpulPulse === id && (
                            <circle
                              key={`pulse-${id}-${pulseTick}`}
                              cx={cx}
                              cy={cy}
                              r={24}
                              className="peta-node-pulse"
                              stroke={warnaNode}
                              fill="none"
                              strokeWidth={2}
                            />
                          )}
                          {dipilih && (
                            <circle cx={cx} cy={cy} r={30} fill={warnaNode} opacity={0.12} />
                          )}
                          <circle cx={cx} cy={cy} r={22} fill={warnaNode}
                            stroke={dipilih ? '#1A1A1A' : 'rgba(238,238,238,0.75)'}
                            strokeWidth={dipilih ? 2.5 : 1.5} />
                          <circle cx={cx} cy={cy} r={16} fill="none"
                            stroke="rgba(238,238,238,0.2)" strokeWidth={1} />
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                            fontSize="11" fontWeight="900" fill="#EEEEEE" letterSpacing="0.4">
                            {inisial}
                          </text>
                          <text
                            x={cx}
                            y={cy - 30}
                            textAnchor="middle"
                            className="peta-node-label"
                            fontSize="9" fontWeight="700" fill="rgba(26,26,26,0.78)">
                            {getTerminalLabel(id as NodeId)}
                          </text>
                          <rect
                            x={cx - 18}
                            y={cy + 30}
                            width={36}
                            height={13}
                            rx={3}
                            className="peta-node-heuristic-bg"
                            fill="rgba(26,26,26,0.07)" stroke="rgba(26,26,26,0.12)" strokeWidth={0.7} />
                          <text
                            x={cx}
                            y={cy + 39}
                            textAnchor="middle"
                            fontSize="7.5"
                            fontWeight="600"
                            className="peta-node-heuristic-text"
                            fill="rgba(26,26,26,0.5)">
                            h={graph[id as NodeId].h}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Keterangan wilayah */}
                <div className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5"
                  style={{ borderTop: '1px solid rgba(26,26,26,0.06)' }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(26,26,26,0.35)' }}>
                    Wilayah
                  </span>
                  {[
                    { warna: '#7C3AED', label: 'Priangan Timur' },
                    { warna: '#DB1A1A', label: 'Bandung Raya' },
                    { warna: '#B45309', label: 'Pantai Utara' },
                    { warna: '#0369A1', label: 'Jabotabek Barat' },
                    { warna: '#15803D', label: 'Ibu Kota' },
                  ].map(({ warna, label }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs"
                      style={{ color: 'rgba(26,26,26,0.55)' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: warna }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ── Panel Detail Simpul ── */}
            <div className="flex flex-col gap-4">
              <ScrollReveal delayMs={120}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#EEEEEE',
                    border: '1px solid rgba(26,26,26,0.10)',
                    boxShadow: '0 4px 20px rgba(26,26,26,0.09)',
                  }}
                >
                  <div className="px-4 py-3 flex items-center gap-2"
                    style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
                    <Info size={13} color="#DB1A1A" />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#DB1A1A' }}>
                      Detail Simpul
                    </span>
                  </div>

                  {nodeDipilih ? (
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
                          style={{ background: WARNA_WILAYAH[simpulDipilih!], color: '#EEEEEE' }}>
                          {getTerminalLabel(simpulDipilih as NodeId)
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((bagian) => bagian[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight" style={{ color: '#1A1A1A' }}>{nodeDipilih.displayName}</p>
                          <p className="text-xs" style={{ color: 'rgba(26,26,26,0.4)' }}>Terminal Bus Antar Kota</p>
                        </div>
                      </div>

                      <div className="rounded-xl p-3 pop-fade is-visible"
                        style={{ background: 'rgba(219,26,26,0.06)', border: '1px solid rgba(219,26,26,0.14)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#DB1A1A' }}>Nilai Heuristik h(n)</p>
                        <p className="text-2xl font-extrabold leading-none" style={{ color: '#1A1A1A' }}>
                          {nodeDipilih.h}
                          <span className="text-sm font-semibold ml-1" style={{ color: 'rgba(26,26,26,0.4)' }}>km</span>
                        </p>
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(26,26,26,0.45)' }}>
                          Estimasi jarak lurus ke Jakarta. Digunakan A* untuk memperkirakan sisa biaya.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => pilihSebagaiAsal(nodeDipilih.id)}
                          disabled={nodeDipilih.id === tujuan}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background:
                              nodeDipilih.id === tujuan
                                ? 'rgba(26,26,26,0.08)'
                                : 'rgba(219,26,26,0.12)',
                            color: nodeDipilih.id === tujuan ? 'rgba(26,26,26,0.35)' : '#DB1A1A',
                            border: '1px solid rgba(219,26,26,0.25)',
                            cursor: nodeDipilih.id === tujuan ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Jadikan Asal
                        </button>
                        <button
                          onClick={() => pilihSebagaiTujuan(nodeDipilih.id)}
                          disabled={nodeDipilih.id === asal}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background:
                              nodeDipilih.id === asal
                                ? 'rgba(26,26,26,0.08)'
                                : 'rgba(189,17,74,0.12)',
                            color: nodeDipilih.id === asal ? 'rgba(26,26,26,0.35)' : '#BD114A',
                            border: '1px solid rgba(189,17,74,0.25)',
                            cursor: nodeDipilih.id === asal ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Jadikan Tujuan
                        </button>
                      </div>

                      <div>
                        <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(26,26,26,0.35)' }}>
                          Terhubung ke
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {nodeDipilih.edges.map((edge, idx) => (
                            <button
                              key={edge.to}
                              onClick={() => setSimpulDipilih(edge.to)}
                              className="fade-slide-up is-visible flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all hover:opacity-80"
                              style={{
                                background: 'rgba(26,26,26,0.04)',
                                border: '1px solid rgba(26,26,26,0.07)',
                                animationDelay: `${idx * 50}ms`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin size={11} color="#DB1A1A" />
                                <span className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>{getTerminalLabel(edge.to)}</span>
                              </div>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                style={{ background: 'rgba(219,26,26,0.08)', color: '#DB1A1A' }}>
                                {edge.cost} km
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(26,26,26,0.05)' }}>
                        <MapPin size={20} color="rgba(26,26,26,0.2)" />
                      </div>
                      <p className="text-xs font-medium" style={{ color: 'rgba(26,26,26,0.35)' }}>
                        Klik simpul pada graf untuk melihat detail terminal
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Statistik graf */}
              <ScrollReveal delayMs={160}>
                <div className="rounded-2xl p-4"
                  style={{
                    background: '#EEEEEE',
                    border: '1px solid rgba(26,26,26,0.10)',
                    boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
                  }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(26,26,26,0.35)' }}>
                    Statistik Graf
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Jumlah Simpul',  nilai: `${terminals.length}` },
                      { label: 'Jumlah Sisi',    nilai: `${sisiSemua.length}` },
                      { label: 'Biaya Minimum',  nilai: `${Math.min(...sisiSemua.map(s => s.biaya))} km` },
                      { label: 'Biaya Maksimum', nilai: `${Math.max(...sisiSemua.map(s => s.biaya))} km` },
                    ].map(({ label, nilai }, idx) => (
                      <div key={label} className="rounded-xl p-3 fade-slide-up is-visible"
                        style={{ background: 'rgba(26,26,26,0.04)', animationDelay: `${idx * 60}ms` }}>
                        <p className="text-xs leading-tight" style={{ color: 'rgba(26,26,26,0.45)' }}>{label}</p>
                        <p className="font-extrabold text-sm mt-0.5" style={{ color: '#1A1A1A' }}>{nilai}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* ── Tabel Adjacency ── */}
          <ScrollReveal delayMs={80}>
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: '#EEEEEE',
                border: '1px solid rgba(26,26,26,0.10)',
                boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
              }}>
              <div className="px-5 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}>
                  <Table2 size={14} color="#EEEEEE" />
                </div>
                <div>
                  <h2 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>Tabel Adjacency</h2>
                  <p className="text-xs" style={{ color: 'rgba(26,26,26,0.45)' }}>
                    Bobot sisi dalam km titik (·) berarti tidak ada koneksi langsung
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(26,26,26,0.04)' }}>
                      <th className="px-4 py-3 text-left font-bold"
                        style={{ color: 'rgba(26,26,26,0.45)', minWidth: 110 }}>Terminal</th>
                      {terminals.map((t) => (
                        <th key={t} className="px-3 py-3 text-center font-bold"
                          style={{ color: '#DB1A1A', minWidth: 80 }}>{getTerminalLabel(t as NodeId)}</th>
                      ))}
                      <th className="px-3 py-3 text-center font-bold"
                        style={{ color: 'rgba(26,26,26,0.4)', minWidth: 60 }}>h(n)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terminals.map((baris, idx) => {
                      const nodeBaris = graph[baris as NodeId];
                      const terpilih  = simpulDipilih === baris;
                      return (
                        <tr
                          key={baris}
                          /* Stagger animasi per baris tabel */
                          className="table-row-animate transition-colors cursor-pointer"
                          style={{
                            background: terpilih
                              ? 'rgba(219,26,26,0.05)'
                              : idx % 2 === 0
                                ? 'rgba(26,26,26,0.02)'
                                : 'transparent',
                            animationDelay: `${idx * 55}ms`,
                          }}
                          onClick={() => setSimpulDipilih(terpilih ? null : baris as NodeId)}
                        >
                          <td className="px-4 py-2.5 font-semibold" style={{ color: '#1A1A1A' }}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: WARNA_WILAYAH[baris as NodeId] }} />
                              {getTerminalLabel(baris as NodeId)}
                            </span>
                          </td>
                          {terminals.map((kolom) => {
                            const sisi = nodeBaris.edges.find((e) => e.to === kolom);
                            return (
                              <td key={kolom} className="px-3 py-2.5 text-center">
                                {baris === kolom ? (
                                  <span style={{ color: 'rgba(26,26,26,0.15)', fontWeight: 700 }}>—</span>
                                ) : sisi ? (
                                  <span className="font-bold px-2 py-0.5 rounded-lg"
                                    style={{ background: 'rgba(219,26,26,0.07)', color: '#DB1A1A' }}>
                                    {sisi.cost}
                                  </span>
                                ) : (
                                  <span style={{ color: 'rgba(26,26,26,0.15)' }}>·</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2.5 text-center font-bold"
                            style={{ color: 'rgba(26,26,26,0.5)' }}>
                            {nodeBaris.h}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Panel Penjelasan Algoritma ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScrollReveal delayMs={100}>
              <PanelInfo
                ikon={<Network size={15} color="#EEEEEE" />}
                judul="Cara Kerja A* pada Graf Ini"
                warna="#DB1A1A"
                isi={[
                  'A* memilih simpul berikutnya berdasarkan f(n) = g(n) + h(n), menggabungkan biaya nyata dan estimasi.',
                  'g(n): total jarak (km) yang telah ditempuh dari simpul asal.',
                  'h(n): estimasi sisa jarak ke Jakarta nilai badge abu-abu di setiap simpul.',
                  'Simpul dengan h kecil (dekat Jakarta) diprioritaskan, sehingga pencarian lebih terarah.',
                ]}
              />
            </ScrollReveal>
            <ScrollReveal delayMs={160}>
              <PanelInfo
                ikon={<GitBranch size={15} color="#EEEEEE" />}
                judul="Cara Kerja UCS pada Graf Ini"
                warna="#BD114A"
                isi={[
                  'UCS hanya menggunakan f(n) = g(n) tanpa estimasi heuristik apapun.',
                  'Selalu mengekspansi simpul dengan akumulasi biaya terkecil dari titik asal.',
                  'Dijamin optimal, namun berpotensi memeriksa lebih banyak simpul dibanding A*.',
                  'Pada beberapa rute, UCS dan A* menghasilkan jalur identik dengan urutan ekspansi berbeda.',
                ]}
              />
            </ScrollReveal>
          </div>

          </> /* end isMounted */
        )}
      </div>

      {/* Footer */}
      <footer className="mt-4 py-6"
        style={{ background: '#1A1A1A', borderTop: '1px solid rgba(219,26,26,0.2)' }}>
        <div className="max-w-screen-xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'rgba(238,238,238,0.35)' }}>
            &copy; 2026 SmartBus — Implementasi Algoritma
          </p>
          <p className="text-xs font-medium" style={{ color: 'rgba(219,26,26,0.65)' }}>
            A* Search &amp; Uniform Cost Search : Simulasi Perbandingan Algoritma
          </p>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton halaman Peta Rute (tampil selama 750ms pertama)
// ---------------------------------------------------------------------------
function PetaRuteSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      {/* Skeleton panel sorot jalur */}
      <div className="rounded-2xl p-6"
        style={{ background: '#EEEEEE', border: '1px solid rgba(219,26,26,0.12)', boxShadow: '0 4px 24px rgba(26,26,26,0.08)' }}>
        <div className="skeleton-shimmer rounded-xl h-5 w-48 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-4">
          <div className="skeleton-shimmer rounded-2xl h-14" />
          <div className="skeleton-shimmer rounded-full w-8 h-8 mx-auto self-end mb-1" />
          <div className="skeleton-shimmer rounded-2xl h-14" />
          <div className="skeleton-shimmer rounded-2xl h-12 w-32 self-end" />
        </div>
      </div>

      {/* Skeleton SVG + panel detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#EEEEEE', border: '1px solid rgba(26,26,26,0.09)', boxShadow: '0 4px 20px rgba(26,26,26,0.08)' }}>
          <div className="px-5 py-3.5 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
            <div className="skeleton-shimmer rounded h-4 w-36" />
          </div>
          <div className="skeleton-shimmer" style={{ paddingBottom: '52%', width: '100%' }} />
          <div className="px-5 py-3 flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer rounded-full h-4 w-24" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden flex-1"
            style={{ background: '#EEEEEE', border: '1px solid rgba(26,26,26,0.09)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
              <div className="skeleton-shimmer rounded h-3 w-24" />
            </div>
            <div className="p-6 flex flex-col items-center gap-3">
              <div className="skeleton-shimmer rounded-full w-12 h-12" />
              <div className="skeleton-shimmer rounded h-3 w-40" />
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: '#EEEEEE', border: '1px solid rgba(26,26,26,0.09)' }}>
            <div className="skeleton-shimmer rounded h-3 w-24 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer rounded-xl h-14" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton tabel adjacency */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#EEEEEE', border: '1px solid rgba(26,26,26,0.09)', boxShadow: '0 4px 20px rgba(26,26,26,0.08)' }}>
        <div className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}>
          <div className="skeleton-shimmer rounded-lg w-7 h-7" />
          <div className="flex flex-col gap-1.5">
            <div className="skeleton-shimmer rounded h-4 w-32" />
            <div className="skeleton-shimmer rounded h-3 w-48" />
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          {/* Baris-baris skeleton tabel */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <div className="skeleton-shimmer rounded h-8 w-24 shrink-0" />
              {Array.from({ length: 9 }).map((_, j) => (
                <div key={j} className="skeleton-shimmer rounded h-8 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton panel info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ background: '#EEEEEE', border: '1px solid rgba(26,26,26,0.09)' }}>
            <div className="skeleton-shimmer h-12 w-full" />
            <div className="p-4 flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="skeleton-shimmer rounded h-3 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponen bantu
// ---------------------------------------------------------------------------

function LegendaGaris({ warna, label, solid }: { warna: string; label: string; solid: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-0.5 w-4 rounded-full"
        style={{ background: warna, opacity: solid ? 1 : 0.5 }} />
      <span>{label}</span>
    </span>
  );
}

function HasilJalur({ label, jalur, color }: { label: string; jalur: NodeId[]; color: string }) {
  if (!jalur.length) {
    return (
      <div className="rounded-xl p-3 text-xs flex items-center gap-2"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span style={{ color }}>{label}:</span>
        <span style={{ color: 'rgba(26,26,26,0.4)' }}>Tidak ada jalur ditemukan</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <p className="text-xs font-bold mb-2" style={{ color }}>{label}</p>
      <div className="flex flex-wrap items-center gap-1">
        {jalur.map((node, i) => (
          <span key={i} className="flex items-center gap-0.5">
            <span className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ background: color, color: '#EEEEEE' }}>
              {node}
            </span>
            {i < jalur.length - 1 && <ChevronRight size={11} color={`${color}70`} />}
          </span>
        ))}
      </div>
    </div>
  );
}

function PanelInfo({
  ikon, judul, warna, isi,
}: {
  ikon: React.ReactNode;
  judul: string;
  warna: string;
  isi: string[];
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: '#EEEEEE',
        border: `1px solid ${warna}18`,
        boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
      }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ background: `linear-gradient(135deg, ${warna}, ${warna}CC)` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(238,238,238,0.14)' }}>
          {ikon}
        </div>
        <p className="font-bold text-sm" style={{ color: '#EEEEEE' }}>{judul}</p>
      </div>
      <ul className="p-4 flex flex-col gap-2.5">
        {isi.map((poin, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-relaxed"
            style={{ color: 'rgba(26,26,26,0.7)' }}>
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: warna }} />
            {poin}
          </li>
        ))}
      </ul>
    </div>
  );
}
