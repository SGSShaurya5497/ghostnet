'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeOverlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const animatables = sectionRef.current!.querySelectorAll('.cta-item');
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        onEnter: () => {
          gsap.fromTo(animatables,
            { opacity: 0, y: 35, filter: 'blur(8px)' },
            {
              opacity: 1, y: 0, filter: 'blur(0px)',
              duration: 1.0, ease: 'expo.out', stagger: 0.18,
            }
          );
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (!buttonRef.current || !wipeRef.current) return;
    buttonRef.current.disabled = true;

    const tl = gsap.timeline({
      onComplete: () => router.push('/dashboard'),
    });

    // 1. Button glow burst
    tl.to(buttonRef.current, {
      boxShadow: '0 0 100px rgba(45,212,191,1), 0 0 200px rgba(45,212,191,0.5)',
      scale: 1.06,
      duration: 0.25,
      ease: 'power2.out',
    });

    // 2. Teal wipe rises from bottom — like surfacing through water
    tl.fromTo(wipeRef.current,
      { y: '102%' },
      { y: '0%', duration: 0.9, ease: 'expo.inOut' },
      '+=0.05'
    );

    // 3. Overlay brightens as it "breaks surface" — white flash
    tl.fromTo(wipeOverlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.in' },
      '-=0.25'
    );
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="cta"
        className="landing-section"
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--section-padding) clamp(1.5rem, 4vw, 3rem)',
          background: 'transparent',
          position: 'relative',
        }}
      >
        {/* Dark vignette — draws focus inward */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 65% 65% at 50% 50%, rgba(2,8,16,0.1) 0%, rgba(2,8,16,0.72) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Large teal ambient orb behind button */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(600px, 70vw)', height: 'min(600px, 70vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'glow-pulse 4s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Micro-copy */}
          <p
            className="cta-item"
            style={{
              opacity: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(45,212,191,0.6)',
              marginBottom: '2rem',
            }}
          >
            This is where it becomes real.
          </p>

          {/* The button */}
          <button
            ref={buttonRef}
            id="enter-dashboard-btn"
            className="cta-item glass-button"
            onClick={handleClick}
            style={{
              opacity: 0,
              padding: '1.25rem 3.6rem',
              fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
              willChange: 'transform, box-shadow',
            }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>Enter the Dashboard</span>
          </button>

          {/* Supporting text */}
          <p
            className="cta-item"
            style={{
              opacity: 0,
              marginTop: '2rem',
              color: 'rgba(226,234,244,0.3)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.05em',
            }}
          >
            Live detection &nbsp;·&nbsp; Real coordinates &nbsp;·&nbsp; Actionable hazard maps
          </p>

          {/* Sonar decoration */}
          <div
            className="cta-item"
            style={{ opacity: 0, marginTop: '3.5rem', display: 'flex', justifyContent: 'center' }}
          >
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" aria-hidden="true">
              {[38, 29, 20, 11].map((r, i) => (
                <path
                  key={i}
                  d={`M50 48 A${r} ${r} 0 0 0 50 ${48 - r * 2 + 2}`}
                  stroke={`rgba(45,212,191,${0.12 + i * 0.06})`}
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="50" cy="46" r="2.5" fill="#2dd4bf" opacity="0.65" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Wipe transition overlay ───────────────────────────────────────── */}
      {/* Starts off-screen below; sweeps up on CTA click */}
      <div
        ref={wipeRef}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'linear-gradient(180deg, #0d9488 0%, #2dd4bf 50%, #5eead4 100%)',
          transform: 'translateY(102%)',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
      {/* White flash on top of the teal wipe */}
      <div
        ref={wipeOverlayRef}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(255,255,255,0.9)',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
      />
    </>
  );
}
