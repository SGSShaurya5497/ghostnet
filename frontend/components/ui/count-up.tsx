'use client';

import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef } from 'react';

// ============================================================
// CountUp — React Bits TextAnimations/CountUp (verbatim port)
// Uses motion/react (framer-motion) — already a project dep
// ============================================================

interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  suffix?: string;
  decimals?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  suffix = '',
  decimals = 0,
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });

  const isInView = useInView(ref, { once: true, margin: '0px' });

  function getDecimalPlaces(num: number): number {
    const str = num.toString();
    if (str.includes('.')) {
      return str.split('.')[1].length;
    }
    return 0;
  }

  function formatNum(num: number): string {
    const dp = decimals !== undefined ? decimals : Math.max(getDecimalPlaces(from), getDecimalPlaces(to));
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    };
    if (separator) {
      options.useGrouping = true;
    }
    const formatted = new Intl.NumberFormat('en-US', options).format(Number(num.toFixed(dp)));
    return formatted + suffix;
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatNum(direction === 'down' ? to : from);
    }
  }, []);

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === 'function') onStart();
      const timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatNum(latest);
      }
      if (
        (direction === 'up' && latest >= to) ||
        (direction === 'down' && latest <= to)
      ) {
        if (typeof onEnd === 'function') onEnd();
      }
    });
    return () => unsubscribe();
  }, [springValue, direction, to, separator, suffix, decimals]);

  return <span ref={ref} className={className} />;
}
