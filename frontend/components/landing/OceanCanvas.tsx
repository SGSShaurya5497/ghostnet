'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Shared scroll progress & velocity refs (updated by SmoothScrollProvider / Lenis)
export const scrollProgressRef = { current: 0 };
export const scrollVelocityRef = { current: 0 };
export const mouseRef = { x: 0, y: 0, targetX: 0, targetY: 0 };

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

// ─── 1. INTERACTIVE LIDAR SEAFLOOR POINT CLOUD (DARKROOM STYLE) ───────────────
// 30,000+ points forming an organic bathymetric ocean floor with acoustic wave pulses & mouse interaction
function LidarSeafloor() {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, count } = useMemo(() => {
    const width = 36;
    const depth = 36;
    const segmentsX = isMobile ? 100 : 160;
    const segmentsZ = isMobile ? 100 : 160;
    const totalPoints = segmentsX * segmentsZ;

    const positions = new Float32Array(totalPoints * 3);
    const uvs = new Float32Array(totalPoints * 2);
    const randomOffsets = new Float32Array(totalPoints);

    let idx = 0;
    for (let i = 0; i < segmentsX; i++) {
      for (let j = 0; j < segmentsZ; j++) {
        const u = i / (segmentsX - 1);
        const v = j / (segmentsZ - 1);

        const x = (u - 0.5) * width;
        const z = (v - 0.5) * depth;
        const y = 0;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        uvs[idx * 2] = u;
        uvs[idx * 2 + 1] = v;

        randomOffsets[idx] = Math.random();
        idx++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randomOffsets, 1));

    return { geometry: geo, count: totalPoints };
  }, []);

  const customShader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uVelocity: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorBase: { value: new THREE.Color('#0d3b42') },
        uColorAccent: { value: new THREE.Color('#2dd4bf') },
        uColorHighlight: { value: new THREE.Color('#7ff4e8') },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform float uVelocity;
        uniform vec2 uMouse;
        attribute float aRandom;
        varying vec3 vPosition;
        varying float vElevation;
        varying float vDistToMouse;
        varying float vScanWave;

        // Simplex / Sine wave noise combination
        float getElevation(vec2 p) {
          float elev = sin(p.x * 0.25 + uTime * 0.2) * cos(p.y * 0.25 + uTime * 0.15) * 1.2;
          elev += sin(p.x * 0.55 - uTime * 0.1) * sin(p.y * 0.45 + uTime * 0.12) * 0.6;
          elev += sin(p.x * 1.2 + p.y * 0.9) * 0.25;
          return elev;
        }

        void main() {
          vec3 pos = position;
          
          // Organic seafloor elevation
          float elev = getElevation(pos.xz);
          pos.y = elev - 2.8;

          // Interactive mouse displacement
          float distToMouse = length(pos.xz - uMouse * 14.0);
          float mouseWave = sin(distToMouse * 1.5 - uTime * 3.0) * exp(-distToMouse * 0.25) * 0.6;
          pos.y += mouseWave;

          // Sonar acoustic wave propagation from center
          float distToCenter = length(pos.xz);
          float scanWave = sin(distToCenter * 0.8 - uTime * 2.5 - uScroll * 10.0);
          float scanGlow = smoothstep(0.85, 1.0, scanWave);

          // Dynamic velocity warp
          pos.y -= abs(uVelocity) * 0.04 * (sin(distToCenter * 2.0));

          vPosition = pos;
          vElevation = elev;
          vDistToMouse = distToMouse;
          vScanWave = scanGlow;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          // Size attenuation with velocity stretch
          float pointSize = (3.2 + scanGlow * 3.5 + smoothstep(4.0, 0.0, distToMouse) * 4.0);
          pointSize *= (1.0 + abs(uVelocity) * 0.06);
          gl_PointSize = pointSize * (45.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorBase;
        uniform vec3 uColorAccent;
        uniform vec3 uColorHighlight;
        varying vec3 vPosition;
        varying float vElevation;
        varying float vDistToMouse;
        varying float vScanWave;

        void main() {
          // Circular point shape with soft edge
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          float alpha = smoothstep(0.5, 0.05, dist);

          // Color blending based on depth elevation and sonar scan waves
          vec3 col = mix(uColorBase, uColorAccent, smoothstep(-1.5, 1.5, vElevation));
          
          // Add scan wave highlight
          col = mix(col, uColorHighlight, vScanWave * 0.85);

          // Add mouse proximity glow
          float mouseGlow = smoothstep(4.5, 0.0, vDistToMouse);
          col = mix(col, vec3(1.0), mouseGlow * 0.6);

          gl_FragColor = vec4(col, alpha * (0.45 + vScanWave * 0.45 + mouseGlow * 0.4));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    []
  );

  useFrame((state) => {
    if (!shaderMatRef.current) return;
    const t = state.clock.elapsedTime;
    const sp = scrollProgressRef.current;
    const vel = scrollVelocityRef.current;

    shaderMatRef.current.uniforms.uTime.value = t;
    shaderMatRef.current.uniforms.uScroll.value = sp;
    shaderMatRef.current.uniforms.uVelocity.value = vel;
    shaderMatRef.current.uniforms.uMouse.value.set(mouseRef.x, mouseRef.y);

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.02 + sp * 0.4;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial ref={shaderMatRef} attach="material" args={[customShader]} />
    </points>
  );
}

// ─── 2. VELOCITY-REACTIVE MARINE SNOW & CURRENT PARTICLES ─────────────────────
function VelocityParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMobile ? 350 : 800;

  const { positions, velocities, scales } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const sc = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = Math.random() * 0.002 + 0.0005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      sc[i] = 0.03 + Math.random() * 0.05;
    }

    return { positions: pos, velocities: vel, scales: sc };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const vel = scrollVelocityRef.current;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Scroll velocity causes downward/upward warp streak
      arr[idx] += velocities[idx] * delta * 60;
      arr[idx + 1] += (velocities[idx + 1] - vel * 0.004) * delta * 60;
      arr[idx + 2] += velocities[idx + 2] * delta * 60;

      // Wrap around bounds
      if (arr[idx + 1] > 11) arr[idx + 1] = -11;
      if (arr[idx + 1] < -11) arr[idx + 1] = 11;
      if (arr[idx] > 14) arr[idx] = -14;
      if (arr[idx] < -14) arr[idx] = 14;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#5eead4"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── 3. VOLUMETRIC CAUSTIC LIGHT SHAFTS ───────────────────────────────────────
function VolumetricCausticBeams() {
  const groupRef = useRef<THREE.Group>(null);
  const matsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  const beams = useMemo(
    () =>
      Array.from({ length: isMobile ? 4 : 8 }, (_, i) => ({
        x: (i - 3.5) * 3.6 + (Math.random() - 0.5) * 1.5,
        z: -6 - Math.random() * 4,
        rotZ: -0.2 + (Math.random() - 0.5) * 0.15,
        width: 1.2 + Math.random() * 2.2,
        height: 36,
        baseOpacity: 0.035 + Math.random() * 0.045,
        speed: 0.25 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    matsRef.current.forEach((mat, i) => {
      if (!mat || !beams[i]) return;
      const b = beams[i];
      mat.opacity = b.baseOpacity * (0.5 + 0.5 * Math.sin(t * b.speed + b.phase));
    });

    if (groupRef.current) {
      groupRef.current.position.x = mouseRef.x * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      {beams.map((b, i) => (
        <mesh key={i} position={[b.x, 6, b.z]} rotation={[0, 0, b.rotZ]}>
          <planeGeometry args={[b.width, b.height]} />
          <meshBasicMaterial
            ref={(el) => {
              if (el) matsRef.current[i] = el;
            }}
            color="#2dd4bf"
            transparent
            opacity={b.baseOpacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── 4. INTERACTIVE KINETIC CAMERA (LENIS VELOCITY + MOUSE DAMPING) ───────────
function KineticCamera() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 1.2, 7.5));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const sp = scrollProgressRef.current;
    const vel = scrollVelocityRef.current;

    // Smooth mouse interpolation
    mouseRef.x += (mouseRef.targetX - mouseRef.x) * 0.05;
    mouseRef.y += (mouseRef.targetY - mouseRef.y) * 0.05;

    // Narrative camera coordinate path
    const targetX = mouseRef.x * 1.5 + Math.sin(sp * Math.PI * 1.5) * 1.0;
    const targetY = 1.2 - sp * 3.4 + mouseRef.y * 0.8 - Math.min(1.5, Math.abs(vel) * 0.04);
    const targetZ = 7.5 - sp * 2.8 - Math.min(2.0, Math.abs(vel) * 0.06);

    const targetLook = new THREE.Vector3(
      mouseRef.x * 0.8,
      -sp * 1.5,
      0
    );

    currentPos.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
    currentLookAt.current.lerp(targetLook, 0.05);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

// ─── 5. GLOBAL MOUSE EVENT LISTENER ───────────────────────────────────────────
function MouseTracker() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return null;
}

// ─── MAIN 3D OCEAN CANVAS ─────────────────────────────────────────────────────
export default function OceanCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 50% 10%, #041220 0%, #020912 40%, #01050a 75%, #000206 100%)',
      }}
    >
      <MouseTracker />
      <Canvas
        camera={{ position: [0, 1.2, 7.5], fov: 50, near: 0.1, far: 90 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.75)}
      >
        <KineticCamera />
        <VolumetricCausticBeams />
        <LidarSeafloor />
        <VelocityParticles />
      </Canvas>
    </div>
  );
}
