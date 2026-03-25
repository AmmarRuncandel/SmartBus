import Link from 'next/link';
import { Bus, Home, Map, ArrowRight } from 'lucide-react';

/**
 * Halaman 404 — ditampilkan ketika rute tidak ditemukan.
 * Desain selaras dengan tema SmartBus Analytics.
 */
export default function NotFound() {
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

      {/* Kartu utama */}
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
          {/* Ikon kendaraan */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
          >
            <Bus size={36} color="#EEEEEE" strokeWidth={1.5} />
          </div>

          {/* Nomor error */}
          <div>
            <p
              className="text-8xl font-black leading-none tracking-tighter mb-1"
              style={{
                background: 'linear-gradient(135deg, #DB1A1A, #BD114A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              404
            </p>
            <h1
              className="text-xl font-bold"
              style={{ color: '#1A1A1A' }}
            >
              Rute Tidak Ditemukan
            </h1>
          </div>

          {/* Penjelasan */}
          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: 'rgba(26,26,26,0.55)' }}
          >
            Halaman yang kamu cari tidak tersedia atau telah dipindahkan.
            Bus sudah berangkat kembali ke jalur yang benar.
          </p>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'rgba(26,26,26,0.08)' }} />

          {/* Tombol aksi */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #DB1A1A, #BD114A)',
                color: '#EEEEEE',
                boxShadow: '0 4px 16px rgba(219,26,26,0.3)',
              }}
            >
              <Home size={15} />
              Kembali ke Beranda
            </Link>
            <Link
              href="/PetaRute"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(26,26,26,0.06)',
                color: '#1A1A1A',
                border: '1px solid rgba(26,26,26,0.12)',
              }}
            >
              <Map size={15} />
              Peta Rute
              <ArrowRight size={13} />
            </Link>
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
