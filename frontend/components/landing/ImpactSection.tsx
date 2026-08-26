'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TECH = [
  { id: 't1', label: 'YOLO-seg' },
  { id: 't2', label: 'ONNX Runtime' },
  { id: 't3', label: 'Synthetic Data' },
  { id: 't4', label: 'Three.js' },
  { id: 't5', label: 'Next.js 14' },
  { id: 't6', label: 'FastAPI' },
  { id: 't7', label: 'Docker' },
  { id: 't8', label: 'PostgreSQL' },
];

const ARCH_NODES = [
  { id: 'a1', label: 'Sonar Drone', sub: 'Edge device', icon: '◈' },
  { id: 'a2', label: 'YOLO-seg', sub: 'ONNX Runtime', icon: '◎' },
  { id: 'a3', label: 'FastAPI', sub: 'Processing layer', icon: '⬡' },
  { id: 'a4', label: 'Dashboard', sub: 'Next.js UI', icon: '▦' },
];

export default function ImpactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const quoteContainerRef = useRef<HTMLDivElement>(null);
  const quoteLineRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {

      // Quote — word-by-word reveal
      if (quoteContainerRef.current) {
        const quoteText = 'Every ton of gear we find before it\'s lost for another decade is a reef that doesn\'t die slowly.';
        const quoteEl = quoteContainerRef.current.querySelector('.quote-text') as HTMLElement;
        if (quoteEl) {
          quoteEl.innerHTML = '';
          quoteText.split(' ').forEach((word) => {
            const outer = document.createElement('span');
            outer.style.cssText = 'display:inline-block;overflow:hidden;margin-right:0.3em;';
            const inner = document.createElement('span');
            inner.style.cssText = 'display:inline-block;transform:translateY(110%);opacity:0;will-change:transform,opacity;';
            inner.textContent = word;
            outer.appendChild(inner);
            quoteEl.appendChild(outer);
          });
        }
        const words = quoteEl?.querySelectorAll('span > span') ?? [];
        ScrollTrigger.create({
          trigger: quoteContainerRef.current,
          start: 'top 82%',
          onEnter: () => {
            gsap.to(words, {
              y: '0%', opacity: 1,
              duration: 0.9, ease: 'expo.out',
              stagger: 0.04,
            });
            gsap.fromTo(quoteLineRef.current,
              { scaleY: 0 },
              { scaleY: 1, duration: 1.2, ease: 'expo.out', delay: 0.3, transformOrigin: 'top center' }
            );
          },
        });
      }

      // Tech pills cascade
      if (techRef.current) {
        const pills = techRef.current.querySelectorAll('.tech-pill');
        ScrollTrigger.create({
          trigger: techRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(pills,
              { opacity: 0, scale: 0.8, y: 18 },
              { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.065 }
            );
          },
        });
      }

      // Architecture nodes + lines
      if (archRef.current) {
        const nodes = archRef.current.querySelectorAll('.arch-node');
        const lines = archRef.current.querySelectorAll('.arch-line');
        const labels = archRef.current.querySelectorAll('.arch-label');
        ScrollTrigger.create({
          trigger: archRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(lines,
              { scaleX: 0, opacity: 0 },
              { scaleX: 1, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.18, transformOrigin: 'left center' }
            );
            gsap.fromTo(nodes,
              { opacity: 0, scale: 0.75, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.16, delay: 0.25 }
            );
            gsap.fromTo(labels,
              { opacity: 0 },
              { opacity: 1, duration: 0.5, stagger: 0.16, delay: 0.6 }
            );
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="impact"
      className="landing-section"
      style={{ padding: 'var(--section-padding) clamp(1.5rem, 4vw, 3rem)', background: 'transparent', position: 'relative' }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 85% 90% at 50% 50%, rgba(2,8,16,0.25) 0%, rgba(2,8,16,0.55) 100%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Quote block ── */}
        <div
          ref={quoteContainerRef}
          style={{
            maxWidth: '860px',
            margin: '0 auto clamp(5rem, 9vw, 8rem)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Vertical accent line left */}
          <div
            ref={quoteLineRef}
            style={{
              position: 'absolute',
              left: '-2.5rem',
              top: 0, bottom: 0,
              width: '2px',
              background: 'linear-gradient(to bottom, transparent, #2dd4bf 30%, #2dd4bf 70%, transparent)',
              willChange: 'transform',
            }}
          />
          <div className="label-caps" style={{ marginBottom: '2rem', color: 'rgba(45,212,191,0.5)' }}>
            Why It Matters
          </div>
          <blockquote
            className="quote-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
              fontWeight: 600,
              lineHeight: 1.3,
              color: 'rgba(226,234,244,0.88)',
              letterSpacing: '-0.02em',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              textAlign: 'left',
              gap: 0,
            }}
          />
        </div>

        {/* ── Tech stack ── */}
        <div style={{ marginBottom: 'clamp(4rem, 7vw, 6rem)' }}>
          <div className="label-caps" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Built With</div>
          <div
            ref={techRef}
            id="tech-stack"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'center' }}
          >
            {TECH.map((t) => (
              <div
                key={t.id} id={t.id}
                className="tech-pill"
                style={{
                  opacity: 0,
                  padding: '0.55rem 1.2rem',
                  borderRadius: '100px',
                  background: 'rgba(45,212,191,0.07)',
                  border: '1px solid rgba(45,212,191,0.22)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#2dd4bf',
                  letterSpacing: '0.04em',
                  willChange: 'transform, opacity',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(45,212,191,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(45,212,191,0.55)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(45,212,191,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45,212,191,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(45,212,191,0.22)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Architecture diagram ── */}
        <div
          ref={archRef}
          id="architecture-diagram"
          className="solid-panel"
          style={{
            padding: 'clamp(2.5rem, 5vw, 4rem)',
            borderRadius: '16px',
            background: '#060b16',
            border: '1px solid rgba(45,212,191,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5) 50%, transparent)',
          }} />

          <div className="label-caps" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            System Architecture
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: 0,
          }}>
            {ARCH_NODES.map((node, i) => (
              <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Node */}
                <div
                  id={node.id}
                  className="arch-node"
                  style={{
                    opacity: 0,
                    textAlign: 'center',
                    padding: '1.5rem 1.25rem',
                    minWidth: 'clamp(100px, 14vw, 160px)',
                    willChange: 'transform, opacity',
                    background: 'rgba(45,212,191,0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(45,212,191,0.15)',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', color: '#2dd4bf', marginBottom: '0.5rem', opacity: 0.85 }}>
                    {node.icon}
                  </div>
                  <div className="arch-label" style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.88rem',
                    fontWeight: 700, color: '#fff', marginBottom: '0.25rem', opacity: 0,
                  }}>
                    {node.label}
                  </div>
                  <div className="arch-label" style={{
                    fontSize: '0.68rem', color: 'rgba(226,234,244,0.4)', opacity: 0,
                    fontFamily: 'var(--font-body)',
                  }}>
                    {node.sub}
                  </div>
                </div>

                {/* Connector */}
                {i < ARCH_NODES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                    <div
                      className="arch-line"
                      style={{
                        width: 'clamp(28px, 5vw, 60px)', height: '1px',
                        background: 'linear-gradient(90deg, rgba(45,212,191,0.5), rgba(45,212,191,0.7))',
                        willChange: 'transform, opacity',
                      }}
                    />
                    <div style={{
                      width: 0, height: 0,
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderLeft: '6px solid rgba(45,212,191,0.6)',
                      flexShrink: 0,
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Attribution credit */}
        <p style={{
          marginTop: '3rem', textAlign: 'center',
          fontSize: '0.72rem', color: 'rgba(226,234,244,0.25)',
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-body)',
        }}>
          3D assets: <a href="https://sketchfab.com" style={{ color: 'rgba(45,212,191,0.4)', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">Sketchfab</a> (CC-BY) — Ninja_Fish, TepidGames &nbsp;·&nbsp;
          HDRI: <a href="https://polyhaven.com" style={{ color: 'rgba(45,212,191,0.4)', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">Poly Haven</a> (CC0)
        </p>
      </div>
    </section>
  );
}
