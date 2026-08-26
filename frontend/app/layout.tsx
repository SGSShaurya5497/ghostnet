import type { Metadata } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Space Grotesk — geometric, editorial, luxury tech header font
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-syne',
  display: 'swap',
});

// Plus Jakarta Sans — ultra-crisp, modern luxury body typography
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// JetBrains Mono — authentic deep-sea telemetry, coordinates, and system stats
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GhostNet — Deep Ocean AI Sonar Intelligence',
  description:
    'AI-powered autonomous sonar analysis locating and geotagging abandoned ghost fishing gear across uncharted ocean depths.',
  keywords: ['ghost nets', 'ocean conservation', 'autonomous sonar', 'deep sea AI', 'marine telemetry', 'YOLO segmentation'],
  openGraph: {
    title: 'GhostNet — Finding What The Ocean Forgot',
    description:
      'Hunting the nets that never stopped hunting. Autonomous AI eyes for an uncharted seafloor.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-[#02050e] text-[#e2eaf4]">{children}</body>
    </html>
  );
}
