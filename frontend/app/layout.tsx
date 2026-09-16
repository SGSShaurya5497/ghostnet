import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import { SoundProvider } from '@/lib/sound-context';
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
  title: 'GhostNet Systems™ | Autonomous Subsea Sonar Intelligence Platform',
  description: 'Enterprise autonomous side-scan sonar intelligence and hydrographic survey platform for deep-sea anomaly identification, ghost gear interdiction, and seabed feature mapping. Powered by Edge YOLOv8 neural acoustics.',
  keywords: ['GhostNet', 'Acoustic AI', 'Side-Scan Sonar', 'AUV Telemetry', 'Subsea Anomaly Detection', 'Hydrographic Survey', 'YOLOv8 ONNX', 'Ocean Robotics'],
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
        <SoundProvider>
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}

