'use client';

import React, { useRef, useState, MouseEvent } from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  magneticStrength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function MagneticButton({
  children,
  magneticStrength = 0.35,
  className = '',
  style = {},
  onClick,
  ...rest
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 700);

    if (onClick) onClick(e);
  };

  return (
    <button
      ref={btnRef}
      className={`ultra-glass-btn ripple-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: `translate3d(${position.x.toFixed(1)}px, ${position.y.toFixed(1)}px, 0)`,
        transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease' : 'transform 0.1s linear',
        ...style,
      }}
      {...rest}
    >
      {/* Click ripple shockwave */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-wave"
          style={{
            left: `${r.x - 25}px`,
            top: `${r.y - 25}px`,
            width: '50px',
            height: '50px',
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </button>
  );
}
