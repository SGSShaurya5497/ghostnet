'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  {
    id: 'stat-tonnage',
    end: 750000,
    display: '500,000–1,000,000',
    suffix: '',
    label: 'tons of fishing gear lost or abandoned in our oceans — every single year',
    source: 'WWF Ghost Fishing Gear Report',
  },
  {
    id: 'stat-deaths',
    end: 100000,
    display: '100,000',
    suffix: '+',
    label: 'seals, sea lions, and large whales killed by ghost gear annually',
    source: 'World Animal Protection / NRDC',
  },
  {
    id: 'stat-mammals',
    end: 45,
    display: '45',
    suffix: '%',
    label: 'of all marine mammals on the IUCN Red List have been killed or harmed by abandoned fishing gear',
    source: 'World Animal Protection',
  },
  {
    id: 'stat-years',
    end: 600,
    display: '600',
    suffix: ' years',
    label: 'how long a single ghost net keeps killing before it decomposes',
    source: 'FAO-derived estimate',
  },
  {
    id: 'stat-patch',
    end: 46,
    display: '46',
    suffix: '%',
    label: 'of the Great Pacific Garbage Patch is discarded nets, lines, and ropes',
    source: 'WWF Ghost Fishing Gear Report',
  },
];

const WHY_PANELS = [
  { id: 'why-speckle', icon: '◈', title: 'Speckle Noise', body: 'Speckle noise turns a clean signal into static.' },
  { id: 'why-shadow', icon: '◧', title: 'Acoustic Shadows', body: 'Acoustic shadows hide as much as they reveal.' },
  { id: 'why-dropout', icon: '⊟', title: 'Data Dropout', body: 'A moving drone means dropped pings and broken frames.' },
];

function StatRow({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;
    const counter = { val: 0 };

    const appear = ScrollTrigger.create({
      trigger: rowRef.current,
      start: 'top 88%',
      onEnter: () => {
        gsap.fromTo(rowRef.current,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'expo.out', delay: index * 0.08 }
        );
        // Progress bar fill
        gsap.fromTo(barRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: 'expo.out', delay: index * 0.08 + 0.2, transformOrigin: 'left center' }
        );
        // Count-up directly to DOM — no React state
        gsap.to(counter, {
          val: stat.end,
          duration: 2.0,
          ease: 'power2.out',
          delay: index * 0.08 + 0.1,
          onUpdate: () => {
            if (numRef.current) {
              numRef.current.textContent = Math.round(counter.val).toLocaleString() + stat.suffix;
            }
          },
          onComplete: () => {
            if (numRef.current) {
              numRef.current.textContent = stat.display + stat.suffix;
            }
          },
        });
      },
      once: true,
    });

    return () => { appear.kill(); };
  }, [stat, index]);

  return (
    <div
      ref={rowRef}
      id={stat.id}
      className="solid-panel"
      style={{
        opacity: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        alignItems: 'center',
        padding: '2.25rem 2.5rem',
        background: '#060b16',
        border: '1px solid rgba(45,212,191,0.12)',
        borderLeft: '3px solid #2dd4bf',
        borderRadius: '0 12px 12px 0',
        willChange: 'transform, opacity',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background glow on hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(45,212,191,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Number */}
      <div>
        <div
          className="display-stat"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1 }}
        >
          <span ref={numRef} aria-live="polite" style={{ fontVariantNumeric: 'tabular-nums' }}>
            0{stat.suffix}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          marginTop: '0.75rem',
          height: '2px',
          background: 'rgba(45,212,191,0.12)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}>
          <div
            ref={barRef}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #0d9488, #2dd4bf, #5eead4)',
              borderRadius: '1px',
              boxShadow: '0 0 8px rgba(45,212,191,0.6)',
              willChange: 'transform',
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div>
        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: 'rgba(226,234,244,0.8)',
          lineHeight: 1.55,
          fontWeight: 400,
        }}>
          {stat.label}
        </p>
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          color: 'rgba(45,212,191,0.4)',
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-display)',
        }}>
          — {stat.source}
        </p>
      </div>
    </div>
  );
}

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const seabedRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll('.h-word');
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(words,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }
            );
          },
        });
      }

      if (seabedRef.current) {
        ScrollTrigger.create({
          trigger: seabedRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(seabedRef.current,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }
            );
          },
        });
      }

      if (whyRef.current) {
        const panels = whyRef.current.querySelectorAll('.why-panel');
        ScrollTrigger.create({
          trigger: whyRef.current,
          start: 'top 82%',
          onEnter: () => {
            gsap.fromTo(panels,
              { opacity: 0, y: 50, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'expo.out', stagger: 0.14 }
            );
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const headingLine1 = ['A', 'net', 'doesn\'t', 'stop', 'hunting', 'when', 'it\'s', 'lost.'];
  const headingLine2 = ['It', 'just', 'stops', 'having', 'a', 'fisherman.'];

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="landing-section"
      style={{ padding: 'var(--section-padding) clamp(1.5rem, 4vw, 3rem)', background: 'transparent', position: 'relative' }}
    >
      {/* Depth overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 100% at 50% 50%, rgba(2,4,12,0.2) 0%, rgba(2,4,12,0.5) 100%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section heading */}
        <div style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)', maxWidth: '900px' }}>
          <div className="label-caps" style={{ marginBottom: '1.5rem', color: 'rgba(45,212,191,0.7)' }}>
            The Scale of the Problem
          </div>
          <div ref={headingRef}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              display: 'flex', flexWrap: 'wrap', gap: '0 0.3em',
            }}>
              {headingLine1.map((w, i) => (
                <span key={i} className="h-word" style={{ display: 'inline-block', opacity: 0, willChange: 'transform, opacity', color: '#fff' }}>{w}</span>
              ))}
              <br style={{ width: '100%', flexBasis: '100%' }} />
              {headingLine2.map((w, i) => (
                <span key={i} className="h-word" style={{ display: 'inline-block', opacity: 0, willChange: 'transform, opacity', color: '#2dd4bf' }}>{w}</span>
              ))}
            </h2>
          </div>
        </div>

        {/* Stats — vertical list, one per row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 'clamp(4rem, 8vw, 7rem)' }}>
          {STATS.map((stat, i) => (
            <StatRow key={stat.id} stat={stat} index={i} />
          ))}
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          marginBottom: 'clamp(3rem, 6vw, 5rem)',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(45,212,191,0.12)' }} />
          <span className="label-caps" style={{ fontSize: '0.65rem', color: 'rgba(45,212,191,0.4)', whiteSpace: 'nowrap' }}>
            The Visibility Problem
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(45,212,191,0.12)' }} />
        </div>

        {/* Seabed 2030 lead stat */}
        <div
          ref={seabedRef}
          style={{
            opacity: 0, willChange: 'transform, opacity',
            marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'clamp(2rem, 4vw, 4rem)',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(4rem, 10vw, 8rem)',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: '#2dd4bf',
              textShadow: '0 0 60px rgba(45,212,191,0.4), 0 0 120px rgba(45,212,191,0.2)',
              whiteSpace: 'nowrap',
            }}>
              28.7%
            </div>
            <p className="label-caps" style={{ marginTop: '0.5rem', color: 'rgba(45,212,191,0.5)', fontSize: '0.65rem' }}>
              Seabed 2030 / GEBCO
            </p>
          </div>
          <div>
            <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', color: 'rgba(226,234,244,0.85)', lineHeight: 1.6, marginBottom: '1rem' }}>
              of the world&apos;s ocean floor has been mapped to modern standards.
            </p>
            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', color: 'rgba(226,234,244,0.5)', lineHeight: 1.6 }}>
              Over 70% of the seafloor — where most of this debris settles — has never been properly charted. Manual sonar review can&apos;t keep pace with an ocean this large.
            </p>
          </div>
        </div>

        {/* Why this is hard */}
        <div className="label-caps" style={{ marginBottom: '1.5rem', color: 'rgba(45,212,191,0.7)' }}>
          Why Sonar Detection is Hard
        </div>
        <div
          ref={whyRef}
          id="why-hard-panels"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}
        >
          {WHY_PANELS.map((p) => (
            <div
              key={p.id} id={p.id}
              className="why-panel solid-panel"
              style={{
                opacity: 0,
                padding: '2rem 1.75rem',
                borderRadius: '12px',
                background: '#060b16',
                border: '1px solid rgba(45,212,191,0.12)',
                borderTop: '2px solid rgba(45,212,191,0.55)',
                willChange: 'transform, opacity, scale',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, rgba(45,212,191,0.05), transparent)', pointerEvents: 'none' }} />
              <div style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#2dd4bf', opacity: 0.9 }}>{p.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.6rem', color: '#fff' }}>{p.title}</h3>
              <p className="body-small" style={{ lineHeight: 1.65 }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* Closing quote */}
        <div style={{ marginTop: 'clamp(4rem, 8vw, 7rem)', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            fontWeight: 600,
            color: 'rgba(226,234,244,0.5)',
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            &ldquo;A net doesn&apos;t stop hunting when it&apos;s lost. It just stops having a fisherman.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
