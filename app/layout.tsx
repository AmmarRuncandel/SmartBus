import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SmartBus Analytics – Simulasi Algoritma Rute Optimal',
  description:
    'A comparative simulation of A* and Uniform Cost Search (UCS) algorithms for finding the most optimal inter-city bus route across West Java and Jakarta terminals.',
  keywords: ['A* algorithm', 'UCS', 'bus route', 'pathfinding', 'algorithm simulation'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className="min-h-screen"
        style={{ background: '#EEEEEE' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
