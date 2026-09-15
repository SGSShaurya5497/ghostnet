'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  glowColor?: string;
  tilt?: boolean;
}

const springConfig = { damping: 25, stiffness: 120, mass: 1.5 };

export default function GlassCard({
  children,
  className = '',
  hoverGlow = true,
  glowColor = 'rgba(255,76,0,0.2)',
  tilt = false,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, show: false });
  const [tiltValues, setTiltValues] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSpot({ x, y, show: true });

    if (tilt) {
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      setTiltValues({
        rx: -((y - cy) / cy) * 6,
        ry: ((x - cx) / cx) * 6,
      });
    }
  }, [tilt]);

  const handleMouseLeave = useCallback(() => {
    setSpot(s => ({ ...s, show: false }));
    setTiltValues({ rx: 0, ry: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={tilt ? { rotateX: tiltValues.rx, rotateY: tiltValues.ry } : {}}
      transition={springConfig}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/[0.04] backdrop-blur-xl
        border border-white/10
        transition-all duration-300
        hover:border-white/20 hover:bg-white/[0.07]
        ${hoverGlow ? 'hover:shadow-2xl' : ''}
        ${tilt ? 'perspective-[800px]' : ''}
        ${className}
      `}
      style={tilt ? { transformStyle: 'preserve-3d' } : {}}
    >
      {/* Spotlight glow */}
      {hoverGlow && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
          style={{
            opacity: spot.show ? 1 : 0,
            background: `radial-gradient(350px circle at ${spot.x}px ${spot.y}px, ${glowColor}, transparent 65%)`,
          }}
        />
      )}

      {/* Top edge shimmer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {children}
    </motion.div>
  );
}
