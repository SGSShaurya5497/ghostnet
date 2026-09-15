'use client';

import React, { useRef, useEffect, type CSSProperties } from 'react';

// ============================================================
// Perlin Noise implementation (React Bits Waves — verbatim)
// ============================================================
class Grad {
  x: number; y: number; z: number;
  constructor(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
  dot2(x: number, y: number): number { return this.x * x + this.y * y; }
}

class Noise {
  grad3: Grad[];
  p: number[];
  perm: number[];
  gradP: Grad[];
  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
      new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
      new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)
    ];
    this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm = new Array(512);
    this.gradP = new Array(512);
    this.seed(seed);
  }
  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }
  fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b; }
  perlin2(x: number, y: number): number {
    let X = Math.floor(x), Y = Math.floor(y);
    x -= X; y -= Y; X &= 255; Y &= 255;
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);
    const u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  }
}

interface WavesProps {
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  xGap?: number;
  yGap?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  style?: CSSProperties;
  className?: string;
}

export default function Waves({
  lineColor = 'rgba(45, 212, 191, 0.18)',
  backgroundColor = '#050B14',
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 36,
  waveAmpY = 14,
  xGap = 18,
  yGap = 36,
  friction = 0.925,
  tension = 0.008,
  maxCursorMove = 100,
  style = {},
  className = '',
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false });
  const noiseRef = useRef(new Noise(Math.random()));
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    const lines: { x: number; y: number; wave: { x: number; y: number }; cursor: { x: number; y: number; vx: number; vy: number } }[] = [];

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      buildLines();
    }

    function buildLines() {
      lines.length = 0;
      const cols = Math.ceil(W / xGap) + 2;
      const rows = Math.ceil(H / yGap) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          lines.push({
            x: c * xGap - xGap,
            y: r * yGap - yGap,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }
      }
    }

    function movePoints(t: number) {
      const mouse = mouseRef.current;
      const noise = noiseRef.current;
      lines.forEach(p => {
        const wox = noise.perlin2(p.x * 0.002 + t * waveSpeedX, p.y * 0.0015) * waveAmpX * 2;
        const woy = noise.perlin2(p.x * 0.002 - t * waveSpeedX, p.y * 0.0015 + t * waveSpeedY) * waveAmpY * 2;
        p.wave.x = wox; p.wave.y = woy;

        if (mouse.set) {
          const dx = mouse.sx - p.x, dy = mouse.sy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const l = Math.max(175, mouse.vs);
          if (dist < l) {
            const s = (1 - dist / l) * maxCursorMove;
            p.cursor.vx += (dx / dist) * s;
            p.cursor.vy += (dy / dist) * s;
          }
        }
        p.cursor.vx += (0 - p.cursor.x) * tension;
        p.cursor.vy += (0 - p.cursor.y) * tension;
        p.cursor.vx *= friction;
        p.cursor.vy *= friction;
        p.cursor.x += p.cursor.vx;
        p.cursor.y += p.cursor.vy;
      });
    }

    function drawLines() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      const cols = Math.ceil(W / xGap) + 2;
      lines.forEach((p, i) => {
        const x = p.x + p.wave.x + p.cursor.x;
        const y = p.y + p.wave.y + p.cursor.y;
        if (i % cols === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    function tick() {
      timeRef.current += 0.5;
      const mouse = mouseRef.current;
      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;
      const dx = mouse.x - mouse.lx, dy = mouse.y - mouse.ly;
      mouse.v = Math.sqrt(dx * dx + dy * dy);
      mouse.vs += (mouse.v - mouse.vs) * 0.1;
      mouse.lx = mouse.x; mouse.ly = mouse.y;
      movePoints(timeRef.current);
      drawLines();
      frameRef.current = requestAnimationFrame(tick);
    }

    function onMouseMove(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect();
      const mouse = mouseRef.current;
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.set = true;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener('mousemove', onMouseMove);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [lineColor, backgroundColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, xGap, yGap, friction, tension, maxCursorMove]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={style}
    />
  );
}
