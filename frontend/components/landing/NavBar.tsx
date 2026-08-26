'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    navRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    navRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const navLinks = [
    { label: 'Problem', href: '#problem' },
    { label: 'Pipeline', href: '#solution' },
    { label: 'Architecture', href: '#impact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: '18px',
        left: '0',
        right: '0',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 clamp(1rem, 3vw, 2.5rem)',
        pointerEvents: 'none',
      }}
    >
      <nav
        ref={navRef}
        onMouseMove={handleMouseMove}
        className={`ultra-glass mouse-spotlight ${scrolled ? 'glass-panel--strong' : ''}`}
        style={{
          width: '100%',
          maxWidth: '1140px',
          height: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1.4rem, 3vw, 2.4rem)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          pointerEvents: 'auto',
          borderRadius: '100px',
        }}
      >
        {/* Brand Wordmark with Sonar Core */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1.5px solid #2dd4bf',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(45, 212, 191, 0.6)',
            }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#2dd4bf',
                boxShadow: '0 0 8px #2dd4bf',
              }}
            />
          </div>
          <span>
            Ghost<span style={{ color: '#2dd4bf' }}>Net</span>
          </span>
        </Link>

        {/* Section Links with Interactive Pill Hover */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            zIndex: 2,
            background: 'rgba(2, 6, 14, 0.4)',
            padding: '4px 6px',
            borderRadius: '100px',
            border: '1px solid rgba(45, 212, 191, 0.1)',
          }}
        >
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: hoveredIdx === idx ? '#ffffff' : 'rgba(226, 234, 244, 0.7)',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                padding: '6px 16px',
                borderRadius: '100px',
                background: hoveredIdx === idx ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                transition: 'all 0.22s ease',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action: Enter Dashboard (Ultra Glass Button) */}
        <Link
          href="/dashboard"
          className="ultra-glass-btn"
          style={{
            fontSize: '0.78rem',
            padding: '9px 22px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            zIndex: 2,
          }}
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
