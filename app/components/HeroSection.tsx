import { MapPin, Cpu } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '560px', paddingTop: '72px' }}
    >
      {/* Gambar latar belakang */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000)',
        }}
      />

      {/* Lapisan gelap di atas gambar */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(26,26,26,0.92) 0%, rgba(26,10,10,0.85) 50%, rgba(26,26,26,0.92) 100%)',
        }}
      />

      {/* Garis dekoratif atas dan bawah */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{
          background:
            'linear-gradient(90deg, transparent, #DB1A1A, #BD114A, transparent)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(219,26,26,0.4), transparent)',
        }}
      />

      {/* Atmosfer futuristik */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(80% 65% at 78% 42%, rgba(219,26,26,0.25) 0%, rgba(189,17,74,0.08) 38%, rgba(26,26,26,0) 70%)',
        }}
      />

      {/* Konten utama kanan */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-16 sm:py-20 min-h-[560px] grid grid-cols-12 items-center">
        <div className="col-span-12 lg:col-start-7 lg:col-span-6">
          <div
            className="rounded-3xl p-5 sm:p-7"
            style={{
              background:
                'linear-gradient(140deg, rgba(26,26,26,0.56), rgba(26,12,12,0.38))',
              border: '1px solid rgba(238,238,238,0.12)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(238,238,238,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Label kategori */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'rgba(219,26,26,0.15)',
                border: '1px solid rgba(219,26,26,0.4)',
              }}
            >
              <Cpu size={14} color="#DB1A1A" />
              <span
                className="text-sm font-semibold tracking-widest uppercase"
                style={{ color: '#DB1A1A' }}
              >
                Riset &amp; Pengembangan
              </span>
            </div>

            {/* Judul utama */}
            <h2
              className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5"
              style={{ color: '#EEEEEE', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              Rute Bus Antar Kota
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #DB1A1A, #BD114A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Simulasi Navigasi Optimal
              </span>
            </h2>

            {/* Deskripsi singkat */}
            <p
              className="text-base sm:text-lg leading-relaxed mb-8"
              style={{ color: 'rgba(238,238,238,0.78)' }}
            >
              Analisis perbandingan performa antara algoritma{' '}
              <span style={{ color: '#DB1A1A', fontWeight: 600 }}>A* (A-Star)</span> dan{' '}
              <span style={{ color: '#BD114A', fontWeight: 600 }}>
                Uniform Cost Search (UCS)
              </span>{' '}
              dalam menemukan rute bus paling optimal berdasarkan jarak dan biaya operasional
              di terminal-terminal Jawa Barat dan Jakarta.
            </p>

            {/* Informasi singkat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <MapPin size={16} />, label: '8 Terminal Bus' },
                { icon: <Cpu size={16} />, label: '2 Algoritma Dibandingkan' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                  style={{
                    color: 'rgba(238,238,238,0.78)',
                    background: 'rgba(26,26,26,0.34)',
                    border: '1px solid rgba(238,238,238,0.12)',
                  }}
                >
                  <span style={{ color: '#DB1A1A' }}>{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
