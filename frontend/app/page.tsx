'use client';

import dynamic from 'next/dynamic';
import SmoothScrollProvider from '@/components/landing/SmoothScrollProvider';
import NavBar from '@/components/landing/NavBar';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import ImpactSection from '@/components/landing/ImpactSection';
import CTASection from '@/components/landing/CTASection';
import SonarMarquee from '@/components/landing/SonarMarquee';

// Lazy-load the WebGL canvas (client-side only for Three.js)
const OceanCanvas = dynamic(() => import('@/components/landing/OceanCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      {/* Interactive WebGL LiDAR Ocean — fixed z-index 0 */}
      <OceanCanvas />

      {/* Navigation Bar */}
      <NavBar />

      {/* Main Kinetic Scroll Narrative */}
      <main id="main-content">
        {/* Section 1: Cinematic Hero */}
        <HeroSection />

        {/* Telemetry Stream 1 */}
        <SonarMarquee direction="left" speed={40} />

        {/* Section 2: Problem & Scale */}
        <ProblemSection />

        {/* Telemetry Stream 2 */}
        <SonarMarquee
          direction="right"
          speed={45}
          items={[
            'SEABED 2030 // 71.3% UNMAPPED',
            '640,000 TONS LOST ANNUALLY',
            'SPECKLE NOISE FILTERED',
            'ACOUSTIC SHADOW EXTRACTION',
            'SUBSEA RESTORATION VECTORS',
          ]}
        />

        {/* Section 3: Pinned Solution Pipeline */}
        <SolutionSection />

        {/* Section 4: Architecture & Impact */}
        <ImpactSection />

        {/* Section 5: CTA Breach to Mission Control */}
        <CTASection />
      </main>
    </SmoothScrollProvider>
  );
}
