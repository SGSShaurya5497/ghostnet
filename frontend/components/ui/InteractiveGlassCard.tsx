'use client';

import React, { useRef, useState, MouseEvent } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid';
  tilt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function InteractiveGlassCard({
  children,
  variant = 'solid',
  tilt = true,
  className = '',
  style = {},
  onClick,
  ...rest
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update CSS variables for radial spotlight follower
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;
      setTransform(`perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
    }
  };

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 700);

    if (onClick) onClick(e);
  };

  const baseClass = variant === 'glass' ? 'ultra-glass' : 'solid-panel';

  return (
    <div
      ref={cardRef}
      className={`${baseClass} mouse-spotlight ripple-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform,
        transition: 'transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.25s ease, background 0.25s ease',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {/* Click ripple elements */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-wave"
          style={{
            left: `${r.x - 30}px`,
            top: `${r.y - 30}px`,
            width: '60px',
            height: '60px',
          }}
        />
      ))}
      {children}
    </div>
  );
}
