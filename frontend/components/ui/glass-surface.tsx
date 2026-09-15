'use client';

import React, { useEffect, useRef, useState, useId } from 'react';

// ============================================================
// GlassSurface — React Bits Components/GlassSurface
// Real SVG displacement filter glass refraction — not flat blur
// ============================================================

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  className?: string;
  style?: React.CSSProperties;
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = '100%',
  height = '100%',
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  distortionScale = -120,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  className = '',
  style = {},
}) => {
  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');

  const updateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 300;
    const actualHeight = rect?.height || 150;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect width="${actualWidth}" height="${actualHeight}" fill="black"/>
        <rect width="${actualWidth}" height="${actualHeight}" fill="url(#${redGradId})" opacity="0.5"/>
        <rect width="${actualWidth}" height="${actualHeight}" fill="url(#${blueGradId})" opacity="0.5"/>
        <rect x="0" y="0" width="${edgeSize}" height="${actualHeight}" fill="red" opacity="0.7"/>
        <rect x="${actualWidth - edgeSize}" y="0" width="${edgeSize}" height="${actualHeight}" fill="red" opacity="0.4"/>
        <rect x="0" y="0" width="${actualWidth}" height="${edgeSize}" fill="blue" opacity="0.7"/>
        <rect x="0" y="${actualHeight - edgeSize}" width="${actualWidth}" height="${edgeSize}" fill="blue" opacity="0.4"/>
      </svg>`;

    const encoded = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
    setSvgDataUrl(encoded);
  };

  useEffect(() => {
    updateDisplacementMap();
    const ro = new ResizeObserver(updateDisplacementMap);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [borderWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    >
      {/* SVG Filter Definition */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feImage
              ref={feImageRef}
              href={svgDataUrl}
              result="displacementMap"
              preserveAspectRatio="xMidYMid slice"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={distortionScale}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="redChannel"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={distortionScale + redOffset + greenOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="greenChannel"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="displacementMap"
              scale={distortionScale + redOffset + blueOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
              result="blueChannel"
            />
            <feMerge>
              <feMergeNode in="redChannel" />
              <feMergeNode in="greenChannel" />
              <feMergeNode in="blueChannel" />
            </feMerge>
            <feGaussianBlur ref={null} stdDeviation={blur * 0.15} />
            <feComponentTransfer>
              <feFuncA type="linear" slope={opacity} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Glass refraction layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          backdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
          WebkitBackdropFilter: `blur(${blur}px) brightness(${brightness}%)`,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
