'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const hudTopLeftRef = useRef<HTMLDivElement>(null);
  const hudTopRightRef = useRef<HTMLDivElement>(null);
  const hudBottomLeftRef = useRef<HTMLDivElement>(null);
  const hudBottomRightRef = useRef<HTMLDivElement>(null);

  // Live telemetry mock simulation for authentic luxury tech feeling
  const [telemetryDepth, setTelemetryDepth] = useState(248.4);
  const [pingCount, setPingCount] = useState(14820);

  useEffect(() => {
    const depthInterval = setInterval(() => {
      setTelemetryDepth((prev) => +(prev + (Math.random() - 0.48) * 0.4).toFixed(1));
      setPingCount((prev) => prev + 1);
    }, 1800);
    return () => clearInterval(depthInterval);
  }, []);

  useEffect(() => {
    // ── Character Split Animation Generator ──
    const splitTextIntoChars = (
      element: HTMLDivElement | null,
      text: string,
      color: string,
      glow = false
    ) => {
      if (!element) return [];
      element.innerHTML = '';
      element.style.display = 'inline-flex';
      element.style.overflow = 'visible';

      return text.split('').map((char) => {
        const clipper = document.createElement('span');
        clipper.style.cssText = `
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          padding: 0.05em 0;
        `;
        const inner = document.createElement('span');
        inner.style.cssText = `
          display: inline-block;
          color: ${color};
          transform: translateY(115%) rotate(3deg);
          opacity: 0;
          filter: blur(8px);
          will-change: transform, opacity, filter;
          ${
            glow
              ? 'text-shadow: 0 0 40px rgba(45, 212, 191, 0.7), 0 0 90px rgba(45, 212, 191, 0.4);'
              : 'text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9);'
          }
        `;
        inner.textContent = char === ' ' ? '\u00A0' : char;
        clipper.appendChild(inner);
        element.appendChild(clipper);
        return inner;
      });
    };

    const ghostChars = splitTextIntoChars(ghostRef.current, 'Ghost', '#ffffff', false);
    const netChars = splitTextIntoChars(netRef.current, 'Net', '#2dd4bf', true);

    // ── Tagline Word Split ──
    const taglineText = 'Hunting the nets that never stopped hunting.';
    if (taglineRef.current) {
      taglineRef.current.innerHTML = '';
      taglineText.split(' ').forEach((word) => {
        const outer = document.createElement('span');
        outer.style.cssText = 'display: inline-block; overflow: hidden; margin-right: 0.28em;';
        const inner = document.createElement('span');
        inner.style.cssText =
          'display: inline-block; transform: translateY(100%); opacity: 0; filter: blur(4px); will-change: transform, opacity;';
        inner.textContent = word;
        outer.appendChild(inner);
        taglineRef.current!.appendChild(outer);
      });
    }
    const taglineWords = taglineRef.current?.querySelectorAll('span > span') ?? [];

    // ── Master Cinematic Timeline ──
    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'expo.out' } });

    // HUD Telemetry fades in first
    tl.fromTo(
      [
        hudTopLeftRef.current,
        hudTopRightRef.current,
        hudBottomLeftRef.current,
        hudBottomRightRef.current,
      ],
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.0, stagger: 0.08 }
    );

    // Top Mission Badge
    tl.fromTo(
      badgeRef.current,
      { opacity: 0, y: -20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9 },
      '-=0.7'
    );

    // "Ghost" character cascade
    tl.to(
      ghostChars,
      {
        y: '0%',
        rotate: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: { each: 0.045, ease: 'power2.out' },
      },
      '-=0.6'
    );

    // "Net" character cascade with cyan bloom
    tl.to(
      netChars,
      {
        y: '0%',
        rotate: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: { each: 0.055, ease: 'power2.out' },
      },
      '-=0.85'
    );

    // Accent line sweep
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1.1, transformOrigin: 'center center' },
      '-=0.7'
    );

    // Tagline words reveal
    tl.to(
      taglineWords,
      {
        y: '0%',
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.85,
        stagger: 0.04,
        ease: 'power3.out',
      },
      '-=0.7'
    );

    // Subtitle & scroll cues
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.5'
    );

    tl.fromTo(
      scrollCueRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.4'
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="landing-section"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px clamp(1.5rem, 4vw, 3rem) 3.5rem',
        position: 'relative',
        background: 'transparent',
      }}
    >
      {/* ── Cinematic Screen-Space Vignette ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 65% 55% at 50% 50%, transparent 20%, rgba(2, 6, 16, 0.75) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Telemetry HUD: Top Left ── */}
      <div
        ref={hudTopLeftRef}
        className="solid-panel"
        style={{
          position: 'absolute',
          top: '104px',
          left: 'clamp(1.5rem, 4vw, 3.5rem)',
          textAlign: 'left',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'rgba(45, 212, 191, 0.75)',
          letterSpacing: '0.1em',
          pointerEvents: 'auto',
          zIndex: 2,
          opacity: 0,
          padding: '0.6rem 1rem',
          background: 'rgba(4, 10, 22, 0.65)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#2dd4bf',
              boxShadow: '0 0 8px #2dd4bf',
              animation: 'glow-pulse 2s infinite',
            }}
          />
          <span style={{ fontWeight: 600, color: '#2dd4bf' }}>SYS.ONNX // ACTIVE</span>
        </div>
        <div style={{ color: 'rgba(226, 234, 244, 0.5)' }}>LAT 48°14&apos;22.4&quot;N · LON 124°42&apos;18.1&quot;W</div>
      </div>

      {/* ── Telemetry HUD: Top Right ── */}
      <div
        ref={hudTopRightRef}
        className="solid-panel"
        style={{
          position: 'absolute',
          top: '104px',
          right: 'clamp(1.5rem, 4vw, 3.5rem)',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'rgba(45, 212, 191, 0.75)',
          letterSpacing: '0.1em',
          pointerEvents: 'auto',
          zIndex: 2,
          opacity: 0,
          padding: '0.6rem 1rem',
          background: 'rgba(4, 10, 22, 0.65)',
        }}
      >
        <div>
          BATHYMETRY DEPTH:{' '}
          <span style={{ color: '#fff', fontWeight: 600 }}>-{telemetryDepth}M</span>
        </div>
        <div style={{ color: 'rgba(226, 234, 244, 0.5)' }}>
          SONAR PINGS: <span style={{ color: '#2dd4bf' }}>{pingCount.toLocaleString()}</span>
        </div>
      </div>

      {/* ── Center Content Container ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1050px', width: '100%' }}>
        {/* Top Floating Badge */}
        <div
          ref={badgeRef}
          className="ultra-glass mouse-spotlight"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '2.5rem',
            padding: '0.6rem 1.6rem',
            borderRadius: '100px',
            opacity: 0,
            cursor: 'default',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#2dd4bf',
              boxShadow: '0 0 10px #2dd4bf, 0 0 20px rgba(45, 212, 191, 0.6)',
              animation: 'glow-pulse 2.2s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(45, 212, 191, 0.95)',
            }}
          >
            Autonomous Sonar Intelligence
          </span>
        </div>

        {/* ── Main Hero Title ── */}
        <h1
          aria-label="GhostNet"
          className="kinetic-skew"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: '0 0.12em',
            marginBottom: '0',
            lineHeight: 0.88,
          }}
        >
          <div
            ref={ghostRef}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(4.8rem, 14vw, 12.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#ffffff',
            }}
          />
          <div
            ref={netRef}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(4.8rem, 14vw, 12.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#2dd4bf',
            }}
          />
        </h1>

        {/* ── Luminous Accent Line ── */}
        <div
          ref={lineRef}
          style={{
            height: '1px',
            maxWidth: '540px',
            margin: '2rem auto 2.2rem',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(45, 212, 191, 0.5) 20%, rgba(45, 212, 191, 0.95) 50%, rgba(45, 212, 191, 0.5) 80%, transparent 100%)',
            boxShadow: '0 0 15px rgba(45, 212, 191, 0.5)',
            opacity: 0,
          }}
        />

        {/* ── Tagline ── */}
        <div
          ref={taglineRef}
          className="kinetic-skew"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.15rem, 2.5vw, 1.6rem)',
            fontWeight: 500,
            color: 'rgba(226, 234, 244, 0.9)',
            lineHeight: 1.45,
            letterSpacing: '-0.01em',
            maxWidth: '660px',
            margin: '0 auto 1rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        />

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
            color: 'rgba(226, 234, 244, 0.42)',
            letterSpacing: '0.04em',
            maxWidth: '520px',
            margin: '0 auto',
            opacity: 0,
          }}
        >
          AI eyes for a seafloor no one has seen. Real-time ONNX inference directly on the drone.
        </p>

        {/* ── Scroll Radar Cue ── */}
        <div
          ref={scrollCueRef}
          style={{
            marginTop: 'clamp(3.5rem, 7vw, 5.5rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.9rem',
            opacity: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(45, 212, 191, 0.6)',
            }}
          >
            Scroll to descend
          </span>
          <div style={{ position: 'relative', width: '38px', height: '38px' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px solid rgba(45, 212, 191, 0.45)',
                  animation: `sonar-ping 2.6s ease-out ${i * 0.85}s infinite`,
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'sonar-inner 2s ease-in-out infinite',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 4.5L7 9L11.5 4.5"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
