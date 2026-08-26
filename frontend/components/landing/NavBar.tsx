'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: '16px',
        left: '0',
        right: '0',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 clamp(1rem, 3vw, 2rem)',
        pointerEvents: 'none',
      }}
    >
      <nav
        className={`glass-panel ${scrolled ? 'glass-panel--strong' : ''}`}
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1.2rem, 3vw, 2.2rem)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          pointerEvents: 'auto',
        }}
      >
        {/* Brand Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1.5px solid #2dd4bf',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(45, 212, 191, 0.5)',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#2dd4bf',
              }}
            />
          </div>
          <span>
            Ghost<span style={{ color: '#2dd4bf' }}>Net</span>
          </span>
        </Link>

        {/* Section Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.2rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {[
            { label: 'Problem', href: '#problem' },
            { label: 'Pipeline', href: '#solution' },
            { label: 'Architecture', href: '#impact' },
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'rgba(226, 234, 244, 0.75)',
                textDecoration: 'none',
                letterSpacing: '0.03em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2dd4bf';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(226, 234, 244, 0.75)';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Button */}
        <Link
          href="/dashboard"
          className="glass-button"
          style={{
            fontSize: '0.76rem',
            padding: '8px 20px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#2dd4bf',
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
