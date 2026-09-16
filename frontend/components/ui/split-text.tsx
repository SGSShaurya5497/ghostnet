'use client';

import { motion, useInView } from 'motion/react';
import { useRef, useMemo } from 'react';

// ============================================================
// SplitText — character-level staggered reveal animation
// Uses motion/react (framer-motion) — no GSAP paid plugins
// Behaviour matches React Bits SplitText intent: chars/words
// animate in from below with stagger on scroll-into-view
// ============================================================

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: any;
  splitType?: 'chars' | 'words';
  color?: string;
  once?: boolean;
}

export default function SplitText({
  text,
  className = '',
  delay = 0,
  duration = 0.65,
  ease = 'easeOut',
  splitType = 'chars',
  color,
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px' });

  const tokens = useMemo(() => {
    if (splitType === 'words') {
      return text.split(' ').map((w, i) => ({ text: w + ' ', i }));
    }
    return text.split('').map((c, i) => ({ text: c, i }));
  }, [text, splitType]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      style={{ display: 'inline-block', color }}
    >
      {tokens.map(({ text: char, i }) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(6px)' }}
          transition={{
            duration,
            delay: delay + i * (splitType === 'chars' ? 0.025 : 0.06),
            ease,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}
