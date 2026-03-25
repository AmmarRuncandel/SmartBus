import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Dashboard from './components/Dashboard';

/**
 * Halaman utama — Server Component.
 * Menyusun komponen statis (Navbar dan Hero) bersama Dashboard interaktif.
 */
export default function Page() {
  return (
    <div style={{ background: '#EEEEEE', minHeight: '100vh' }}>
      {/* Bilah navigasi tetap di bagian atas */}
      <Navbar />

      {/* Bagian hero dengan foto bus sebagai latar */}
      <HeroSection />

      {/* Dasbor simulasi algoritma interaktif */}
      <Dashboard />

      {/* Footer */}
      <footer
        className="w-full py-8 mt-4"
        style={{
          background: '#1A1A1A',
          borderTop: '1px solid rgba(219,26,26,0.2)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'rgba(238,238,238,0.4)' }}>
            &copy; 2026 SmartBus — Implementasi Algoritma
          </p>
          <p
            className="text-xs font-medium"
            style={{ color: 'rgba(219,26,26,0.7)' }}
          >
            A* Search &amp; Uniform Cost Search : Simulasi Perbandingan Algoritma
          </p>
        </div>
      </footer>
    </div>
  );
}
