'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame, useTransform } from 'motion/react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#FF4C00', '#FF7A00', '#FBBF24', '#FF4C00'],
  animationSpeed = 6,
}: GradientTextProps) {
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    progress.set((time / 1000 / animationSpeed) % 1);
  });

  const background = useTransform(
    progress,
    [0, 1],
    [
      `linear-gradient(90deg, ${colors.join(', ')})`,
      `linear-gradient(90deg, ${[...colors].reverse().join(', ')})`,
    ]
  );

  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{ backgroundImage: background, backgroundSize: '200% auto' }}
    >
      {children}
    </motion.span>
  );
}
