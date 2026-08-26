'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MarqueeProps {
  items?: string[];
  direction?: 'left' | 'right';
  speed?: number;
}

const DEFAULT_ITEMS = [
  '48°14\'22.4"N 124°42\'18.1"W',
  'YOLO-SEG ONNX EDGE RUNTIME',
  '455 kHz MULTI-BEAM SONAR',
  'AUTONOMOUS DRONE BATHYMETRY',
  'ZERO CLOUD DEPENDENCY',
  'REAL-TIME GEOTAGGED HAZARD MAP',
  'INSTANT PIXEL-LEVEL SEGMENTATION',
  'DEEP OCEAN RESTORATION',
];

export default function SonarMarquee({
  items = DEFAULT_ITEMS,
  direction = 'left',
  speed = 35,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const totalWidth = track.scrollWidth / 2;

    const tween = gsap.to(track, {
      x: direction === 'left' ? -totalWidth : totalWidth,
      duration: speed,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [direction, speed]);

  const displayList = [...items, ...items, ...items, ...items];

  return (
    <div
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
        padding: '0.85rem 0',
        borderTop: '1px solid rgba(45, 212, 191, 0.12)',
        borderBottom: '1px solid rgba(45, 212, 191, 0.12)',
        background: 'rgba(2, 6, 14, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        zIndex: 5,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: 'inline-flex',
          gap: '3rem',
          willChange: 'transform',
        }}
      >
        {displayList.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: idx % 2 === 0 ? '#2dd4bf' : 'rgba(226, 234, 244, 0.45)',
            }}
          >
            <span>{item}</span>
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#2dd4bf',
                opacity: 0.6,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
