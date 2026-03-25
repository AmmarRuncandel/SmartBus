'use client';

import {
  Clock,
  Zap,
  BarChart2,
  Route,
  Award,
  TrendingDown,
  CheckCircle,
  Timer,
  MapPin,
  Database,
  Cpu,
  GitBranch,
  Layers,
} from 'lucide-react';
import { AlgorithmResult } from '../lib/algorithms';

interface AnalyticsCardsProps {
  astar: AlgorithmResult | null;
  ucs: AlgorithmResult | null;
}

// ---------------------------------------------------------------------------
// Fungsi interpretasi hasil dalam bahasa manusia
// ---------------------------------------------------------------------------

function interpretasiWaktu(ms: number): string {
  if (ms < 0.1) return 'Sangat cepat, hampir tidak terukur';
  if (ms < 1) return 'Cepat, di bawah 1 milidetik';
  if (ms < 10) return 'Cukup cepat, beberapa milidetik';
  return 'Membutuhkan waktu lebih dari 10 milidetik';
}

function interpretasiJarak(km: number): string {
  if (km === 0) return 'Tidak ada rute yang ditemukan';
  if (km < 100) return 'Rute sangat singkat, jarak dekat';
  if (km < 250) return 'Rute jarak menengah';
  if (km < 400) return 'Rute cukup panjang, antar kota besar';
  return 'Rute jarak jauh lintas wilayah';
}

function interpretasiSimpul(n: number, total: number): string {
  const persen = Math.round((n / total) * 100);
  if (persen <= 40)
    return `Hanya ${n} dari ${total} simpul pencarian sangat terarah`;
  if (persen <= 70)
    return `${n} dari ${total} simpul dievaluasi secara efisiensi sedang`;
  return `${n} dari ${total} simpul dievaluasi secara pencarian menyeluruh`;
}

function interpretasiJalur(stops: number): string {
  if (stops <= 2) return 'Koneksi langsung tanpa transit';
  if (stops <= 4) return 'Rute singkat dengan sedikit transit';
  if (stops <= 6) return 'Rute dengan beberapa pemberhentian';
  return 'Rute panjang melewati banyak terminal';
}

function interpretasiMemori(maxQ: number, totalSimpul: number): string {
  const persen = Math.round((maxQ / totalSimpul) * 100);
  if (maxQ <= 2)
    return 'Penggunaan memori sangat rendah — frontier hampir tidak berkembang';
  if (persen <= 50)
    return `Puncak antrian ${maxQ} item (${persen}% simpul) penggunaan memori efisien`;
  return `Puncak antrian ${maxQ} item (${persen}% simpul) frontier tumbuh signifikan`;
}

// ---------------------------------------------------------------------------
// Data kompleksitas teoritis
// ---------------------------------------------------------------------------

const KOMPLEKSITAS = {
  ucs: {
    waktu: { label: 'O(|V| + |E| log |V|)', keterangan: 'Ekspansi seluruh frontier tanpa panduan heuristik' },
    ruang: { label: 'O(|V|)', keterangan: 'Menyimpan seluruh frontier di memori (worst-case semua simpul)' },
  },
  astar: {
    waktu: {
      label: 'O(|E|) – O(|V| + |E| log |V|)',
      keterangan: 'Terbaik dgn heuristik sempurna; umum: sama seperti UCS',
    },
    ruang: { label: 'O(|V|)', keterangan: 'Menyimpan frontier + gScores worst-case semua simpul' },
  },
};

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------

export default function AnalyticsCards({ astar, ucs }: AnalyticsCardsProps) {
  const hasResults = astar && ucs;
  const totalSimpul = hasResults
    ? Math.max(astar.nodesVisited, ucs.nodesVisited)
    : 8; // jumlah simpul dalam graf

  const lebihCepat = hasResults
    ? astar.executionTime <= ucs.executionTime ? 'astar' : 'ucs'
    : null;
  const lebihMurah = hasResults
    ? astar.totalCost <= ucs.totalCost ? 'astar' : 'ucs'
    : null;
  const lebihEfisien = hasResults
    ? astar.nodesVisited <= ucs.nodesVisited ? 'astar' : 'ucs'
    : null;
  const lebihHematMemori = hasResults
    ? astar.maxQueueSize <= ucs.maxQueueSize ? 'astar' : 'ucs'
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Judul seksi */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
        >
          <BarChart2 size={16} color="#EEEEEE" />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
            Analisis Performa
          </h3>
          <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
            Perbandingan metrik dan kompleksitas kedua algoritma
          </p>
        </div>
      </div>

      {/* Kartu perbandingan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KartuAlgoritma
          judul="A* Search"
          subtitle="f(n) = g(n) + h(n)"
          color="#DB1A1A"
          gradientFrom="#DB1A1A"
          gradientTo="#BD114A"
          result={astar}
          lebihCepat={lebihCepat === 'astar'}
          lebihMurah={lebihMurah === 'astar'}
          lebihEfisien={lebihEfisien === 'astar'}
          lebihHematMemori={lebihHematMemori === 'astar'}
          totalSimpul={totalSimpul}
        />
        <KartuAlgoritma
          judul="Uniform Cost Search"
          subtitle="f(n) = g(n)"
          color="#BD114A"
          gradientFrom="#BD114A"
          gradientTo="#8B0E37"
          result={ucs}
          lebihCepat={lebihCepat === 'ucs'}
          lebihMurah={lebihMurah === 'ucs'}
          lebihEfisien={lebihEfisien === 'ucs'}
          lebihHematMemori={lebihHematMemori === 'ucs'}
          totalSimpul={totalSimpul}
        />
      </div>

      {/* ── Analisis Kompleksitas Teoritis ────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#EEEEEE',
          border: '1px solid rgba(26,26,26,0.10)',
          boxShadow: '0 2px 16px rgba(26,26,26,0.07)',
        }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
        >
          <Cpu size={14} color="#DB1A1A" />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#DB1A1A' }}>
            Analisis Kompleksitas Teoritis
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KompleksitasPanel
            judul="A* Search"
            color="#DB1A1A"
            waktu={KOMPLEKSITAS.astar.waktu}
            ruang={KOMPLEKSITAS.astar.ruang}
          />
          <KompleksitasPanel
            judul="Uniform Cost Search"
            color="#BD114A"
            waktu={KOMPLEKSITAS.ucs.waktu}
            ruang={KOMPLEKSITAS.ucs.ruang}
          />
        </div>
      </div>

      {/* Kesimpulan simulasi */}
      {hasResults && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(219,26,26,0.06)',
            border: '1px solid rgba(219,26,26,0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} color="#DB1A1A" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#DB1A1A' }}>
              Kesimpulan Simulasi
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <ItemKesimpulan icon={<Timer size={13} />} label="Waktu Tercepat"
              nilai={lebihCepat === 'astar' ? 'A*' : 'UCS'} color="#DB1A1A" />
            <ItemKesimpulan icon={<TrendingDown size={13} />} label="Biaya Terendah"
              nilai={lebihMurah === 'astar' ? 'A*' : 'UCS'} color="#DB1A1A" />
            <ItemKesimpulan icon={<Zap size={13} />} label="Paling Efisien"
              nilai={lebihEfisien === 'astar' ? 'A*' : 'UCS'} color="#DB1A1A" />
            <ItemKesimpulan icon={<Database size={13} />} label="Hemat Memori"
              nilai={lebihHematMemori === 'astar' ? 'A*' : 'UCS'} color="#DB1A1A" />
          </div>

          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: 'rgba(26,26,26,0.04)', border: '1px solid rgba(26,26,26,0.08)' }}
          >
            <InterpretasiItem>
              {astar.totalCost === ucs.totalCost
                ? `Kedua algoritma menemukan jalur optimal yang sama dengan total jarak ${astar.totalCost} km.`
                : `Algoritma ${lebihMurah === 'astar' ? 'A*' : 'UCS'} menghasilkan rute yang lebih hemat dengan selisih ${Math.abs(astar.totalCost - ucs.totalCost)} km.`}
            </InterpretasiItem>
            <InterpretasiItem>
              A* mengevaluasi {astar.nodesVisited} simpul dibanding UCS yang mengevaluasi {ucs.nodesVisited} simpul.{' '}
              {astar.nodesVisited < ucs.nodesVisited
                ? 'Heuristik membantu A* memangkas simpul yang tidak perlu diperiksa.'
                : 'Pada rute ini, UCS lebih efisien karena biaya antar simpul relatif seragam.'}
            </InterpretasiItem>
            <InterpretasiItem>
              Puncak antrian A* mencapai {astar.maxQueueSize} item vs UCS {ucs.maxQueueSize} item.{' '}
              {astar.maxQueueSize <= ucs.maxQueueSize
                ? 'Heuristik menekan pertumbuhan frontier sehingga A* lebih hemat memori.'
                : 'Pruning gScores pada A* tidak selalu mengurangi frontier pada graf berbiaya sisi seragam.'}
            </InterpretasiItem>
            <InterpretasiItem>
              {astar.executionTime < ucs.executionTime
                ? `A* selesai ${(ucs.executionTime - astar.executionTime).toFixed(4)} ms lebih cepat dari UCS. Heuristik mempersempit ruang pencarian.`
                : `UCS selesai ${(astar.executionTime - ucs.executionTime).toFixed(4)} ms lebih cepat. Kalkulasi f(n)=g+h menambah sedikit overhead pada A*.`}
            </InterpretasiItem>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kartu detail per algoritma
// ---------------------------------------------------------------------------

interface KartuAlgoritmaProps {
  judul: string;
  subtitle: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  result: AlgorithmResult | null;
  lebihCepat: boolean;
  lebihMurah: boolean;
  lebihEfisien: boolean;
  lebihHematMemori: boolean;
  totalSimpul: number;
}

function KartuAlgoritma({
  judul, subtitle, color, gradientFrom, gradientTo,
  result, lebihCepat, lebihMurah, lebihEfisien, lebihHematMemori, totalSimpul,
}: KartuAlgoritmaProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#EEEEEE',
        border: `1px solid ${color}25`,
        boxShadow: '0 4px 20px rgba(26,26,26,0.09)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        <div>
          <p className="font-bold text-sm" style={{ color: '#EEEEEE' }}>{judul}</p>
          <p className="text-xs font-mono" style={{ color: 'rgba(238,238,238,0.7)' }}>{subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          {lebihCepat && <BadgeUnggul icon={<Timer size={11} />} label="Tercepat" />}
          {lebihMurah && <BadgeUnggul icon={<MapPin size={11} />} label="Termurah" />}
          {lebihEfisien && <BadgeUnggul icon={<Zap size={11} />} label="Efisien" />}
          {lebihHematMemori && <BadgeUnggul icon={<Database size={11} />} label="Hemat RAM" />}
        </div>
      </div>

      {/* Metrik */}
      <div className="p-4 flex flex-col gap-2">
        <BarisMedtrik
          icon={<Clock size={14} color={color} />}
          label="Waktu Eksekusi"
          nilai={result ? `${result.executionTime.toFixed(4)} ms` : '—'}
          interpretasi={result ? interpretasiWaktu(result.executionTime) : undefined}
          hasResult={!!result} color={color}
        />
        <BarisMedtrik
          icon={<Route size={14} color={color} />}
          label="Total Biaya Rute"
          nilai={result ? `${result.totalCost} km` : '—'}
          interpretasi={result ? interpretasiJarak(result.totalCost) : undefined}
          hasResult={!!result} color={color}
        />
        <BarisMedtrik
          icon={<Zap size={14} color={color} />}
          label="Simpul Dievaluasi"
          nilai={result ? `${result.nodesVisited} simpul` : '—'}
          interpretasi={result ? interpretasiSimpul(result.nodesVisited, totalSimpul) : undefined}
          hasResult={!!result} color={color}
        />
        <BarisMedtrik
          icon={<BarChart2 size={14} color={color} />}
          label="Panjang Rute"
          nilai={result ? `${result.path.length} terminal` : '—'}
          interpretasi={result ? interpretasiJalur(result.path.length) : undefined}
          hasResult={!!result} color={color}
        />
        {/* Metrik baru: Penggunaan Memori */}
        <BarisMedtrik
          icon={<Database size={14} color={color} />}
          label="Puncak Antrian (Memori)"
          nilai={result ? `${result.maxQueueSize} entri` : '—'}
          interpretasi={result ? interpretasiMemori(result.maxQueueSize, totalSimpul) : undefined}
          hasResult={!!result} color={color}
          highlight
        />
      </div>
    </div>
  );
}

function BarisMedtrik({
  icon, label, nilai, interpretasi, hasResult, color, highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  nilai: string;
  interpretasi?: string;
  hasResult: boolean;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col px-2 py-2 rounded-xl"
      style={{
        background: hasResult
          ? highlight
            ? `${color}12`
            : `${color}08`
          : 'rgba(26,26,26,0.04)',
        border: highlight && hasResult ? `1px solid ${color}25` : 'none',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium" style={{ color: 'rgba(26,26,26,0.6)' }}>
            {label}
          </span>
        </div>
        <span className="text-sm font-bold" style={{ color: hasResult ? '#1A1A1A' : 'rgba(26,26,26,0.3)' }}>
          {nilai}
        </span>
      </div>
      {hasResult && interpretasi && (
        <p className="text-xs mt-1 pl-6 leading-snug" style={{ color: 'rgba(26,26,26,0.45)' }}>
          {interpretasi}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel kompleksitas teoritis Big-O
// ---------------------------------------------------------------------------

function KompleksitasPanel({
  judul, color, waktu, ruang,
}: {
  judul: string;
  color: string;
  waktu: { label: string; keterangan: string };
  ruang: { label: string; keterangan: string };
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${color}20` }}
    >
      {/* Header nama algoritma */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ background: `${color}10`, borderBottom: `1px solid ${color}15` }}
      >
        <GitBranch size={12} color={color} />
        <span className="text-xs font-bold" style={{ color }}>{judul}</span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {/* Time complexity */}
        <div
          className="flex items-start gap-2 p-2.5 rounded-xl"
          style={{ background: 'rgba(26,26,26,0.04)' }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${color}15` }}
          >
            <Cpu size={12} color={color} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(26,26,26,0.5)' }}>
                Time Complexity
              </span>
            </div>
            <code
              className="text-xs font-bold font-mono block mb-1"
              style={{ color }}
            >
              {waktu.label}
            </code>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,26,26,0.5)' }}>
              {waktu.keterangan}
            </p>
          </div>
        </div>

        {/* Space complexity */}
        <div
          className="flex items-start gap-2 p-2.5 rounded-xl"
          style={{ background: 'rgba(26,26,26,0.04)' }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: `${color}15` }}
          >
            <Layers size={12} color={color} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(26,26,26,0.5)' }}>
                Space Complexity
              </span>
            </div>
            <code
              className="text-xs font-bold font-mono block mb-1"
              style={{ color }}
            >
              {ruang.label}
            </code>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,26,26,0.5)' }}>
              {ruang.keterangan}
            </p>
          </div>
        </div>

        {/* Keterangan variabel */}
        <div
          className="px-2.5 py-2 rounded-xl"
          style={{ background: `${color}08`, border: `1px solid ${color}15` }}
        >
          <p className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
            <span className="font-mono font-bold" style={{ color }}> |V| </span>
            = jumlah simpul &nbsp;·&nbsp;
            <span className="font-mono font-bold" style={{ color }}> |E| </span>
            = jumlah sisi &nbsp;·&nbsp;
            <span className="font-mono font-bold" style={{ color }}> h </span>
            = heuristik
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponen kecil pendukung
// ---------------------------------------------------------------------------

function BadgeUnggul({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(238,238,238,0.2)', color: '#EEEEEE' }}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function ItemKesimpulan({
  icon, label, nilai, color,
}: {
  icon: React.ReactNode;
  label: string;
  nilai: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex items-center gap-1" style={{ color }}>
        {icon}
        <span className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>{label}</span>
      </div>
      <span className="text-sm font-extrabold" style={{ color: '#1A1A1A' }}>{nilai}</span>
    </div>
  );
}

function InterpretasiItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle size={13} color="#DB1A1A" className="mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>{children}</p>
    </div>
  );
}
