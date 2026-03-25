'use client';

import { useState, useMemo } from 'react';
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
import { graph, NodeId, terminals } from '../lib/graphData';
import { runAStar, runUCS } from '../lib/algorithms';
import TerminalSelect from '../components/ControlPanel/TerminalSelect';

// ---------------------------------------------------------------------------
// Layout koordinat simpul dalam kanvas SVG (viewBox 1000×520)
// Disusun mendekati posisi geografis Jawa Barat → Jakarta
// ---------------------------------------------------------------------------
const POSISI_SIMPUL: Record<NodeId, { x: number; y: number }> = {
  Tasikmalaya: { x: 8,  y: 68 },
  Garut:       { x: 22, y: 55 },
  Bandung:     { x: 38, y: 44 },
  Sumedang:    { x: 47, y: 28 },
  Cirebon:     { x: 66, y: 22 },
  Purwakarta:  { x: 57, y: 55 },
  Bekasi:      { x: 76, y: 62 },
  Jakarta:     { x: 90, y: 52 },
};

// Warna berdasar wilayah
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

// Ambil semua sisi unik (hapus duplikat A-B / B-A)
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
  const [asal, setAsal]     = useState<NodeId>('Tasikmalaya');
  const [tujuan, setTujuan] = useState<NodeId>('Jakarta');
  const [jalurAstar, setJalurAstar] = useState<NodeId[]>([]);
  const [jalurUCS, setJalurUCS]     = useState<NodeId[]>([]);
  const [sudahCari, setSudahCari] = useState(false);

  const sisiSemua = useMemo(() => getSisiUnik(), []);

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

  const nodeDipilih = simpulDipilih ? graph[simpulDipilih] : null;

  return (
    <div style={{ background: '#EEEEEE', minHeight: '100vh' }}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div
        className="pt-[72px]"
        style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2a1010 100%)' }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-5" style={{ color: 'rgba(238,238,238,0.4)' }}>
            <Link href="/" className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity">
              <Home size={11} />
              Beranda
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
              <Bus size={14} />
              Ke Dasbor Simulasi
            </Link>
          </div>
        </div>
      </div>

      {/* ── KONTEN ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* Panel sorot jalur — layout & komponen sejajar dengan ControlPanel di dasbor */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#EEEEEE',
            border: '1px solid rgba(219,26,26,0.15)',
            boxShadow: '0 4px 32px rgba(26,26,26,0.10)',
          }}
        >
          {/* Judul panel */}
          <div className="flex items-center gap-2 pb-4 mb-5" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
            >
              <GitBranch size={15} color="#EEEEEE" />
            </div>
            <div>
              <h2 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                Sorotan Jalur Algoritma
              </h2>
              <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
                Pilih asal dan tujuan untuk menyorot jalur A* (merah) dan UCS (ungu) pada graf
              </p>
            </div>
          </div>

          {/* Kontrol — pakai TerminalSelect yang sama dengan ControlPanel di dasbor */}
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
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #DB1A1A, #BD114A)',
                  color: '#EEEEEE',
                  boxShadow: '0 4px 16px rgba(219,26,26,0.35)',
                }}
              >
                <GitBranch size={14} />
                Sorot Jalur
              </button>
              {sudahCari && (
                <button
                  onClick={aturUlang}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: 'rgba(26,26,26,0.07)',
                    color: '#1A1A1A',
                    border: '1px solid rgba(26,26,26,0.12)',
                  }}
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Hasil jalur */}
          {sudahCari && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <HasilJalur label="Jalur A*" jalur={jalurAstar} color="#DB1A1A" />
              <HasilJalur label="Jalur UCS" jalur={jalurUCS} color="#7C3AED" />
            </div>
          )}
        </div>

        {/* Graf SVG + Panel simpul */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* ── Graf SVG ─────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#EEEEEE',
              border: '1px solid rgba(26,26,26,0.10)',
              boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
            }}
          >
            {/* Header grafik */}
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Layers size={14} color="#DB1A1A" />
                <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
                  Graf Jaringan Terminal
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(26,26,26,0.4)' }}>
                <LegendaGaris warna="#DB1A1A" label="Jalur A*" solid />
                <LegendaGaris warna="#7C3AED" label="Jalur UCS" solid />
                <LegendaGaris warna="rgba(26,26,26,0.3)" label="Koneksi" solid={false} />
              </div>
            </div>

            {/* Kanvas SVG */}
            <div className="relative w-full" style={{ paddingBottom: '52%' }}>
              <svg
                viewBox="0 0 1000 520"
                className="absolute inset-0 w-full h-full"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {/* Grid halus */}
                <defs>
                  <pattern id="peta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,26,26,0.035)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="1000" height="520" fill="url(#peta-grid)" />

                {/* Sisi (edges) — dua garis paralel jika A* dan UCS berbagi sisi yang sama */}
                {sisiSemua.map(({ dari, ke, biaya }) => {
                  const p1 = POSISI_SIMPUL[dari];
                  const p2 = POSISI_SIMPUL[ke];
                  const x1 = p1.x * 10, y1 = p1.y * 5.2;
                  const x2 = p2.x * 10, y2 = p2.y * 5.2;
                  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                  const sorotA = sisiDiSorot(dari, ke, jalurAstar);
                  const sorotU = sisiDiSorot(dari, ke, jalurUCS);

                  // Hitung vektor tegak lurus untuk offset garis paralel
                  const dx = x2 - x1, dy = y2 - y1;
                  const panjang = Math.sqrt(dx * dx + dy * dy) || 1;
                  // Vektor satuan tegak lurus
                  const nx = -dy / panjang, ny = dx / panjang;
                  const OFFSET = 5; // pixel offset pada viewBox koordinat

                  // Jika keduanya menyorot sisi yang sama → gambar dua garis paralel
                  if (sorotA && sorotU) {
                    return (
                      <g key={`${dari}-${ke}`}>
                        {/* Garis A* — digeser ke atas/kiri */}
                        <line
                          x1={x1 + nx * OFFSET} y1={y1 + ny * OFFSET}
                          x2={x2 + nx * OFFSET} y2={y2 + ny * OFFSET}
                          stroke="#DB1A1A" strokeWidth={3}
                        />
                        {/* Garis UCS — digeser ke bawah/kanan */}
                        <line
                          x1={x1 - nx * OFFSET} y1={y1 - ny * OFFSET}
                          x2={x2 - nx * OFFSET} y2={y2 - ny * OFFSET}
                          stroke="#7C3AED" strokeWidth={3}
                        />
                        {/* Label biaya tengah: dua warna kiri-kanan */}
                        {/* Latar label */}
                        <rect
                          x={mx - 18} y={my - 9} width={36} height={17} rx={4}
                          fill="rgba(238,238,238,0.95)"
                          stroke="rgba(26,26,26,0.12)" strokeWidth={0.8}
                        />
                        {/* Separuh kiri merah (A*) */}
                        <rect
                          x={mx - 18} y={my - 9} width={18} height={17} rx={4}
                          fill="#DB1A1A" opacity={0.85}
                        />
                        {/* Separuh kanan ungu (UCS) */}
                        <rect
                          x={mx} y={my - 9} width={18} height={17} rx={4}
                          fill="#7C3AED" opacity={0.85}
                        />
                        <text
                          x={mx} y={my + 4.5}
                          textAnchor="middle" fontSize="8.5" fontWeight="700"
                          fill="#EEEEEE"
                        >
                          {biaya} km
                        </text>
                      </g>
                    );
                  }

                  // Hanya satu algoritma atau tidak ada yang sorot
                  const warna = sorotA ? '#DB1A1A' : sorotU ? '#7C3AED' : 'rgba(26,26,26,0.18)';
                  const tebal = sorotA || sorotU ? 3 : 1.5;

                  return (
                    <g key={`${dari}-${ke}`}>
                      <line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={warna} strokeWidth={tebal}
                        strokeDasharray={sorotA || sorotU ? undefined : '6 4'}
                      />
                      <rect
                        x={mx - 17} y={my - 9} width={34} height={17} rx={4}
                        fill={sorotA ? '#DB1A1A' : sorotU ? '#7C3AED' : 'rgba(238,238,238,0.92)'}
                        stroke={warna} strokeWidth={0.8}
                      />
                      <text
                        x={mx} y={my + 4.5}
                        textAnchor="middle" fontSize="9" fontWeight="700"
                        fill={sorotA || sorotU ? '#EEEEEE' : 'rgba(26,26,26,0.7)'}
                      >
                        {biaya} km
                      </text>
                    </g>
                  );
                })}

                {/* Simpul (nodes) — tanpa emoji, pakai inisial huruf */}
                {terminals.map((id) => {
                  const pos   = POSISI_SIMPUL[id as NodeId];
                  const cx    = pos.x * 10;
                  const cy    = pos.y * 5.2;
                  const warnaWilayah = WARNA_WILAYAH[id as NodeId];
                  const dipilih    = simpulDipilih === id;
                  const diAstar    = jalurAstar.includes(id as NodeId);
                  const diUCS      = jalurUCS.includes(id as NodeId);
                  const isAsal     = id === asal && sudahCari;
                  const isTujuan   = id === tujuan && sudahCari;

                  const warnaNode = isAsal
                    ? '#DB1A1A'
                    : isTujuan
                      ? '#15803D'
                      : diAstar
                        ? '#DB1A1A'
                        : diUCS
                          ? '#7C3AED'
                          : warnaWilayah;

                  // Ambil 2 huruf inisial nama terminal
                  const inisial = (id as string).slice(0, 2).toUpperCase();

                  return (
                    <g
                      key={id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSimpulDipilih(dipilih ? null : id as NodeId)}
                    >
                      {/* Aura saat dipilih */}
                      {dipilih && (
                        <circle cx={cx} cy={cy} r={30} fill={warnaNode} opacity={0.12} />
                      )}

                      {/* Lingkaran utama */}
                      <circle
                        cx={cx} cy={cy} r={22}
                        fill={warnaNode}
                        stroke={dipilih ? '#1A1A1A' : 'rgba(238,238,238,0.75)'}
                        strokeWidth={dipilih ? 2.5 : 1.5}
                      />

                      {/* Lingkaran dalam (aksen) */}
                      <circle
                        cx={cx} cy={cy} r={16}
                        fill="none"
                        stroke="rgba(238,238,238,0.2)"
                        strokeWidth={1}
                      />

                      {/* Inisial huruf, bukan emoji */}
                      <text
                        x={cx} y={cy - 2}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize="9" fontWeight="800"
                        fill="#EEEEEE" letterSpacing="0.5"
                      >
                        {inisial}
                      </text>

                      {/* Nama lengkap di bawah lingkaran */}
                      <text
                        x={cx} y={cy + 10}
                        textAnchor="middle"
                        fontSize="7" fontWeight="600"
                        fill="rgba(238,238,238,0.85)"
                      >
                        {(id as string).length > 8 ? (id as string).slice(0, 7) + '…' : id}
                      </text>

                      {/* Badge h(n) */}
                      <rect
                        x={cx - 18} y={cy + 27}
                        width={36} height={13} rx={3}
                        fill="rgba(26,26,26,0.07)"
                        stroke="rgba(26,26,26,0.12)"
                        strokeWidth={0.7}
                      />
                      <text
                        x={cx} y={cy + 36}
                        textAnchor="middle" fontSize="7.5" fontWeight="600"
                        fill="rgba(26,26,26,0.5)"
                      >
                        h={graph[id as NodeId].h}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Keterangan wilayah */}
            <div
              className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5"
              style={{ borderTop: '1px solid rgba(26,26,26,0.06)' }}
            >
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
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'rgba(26,26,26,0.55)' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: warna }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Panel Detail Simpul ───────────────── */}
          <div className="flex flex-col gap-4">

            {/* Kartu info simpul */}
            <div
              className="rounded-2xl overflow-hidden flex-1"
              style={{
                background: '#EEEEEE',
                border: '1px solid rgba(26,26,26,0.10)',
                boxShadow: '0 4px 20px rgba(26,26,26,0.09)',
              }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
              >
                <Info size={13} color="#DB1A1A" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#DB1A1A' }}>
                  Detail Simpul
                </span>
              </div>

              {nodeDipilih ? (
                <div className="p-4 flex flex-col gap-3">
                  {/* Header nama */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
                      style={{ background: WARNA_WILAYAH[simpulDipilih!], color: '#EEEEEE' }}
                    >
                      {(simpulDipilih as string).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight" style={{ color: '#1A1A1A' }}>
                        {nodeDipilih.id}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(26,26,26,0.4)' }}>
                        Terminal Bus Antar Kota
                      </p>
                    </div>
                  </div>

                  {/* Nilai heuristik */}
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(219,26,26,0.06)', border: '1px solid rgba(219,26,26,0.14)' }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: '#DB1A1A' }}>
                      Nilai Heuristik h(n)
                    </p>
                    <p className="text-2xl font-extrabold leading-none" style={{ color: '#1A1A1A' }}>
                      {nodeDipilih.h}
                      <span className="text-sm font-semibold ml-1" style={{ color: 'rgba(26,26,26,0.4)' }}>km</span>
                    </p>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(26,26,26,0.45)' }}>
                      Estimasi jarak lurus ke Jakarta. Digunakan A* untuk memperkirakan sisa biaya perjalanan.
                    </p>
                  </div>

                  {/* Koneksi */}
                  <div>
                    <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(26,26,26,0.35)' }}>
                      Terhubung ke
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {nodeDipilih.edges.map((edge) => (
                        <button
                          key={edge.to}
                          onClick={() => setSimpulDipilih(edge.to)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all hover:opacity-80"
                          style={{
                            background: 'rgba(26,26,26,0.04)',
                            border: '1px solid rgba(26,26,26,0.07)',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin size={11} color="#DB1A1A" />
                            <span className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>
                              {edge.to}
                            </span>
                          </div>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(219,26,26,0.08)', color: '#DB1A1A' }}
                          >
                            {edge.cost} km
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center gap-3 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(26,26,26,0.05)' }}
                  >
                    <MapPin size={20} color="rgba(26,26,26,0.2)" />
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'rgba(26,26,26,0.35)' }}>
                    Klik simpul pada graf untuk melihat detail terminal
                  </p>
                </div>
              )}
            </div>

            {/* Statistik graf */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: '#EEEEEE',
                border: '1px solid rgba(26,26,26,0.10)',
                boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(26,26,26,0.35)' }}>
                Statistik Graf
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Jumlah Simpul',  nilai: `${terminals.length}` },
                  { label: 'Jumlah Sisi',    nilai: `${sisiSemua.length}` },
                  { label: 'Biaya Minimum',  nilai: `${Math.min(...sisiSemua.map(s => s.biaya))} km` },
                  { label: 'Biaya Maksimum', nilai: `${Math.max(...sisiSemua.map(s => s.biaya))} km` },
                ].map(({ label, nilai }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(26,26,26,0.04)' }}>
                    <p className="text-xs leading-tight" style={{ color: 'rgba(26,26,26,0.45)' }}>{label}</p>
                    <p className="font-extrabold text-sm mt-0.5" style={{ color: '#1A1A1A' }}>{nilai}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabel Adjacency ──────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#EEEEEE',
            border: '1px solid rgba(26,26,26,0.10)',
            boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
          }}
        >
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
            >
              <Table2 size={14} color="#EEEEEE" />
            </div>
            <div>
              <h2 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                Tabel Adjacency
              </h2>
              <p className="text-xs" style={{ color: 'rgba(26,26,26,0.45)' }}>
                Bobot sisi dalam km titik (·) berarti tidak ada koneksi langsung
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(26,26,26,0.04)' }}>
                  <th
                    className="px-4 py-3 text-left font-bold"
                    style={{ color: 'rgba(26,26,26,0.45)', minWidth: 110 }}
                  >
                    Terminal
                  </th>
                  {terminals.map((t) => (
                    <th
                      key={t}
                      className="px-3 py-3 text-center font-bold"
                      style={{ color: '#DB1A1A', minWidth: 80 }}
                    >
                      {t}
                    </th>
                  ))}
                  <th
                    className="px-3 py-3 text-center font-bold"
                    style={{ color: 'rgba(26,26,26,0.4)', minWidth: 60 }}
                  >
                    h(n)
                  </th>
                </tr>
              </thead>
              <tbody>
                {terminals.map((baris, idx) => {
                  const nodeBaris = graph[baris as NodeId];
                  const terpilih  = simpulDipilih === baris;
                  return (
                    <tr
                      key={baris}
                      className="transition-colors cursor-pointer"
                      style={{
                        background: terpilih
                          ? 'rgba(219,26,26,0.05)'
                          : idx % 2 === 0
                            ? 'rgba(26,26,26,0.02)'
                            : 'transparent',
                      }}
                      onClick={() => setSimpulDipilih(terpilih ? null : baris as NodeId)}
                    >
                      <td className="px-4 py-2.5 font-semibold" style={{ color: '#1A1A1A' }}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: WARNA_WILAYAH[baris as NodeId] }}
                          />
                          {baris}
                        </span>
                      </td>
                      {terminals.map((kolom) => {
                        const sisi = nodeBaris.edges.find((e) => e.to === kolom);
                        return (
                          <td key={kolom} className="px-3 py-2.5 text-center">
                            {baris === kolom ? (
                              <span style={{ color: 'rgba(26,26,26,0.15)', fontWeight: 700 }}>—</span>
                            ) : sisi ? (
                              <span
                                className="font-bold px-2 py-0.5 rounded-lg"
                                style={{ background: 'rgba(219,26,26,0.07)', color: '#DB1A1A' }}
                              >
                                {sisi.cost}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(26,26,26,0.15)' }}>·</span>
                            )}
                          </td>
                        );
                      })}
                      <td
                        className="px-3 py-2.5 text-center font-bold"
                        style={{ color: 'rgba(26,26,26,0.5)' }}
                      >
                        {nodeBaris.h}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Panel Penjelasan Algoritma ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Footer — sama dengan halaman utama */}
      <footer
        className="mt-4 py-6"
        style={{ background: '#1A1A1A', borderTop: '1px solid rgba(219,26,26,0.2)' }}
      >
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
// Komponen bantu
// ---------------------------------------------------------------------------

function LegendaGaris({
  warna, label, solid,
}: { warna: string; label: string; solid: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4 rounded-full"
        style={{
          background: warna,
          opacity: solid ? 1 : 0.5,
          borderBottom: solid ? undefined : '2px dashed',
        }}
      />
      <span>{label}</span>
    </span>
  );
}

function HasilJalur({
  label, jalur, color,
}: { label: string; jalur: NodeId[]; color: string }) {
  if (!jalur.length) {
    return (
      <div
        className="rounded-xl p-3 text-xs flex items-center gap-2"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span style={{ color }}>{label}:</span>
        <span style={{ color: 'rgba(26,26,26,0.4)' }}>Tidak ada jalur ditemukan</span>
      </div>
    );
  }
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
    >
      <p className="text-xs font-bold mb-2" style={{ color }}>{label}</p>
      <div className="flex flex-wrap items-center gap-1">
        {jalur.map((node, i) => (
          <span key={i} className="flex items-center gap-0.5">
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ background: color, color: '#EEEEEE' }}
            >
              {node}
            </span>
            {i < jalur.length - 1 && (
              <ChevronRight size={11} color={`${color}70`} />
            )}
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
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#EEEEEE',
        border: `1px solid ${warna}18`,
        boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
      }}
    >
      <div
        className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ background: `linear-gradient(135deg, ${warna}, ${warna}CC)` }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(238,238,238,0.14)' }}
        >
          {ikon}
        </div>
        <p className="font-bold text-sm" style={{ color: '#EEEEEE' }}>{judul}</p>
      </div>
      <ul className="p-4 flex flex-col gap-2.5">
        {isi.map((poin, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs leading-relaxed"
            style={{ color: 'rgba(26,26,26,0.7)' }}
          >
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: warna }} />
            {poin}
          </li>
        ))}
      </ul>
    </div>
  );
}
