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
  description: 'Autonomous side-scan sonar detection & hydrographic survey intelligence platform for ghost nets and marine debris. YOLOv8-powered real-time detection across India\'s 11,098 km coastline.',
  keywords: ['GhostNet', 'Sonar AI', 'Marine Debris', 'Ghost Net Detection', 'Autonomous Survey', 'YOLOv8', 'SIH 2024', 'Hydrographic Survey'],
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/ghostnet-logo.png?v=3', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: '/apple-touch-icon.png?v=3',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/ghostnet-logo.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
      </head>
      <body className="antialiased bg-[#050810] text-white">
        {children}
      </body>
    </html>
  );
}

