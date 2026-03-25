'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

/**
 * Halaman error global — ditampilkan ketika terjadi runtime error.
 * Harus berupa Client Component agar dapat menerima prop `reset`.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Catat error ke layanan monitoring jika tersedia
    console.error('[SmartBus Error]', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#EEEEEE' }}
    >
      {/* Latar geometris */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(219,26,26,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Kartu */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden text-center"
        style={{
          background: '#EEEEEE',
          border: '1px solid rgba(219,26,26,0.18)',
          boxShadow: '0 24px 64px rgba(26,26,26,0.12)',
        }}
      >
        {/* Strip merah di atas */}
        <div
          className="w-full h-1"
          style={{
            background: 'linear-gradient(90deg, transparent, #DB1A1A, #BD114A, transparent)',
          }}
        />

        <div className="px-8 py-12 flex flex-col items-center gap-6">
          {/* Ikon peringatan */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
          >
            <AlertTriangle size={36} color="#EEEEEE" strokeWidth={1.5} />
          </div>

          {/* Judul error */}
          <div>
            <p
              className="text-6xl font-black leading-none tracking-tighter mb-2"
              style={{
                background: 'linear-gradient(135deg, #DB1A1A, #BD114A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              500
            </p>
            <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
              Terjadi Kesalahan
            </h1>
          </div>

          {/* Pesan error */}
          <div className="flex flex-col gap-2 w-full">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.55)' }}>
              Sistem mengalami gangguan sementara. Silakan coba muat ulang halaman.
            </p>
            {error.digest && (
              <div
                className="rounded-xl px-3 py-2"
                style={{ background: 'rgba(219,26,26,0.06)', border: '1px solid rgba(219,26,26,0.12)' }}
              >
                <p className="text-xs font-mono" style={{ color: 'rgba(26,26,26,0.4)' }}>
                  Kode: {error.digest}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'rgba(26,26,26,0.08)' }} />

          {/* Tombol */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #DB1A1A, #BD114A)',
                color: '#EEEEEE',
                boxShadow: '0 4px 16px rgba(219,26,26,0.3)',
              }}
            >
              <RotateCcw size={15} />
              Coba Lagi
            </button>
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(26,26,26,0.06)',
                color: '#1A1A1A',
                border: '1px solid rgba(26,26,26,0.12)',
              }}
            >
              <Home size={15} />
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>

      {/* Branding bawah */}
      <p className="relative z-10 mt-8 text-xs" style={{ color: 'rgba(26,26,26,0.35)' }}>
        SmartBus Analytics &mdash; Simulasi Algoritma Rute Optimal
      </p>
    </div>
  );
}
