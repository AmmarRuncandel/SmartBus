'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bus, LayoutDashboard, Map } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY <= 12) {
        setIsHidden(false);
        lastY = currentY;
        return;
      }

      if (delta > 8) {
        setIsHidden(true);
      } else if (delta < -4) {
        setIsHidden(false);
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-transform duration-300 ease-out ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2a1a1a 100%)',
        borderBottom: '1px solid rgba(219,26,26,0.3)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo + Nama Aplikasi — klik kembali ke beranda */}
      <Link href="/" className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #DB1A1A, #BD114A)' }}
        >
          <Bus size={20} color="#EEEEEE" strokeWidth={2} />
        </div>
        <div>
          <h1
            className="text-lg font-bold leading-none tracking-tight"
            style={{ color: '#EEEEEE' }}
          >
            SmartBus
            <span className="ml-1 font-light" style={{ color: '#DB1A1A' }}>
              Analytics
            </span>
          </h1>
          <p
            className="text-xs leading-none mt-0.5"
            style={{ color: 'rgba(238,238,238,0.45)' }}
          >
            Simulasi Algoritma Rute Optimal
          </p>
        </div>
      </Link>

      {/* Navigasi */}
      <div className="flex items-center gap-1">
        <TombolNav
          href="/"
          icon={<LayoutDashboard size={14} />}
          label="Dasbor"
          aktif={pathname === '/'}
        />
        <TombolNav
          href="/PetaRute"
          icon={<Map size={14} />}
          label="Peta Rute"
          aktif={pathname === '/PetaRute'}
        />
      </div>

      {/* Indikator status */}
      <div
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{
          background: 'rgba(219,26,26,0.15)',
          border: '1px solid rgba(219,26,26,0.3)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#DB1A1A' }}
        />
        <span className="text-xs font-medium" style={{ color: '#DB1A1A' }}>
          Simulasi Aktif
        </span>
      </div>
    </nav>
  );
}

function TombolNav({
  href,
  icon,
  label,
  aktif,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  aktif: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
      style={{
        color: aktif ? '#EEEEEE' : 'rgba(238,238,238,0.5)',
        background: aktif ? 'rgba(219,26,26,0.2)' : 'transparent',
        border: aktif ? '1px solid rgba(219,26,26,0.4)' : '1px solid transparent',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
