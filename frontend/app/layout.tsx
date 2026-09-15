import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display-var',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-ui-var',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-data-var',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GhostNet AI — Sonar Intelligence Platform | SIH 2024',
  description: 'Autonomous side-scan sonar detection & hydrographic survey intelligence platform for ghost nets and marine debris. YOLOv8-powered real-time detection across India\'s 8,118 km coastline.',
  keywords: ['GhostNet', 'Sonar AI', 'Marine Debris', 'Ghost Net Detection', 'Autonomous Survey', 'YOLOv8', 'SIH 2024', 'Hydrographic Survey'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#050810] text-white">
        {children}
      </body>
    </html>
  );
}

