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
} from 'lucide-react';
import { AlgorithmResult } from '../lib/algorithms';

interface AnalyticsCardsProps {
  astar: AlgorithmResult | null;
  ucs: AlgorithmResult | null;
}

// ---------------------------------------------------------------------------
// Fungsi pembuat interpretasi hasil dalam bahasa manusia
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
    return `Hanya ${n} dari ${total} simpul — pencarian sangat terarah`;
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

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------

export default function AnalyticsCards({ astar, ucs }: AnalyticsCardsProps) {
  const hasResults = astar && ucs;
  const totalSimpul = hasResults
    ? Math.max(astar.nodesVisited, ucs.nodesVisited)
    : 1;

  const lebihCepat = hasResults
    ? astar.executionTime <= ucs.executionTime
      ? 'astar'
      : 'ucs'
    : null;
  const lebihMurah = hasResults
    ? astar.totalCost <= ucs.totalCost
      ? 'astar'
      : 'ucs'
    : null;
  const lebihEfisien = hasResults
    ? astar.nodesVisited <= ucs.nodesVisited
      ? 'astar'
      : 'ucs'
    : null;

  return (
    <div className="flex flex-col gap-4">
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
            Perbandingan metrik kedua algoritma
          </p>
        </div>
      </div>

      {/* Kartu perbandingan algoritma */}
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
          totalSimpul={totalSimpul}
        />
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
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: '#DB1A1A' }}
            >
              Kesimpulan Simulasi
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <ItemKesimpulan
              icon={<Timer size={13} />}
              label="Waktu Tercepat"
              nilai={lebihCepat === 'astar' ? 'A*' : 'UCS'}
              color="#DB1A1A"
            />
            <ItemKesimpulan
              icon={<TrendingDown size={13} />}
              label="Biaya Terendah"
              nilai={lebihMurah === 'astar' ? 'A*' : 'UCS'}
              color="#DB1A1A"
            />
            <ItemKesimpulan
              icon={<Zap size={13} />}
              label="Paling Efisien"
              nilai={lebihEfisien === 'astar' ? 'A*' : 'UCS'}
              color="#DB1A1A"
            />
          </div>

          {/* Interpretasi keseluruhan dalam bahasa manusia */}
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{
              background: 'rgba(26,26,26,0.04)',
              border: '1px solid rgba(26,26,26,0.08)',
            }}
          >
            <div className="flex items-start gap-2">
              <CheckCircle
                size={13}
                color="#DB1A1A"
                className="mt-0.5 shrink-0"
              />
              <p className="text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>
                {astar.totalCost === ucs.totalCost
                  ? `Kedua algoritma menemukan jalur optimal yang sama dengan total jarak ${astar.totalCost} km.`
                  : `Algoritma ${lebihMurah === 'astar' ? 'A*' : 'UCS'} menghasilkan rute yang lebih hemat dengan selisih ${Math.abs(astar.totalCost - ucs.totalCost)} km.`}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle
                size={13}
                color="#DB1A1A"
                className="mt-0.5 shrink-0"
              />
              <p className="text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>
                A* mengevaluasi {astar.nodesVisited} simpul dibanding UCS yang mengevaluasi{' '}
                {ucs.nodesVisited} simpul.{' '}
                {astar.nodesVisited < ucs.nodesVisited
                  ? 'Heuristik membantu A* memangkas simpul yang tidak perlu diperiksa.'
                  : 'Pada rute ini, UCS lebih efisien karena biaya antar simpul relatif seragam.'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle
                size={13}
                color="#DB1A1A"
                className="mt-0.5 shrink-0"
              />
              <p className="text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>
                {astar.executionTime < ucs.executionTime
                  ? `A* selesai ${(ucs.executionTime - astar.executionTime).toFixed(4)} ms lebih cepat dari UCS. Ini karena heuristik mempersempit ruang pencarian.`
                  : `UCS selesai ${(astar.executionTime - ucs.executionTime).toFixed(4)} ms lebih cepat. Fungsi heuristik pada A* menambah sedikit overhead kalkulasi.`}
              </p>
            </div>
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
  totalSimpul: number;
}

function KartuAlgoritma({
  judul,
  subtitle,
  color,
  gradientFrom,
  gradientTo,
  result,
  lebihCepat,
  lebihMurah,
  lebihEfisien,
  totalSimpul,
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
      {/* Header kartu */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <div>
          <p className="font-bold text-sm" style={{ color: '#EEEEEE' }}>
            {judul}
          </p>
          <p
            className="text-xs font-mono"
            style={{ color: 'rgba(238,238,238,0.7)' }}
          >
            {subtitle}
          </p>
        </div>
        <div className="flex gap-1.5">
          {lebihCepat && (
            <BadgeUnggul icon={<Timer size={11} />} label="Tercepat" />
          )}
          {lebihMurah && (
            <BadgeUnggul icon={<MapPin size={11} />} label="Termurah" />
          )}
          {lebihEfisien && (
            <BadgeUnggul icon={<Zap size={11} />} label="Efisien" />
          )}
        </div>
      </div>

      {/* Baris metrik */}
      <div className="p-4 flex flex-col gap-2">
        <BarisMedtrik
          icon={<Clock size={14} color={color} />}
          label="Waktu Eksekusi"
          nilai={result ? `${result.executionTime.toFixed(4)} ms` : '—'}
          interpretasi={
            result ? interpretasiWaktu(result.executionTime) : undefined
          }
          hasResult={!!result}
          color={color}
        />
        <BarisMedtrik
          icon={<Route size={14} color={color} />}
          label="Total Biaya Rute"
          nilai={result ? `${result.totalCost} km` : '—'}
          interpretasi={
            result ? interpretasiJarak(result.totalCost) : undefined
          }
          hasResult={!!result}
          color={color}
        />
        <BarisMedtrik
          icon={<Zap size={14} color={color} />}
          label="Simpul Dievaluasi"
          nilai={result ? `${result.nodesVisited} simpul` : '—'}
          interpretasi={
            result
              ? interpretasiSimpul(result.nodesVisited, totalSimpul)
              : undefined
          }
          hasResult={!!result}
          color={color}
        />
        <BarisMedtrik
          icon={<BarChart2 size={14} color={color} />}
          label="Panjang Rute"
          nilai={result ? `${result.path.length} terminal` : '—'}
          interpretasi={
            result ? interpretasiJalur(result.path.length) : undefined
          }
          hasResult={!!result}
          color={color}
        />
      </div>
    </div>
  );
}

function BarisMedtrik({
  icon,
  label,
  nilai,
  interpretasi,
  hasResult,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  nilai: string;
  interpretasi?: string;
  hasResult: boolean;
  color: string;
}) {
  return (
    <div
      className="flex flex-col px-2 py-2 rounded-xl"
      style={{
        background: hasResult ? `${color}08` : 'rgba(26,26,26,0.04)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span
            className="text-xs font-medium"
            style={{ color: 'rgba(26,26,26,0.6)' }}
          >
            {label}
          </span>
        </div>
        <span
          className="text-sm font-bold"
          style={{
            color: hasResult ? '#1A1A1A' : 'rgba(26,26,26,0.3)',
          }}
        >
          {nilai}
        </span>
      </div>
      {hasResult && interpretasi && (
        <p
          className="text-xs mt-1 pl-6 leading-snug"
          style={{ color: 'rgba(26,26,26,0.45)' }}
        >
          {interpretasi}
        </p>
      )}
    </div>
  );
}

function BadgeUnggul({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
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
  icon,
  label,
  nilai,
  color,
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
        <span className="text-xs" style={{ color: 'rgba(26,26,26,0.5)' }}>
          {label}
        </span>
      </div>
      <span className="text-sm font-extrabold" style={{ color: '#1A1A1A' }}>
        {nilai}
      </span>
    </div>
  );
}
