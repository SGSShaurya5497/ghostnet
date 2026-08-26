'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { scrollProgressRef, scrollVelocityRef } from '@/components/landing/OceanCanvas';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafFnRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Initialize Lenis with ultra-fluid physics
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Track scroll progress & velocity for WebGL and Kinetic CSS
    lenis.on('scroll', (e: { progress: number; velocity: number; scroll: number }) => {
      scrollProgressRef.current = e.progress;
      scrollVelocityRef.current = e.velocity || 0;

      // Update CSS variables for velocity-based kinetic text effects
      const clampedVel = Math.max(-20, Math.min(20, e.velocity || 0));
      document.documentElement.style.setProperty('--scroll-velocity', `${clampedVel}`);
      document.documentElement.style.setProperty('--scroll-progress', `${e.progress}`);
      document.documentElement.style.setProperty('--scroll-y', `${e.scroll}px`);
    });

    // Drive Lenis via GSAP ticker
    const rafFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    rafFnRef.current = rafFn;
    gsap.ticker.add(rafFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (rafFnRef.current) gsap.ticker.remove(rafFnRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
