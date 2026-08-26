'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;
    if (isTouch) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setCoords({ x: Math.round(e.clientX), y: Math.round(e.clientY) });

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if hovering over clickable/interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.interactive-hover') ||
          target.closest('.solid-panel') ||
          target.closest('.ultra-glass'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Smooth lerp for ring follower
    let animId: number;
    const updateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      animId = requestAnimationFrame(updateRing);
    };
    updateRing();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Center Reticle Dot */}
      <div
        ref={cursorDotRef}
        style={{
          position: 'fixed',
          top: '-3px',
          left: '-3px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#2dd4bf',
          boxShadow: '0 0 10px #2dd4bf, 0 0 20px rgba(45, 212, 191, 0.8)',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate3d(-100px, -100px, 0)',
          transition: 'width 0.2s, height 0.2s, background-color 0.2s',
          willChange: 'transform',
        }}
      />

      {/* Outer Sonar Ring Target */}
      <div
        ref={cursorRingRef}
        style={{
          position: 'fixed',
          top: isHovered ? '-24px' : '-16px',
          left: isHovered ? '-24px' : '-16px',
          width: isHovered ? '48px' : '32px',
          height: isHovered ? '48px' : '32px',
          borderRadius: '50%',
          border: isHovered
            ? '1.5px solid rgba(45, 212, 191, 0.85)'
            : '1px solid rgba(45, 212, 191, 0.35)',
          backgroundColor: isHovered ? 'rgba(45, 212, 191, 0.08)' : 'transparent',
          boxShadow: isHovered ? '0 0 20px rgba(45, 212, 191, 0.35)' : 'none',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate3d(-100px, -100px, 0)',
          transformOrigin: 'center center',
          scale: isClicked ? '0.85' : '1',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1), left 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, background-color 0.2s, scale 0.15s',
          willChange: 'transform',
        }}
      />
    </>
  );
}
