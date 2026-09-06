import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
  title: 'GhostNet — AI Sonar Intelligence Platform',
  description: 'Autonomous side-scan sonar detection & hydrographic survey intelligence platform for ghost nets and marine debris.',
  keywords: ['GhostNet', 'Sonar AI', 'Marine Debris', 'Autonomous Survey', 'YOLOv8', 'SIH 2024'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#EEF1F5] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
