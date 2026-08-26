'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { id: 'stage-1', step: '01', icon: '↑', label: 'Upload', desc: 'Raw sonar log goes in.', color: '#2dd4bf' },
  { id: 'stage-2', step: '02', icon: '⚙', label: 'Preprocess', desc: 'Noise stripped, resolution normalized, gaps masked.', color: '#20b2a0' },
  { id: 'stage-3', step: '03', icon: '◎', label: 'Detect', desc: "AI finds what doesn't belong on a natural seafloor.", color: '#17a394' },
  { id: 'stage-4', step: '04', icon: '⊕', label: 'Geotag', desc: 'Every detection pinned to a real coordinate.', color: '#0d9488' },
  { id: 'stage-5', step: '05', icon: '▦', label: 'Report', desc: 'A structured, actionable hazard map — ready to act on.', color: '#0a7a70' },
];

const DETAIL_CARDS = [
  {
    id: 'card-data',
    label: 'Zero Public Dataset',
    body: "No public dataset of ghost nets in sonar exists. So we built our own — synthetic net signatures trained on real seafloor data, so the model learns what no one's labeled before.",
    icon: '◈',
  },
  {
    id: 'card-edge',
    label: 'Runs on the Drone',
    body: 'Built to run on the drone itself. ONNX-optimized for real-time inference at the source. No cloud dependency, no delay — detection happens the moment the sonar pings.',
    icon: '◉',
  },
  {
    id: 'card-model',
    label: 'YOLO-seg Precision',
    body: 'Instance segmentation over object detection — each ghost net gets an exact pixel mask, not just a bounding box. Precision that matters at the retrieval stage.',
    icon: '◎',
  },
];

export default function SolutionSection() {
  const pinnedRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRefs = useRef<(SVGPathElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const activeLabelRef = useRef<HTMLDivElement>(null);
  const activeDescRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pinnedRef.current) return;
    const ctx = gsap.context(() => {

      // Heading
      if (headingRef.current) {
        ScrollTrigger.create({
          trigger: headingRef.current,
          start: 'top 88%',
          onEnter: () => {
            gsap.fromTo(headingRef.current,
              { opacity: 0, y: 25 },
              { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }
            );
          },
        });
      }

      // All stages appear at once when section enters
      const stages = stageRefs.current.filter(Boolean);
      ScrollTrigger.create({
        trigger: pinnedRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(stages,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1 }
          );
        },
      });

      // PIN the section and scrub through stages
      const totalScroll = '+=300%';
      ScrollTrigger.create({
        trigger: pinnedRef.current,
        start: 'top top',
        end: totalScroll,
        pin: wrapperRef.current,
        pinSpacing: true,
        onUpdate: (self) => {
          const progress = self.progress;
          // Update progress bar width
          if (progressRef.current) {
            gsap.set(progressRef.current, { scaleX: progress, transformOrigin: 'left center' });
          }
          // Determine active stage (0-4)
          const activeIndex = Math.min(Math.floor(progress * STAGES.length), STAGES.length - 1);

          // Update stage visual states
          stages.forEach((stage, i) => {
            if (!stage) return;
            if (i < activeIndex) {
              // Completed
              stage.style.borderColor = 'rgba(45,212,191,0.4)';
              stage.style.background = 'rgba(45,212,191,0.06)';
              stage.style.opacity = '0.65';
              stage.style.transform = 'scale(1)';
            } else if (i === activeIndex) {
              // Active
              stage.style.borderColor = 'rgba(45,212,191,0.9)';
              stage.style.background = 'rgba(45,212,191,0.15)';
              stage.style.opacity = '1';
              stage.style.transform = 'scale(1.04)';
              stage.style.boxShadow = '0 0 30px rgba(45,212,191,0.2), 0 0 60px rgba(45,212,191,0.1)';
            } else {
              // Upcoming
              stage.style.borderColor = 'rgba(45,212,191,0.15)';
              stage.style.background = 'rgba(255,255,255,0.03)';
              stage.style.opacity = '0.4';
              stage.style.transform = 'scale(0.97)';
              stage.style.boxShadow = 'none';
            }
          });

          // Animate connectors up to active stage
          connectorRefs.current.forEach((conn, i) => {
            if (!conn) return;
            const connProgress = Math.min(Math.max((progress * STAGES.length) - i, 0), 1);
            const pathLength = 60;
            conn.style.strokeDashoffset = String(pathLength * (1 - connProgress));
            conn.style.opacity = String(0.3 + connProgress * 0.5);
          });

          // Update active stage description
          if (activeLabelRef.current && activeDescRef.current && STAGES[activeIndex]) {
            activeLabelRef.current.textContent = STAGES[activeIndex].label;
            activeDescRef.current.textContent = STAGES[activeIndex].desc;
          }
        },
      });

      // Detail cards appear after pinned section
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.detail-card');
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: 'top 82%',
          onEnter: () => {
            gsap.fromTo(cards,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.14 }
            );
          },
        });
      }
    }, pinnedRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Pinned pipeline section ─────────────────────────────────────── */}
      <section
        ref={pinnedRef}
        id="solution"
        className="landing-section"
        style={{ background: 'transparent', position: 'relative' }}
      >
        <div
          ref={wrapperRef}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px clamp(1.5rem, 4vw, 3rem)',
            background: 'transparent',
            position: 'relative',
          }}
        >
          {/* Overlay for legibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(2,4,12,0.3) 0%, rgba(2,4,12,0.6) 100%)',
            pointerEvents: 'none',
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            <div className="label-caps" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              The Detection Pipeline
            </div>
            <h2
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              className="display-section"
              style={{
                textAlign: 'center',
                opacity: 0,
                willChange: 'transform, opacity',
                marginBottom: 'clamp(3rem, 5vw, 4.5rem)',
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              }}
            >
              From raw sonar to{' '}
              <span style={{ color: '#2dd4bf', textShadow: '0 0 40px rgba(45,212,191,0.4)' }}>
                actionable map
              </span>
              {' '}in five steps.
            </h2>

            {/* ── 5 Stage cards in a row ─── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0',
              alignItems: 'center',
              marginBottom: '3rem',
              position: 'relative',
            }}>
              {STAGES.map((stage, i) => (
                <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Stage card */}
                  <div
                    id={stage.id}
                    ref={(el) => { stageRefs.current[i] = el; }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                      e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                    }}
                    className="solid-panel mouse-spotlight"
                    style={{
                      flex: 1,
                      opacity: 0,
                      padding: '1.75rem 1.25rem',
                      borderRadius: '14px',
                      background: '#060b16',
                      border: '1px solid rgba(45,212,191,0.15)',
                      textAlign: 'center',
                      willChange: 'transform, opacity',
                      transition: 'border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease, transform 0.4s ease',
                      cursor: 'default',
                      marginRight: i < STAGES.length - 1 ? '0' : '0',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top glow on active */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                      background: 'linear-gradient(90deg, transparent, #2dd4bf, transparent)',
                      opacity: 0.6,
                    }} />
                    <div className="label-caps" style={{ marginBottom: '0.75rem', fontSize: '0.6rem', opacity: 0.45 }}>
                      {stage.step}
                    </div>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem', color: '#2dd4bf' }}>
                      {stage.icon}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                      marginBottom: '0.5rem',
                    }}>
                      {stage.label}
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'rgba(226,234,244,0.55)', lineHeight: 1.5 }}>
                      {stage.desc}
                    </p>
                  </div>

                  {/* SVG connector */}
                  {i < STAGES.length - 1 && (
                    <svg width="32" height="20" viewBox="0 0 32 20" style={{ flexShrink: 0, overflow: 'visible' }} aria-hidden="true">
                      <path
                        ref={(el) => { connectorRefs.current[i] = el; }}
                        d="M0 10 H30"
                        stroke="#2dd4bf"
                        strokeWidth="1.5"
                        strokeDasharray="30"
                        strokeDashoffset="30"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.3"
                        style={{ transition: 'stroke-dashoffset 0.3s ease, opacity 0.3s ease' }}
                      />
                      <polygon points="26,6 32,10 26,14" fill="rgba(45,212,191,0.5)" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            {/* Active stage description — updates as scroll advances */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem 2rem',
              background: 'rgba(45,212,191,0.06)',
              border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: '12px',
              maxWidth: '540px',
              margin: '0 auto 2rem',
            }}>
              <div
                ref={activeLabelRef}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem', fontWeight: 700,
                  color: '#2dd4bf', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: '0.4rem',
                }}
              >
                Upload
              </div>
              <p
                ref={activeDescRef}
                style={{ fontSize: '0.95rem', color: 'rgba(226,234,244,0.7)', lineHeight: 1.55 }}
              >
                Raw sonar log goes in.
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ maxWidth: '600px', margin: '0 auto', height: '2px', background: 'rgba(45,212,191,0.1)', borderRadius: '1px', overflow: 'hidden' }}>
              <div
                ref={progressRef}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0d9488, #2dd4bf, #7ff4e8)',
                  boxShadow: '0 0 10px rgba(45,212,191,0.6)',
                  willChange: 'transform',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Detail cards — scrolls normally after pinned section ─── */}
      <section
        id="solution-detail"
        className="landing-section"
        style={{ padding: 'var(--section-padding) clamp(1.5rem, 4vw, 3rem)', background: 'transparent', position: 'relative' }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 90% at 50% 50%, rgba(2,4,12,0.25) 0%, rgba(2,4,12,0.55) 100%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="label-caps" style={{ marginBottom: '1.5rem' }}>Under the Hood</div>
          <div
            ref={cardsRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}
          >
            {DETAIL_CARDS.map((card) => (
              <div
                key={card.id}
                id={card.id}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
                className="detail-card solid-panel mouse-spotlight"
                style={{
                  opacity: 0,
                  padding: '2.25rem 2rem',
                  borderRadius: '14px',
                  background: '#060b16',
                  border: '1px solid rgba(45,212,191,0.12)',
                  willChange: 'transform, opacity',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)' }} />
                <div style={{ fontSize: '1.5rem', color: '#2dd4bf', marginBottom: '1rem', opacity: 0.8 }}>{card.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: '#2dd4bf', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {card.label}
                </div>
                <p style={{ fontSize: '0.92rem', color: 'rgba(226,234,244,0.65)', lineHeight: 1.7 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
