'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export type SoundEffectType =
  | 'sonarPing'
  | 'sonarDeep'
  | 'detection'
  | 'criticalThreat'
  | 'click'
  | 'toggle'
  | 'scan'
  | 'success'
  | 'error';

interface SoundContextType {
  playSound: (type: SoundEffectType, overrideVolume?: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (vol: number) => void;
  ambientActive: boolean;
  toggleAmbient: () => void;
  isPlayingSound: boolean;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.4);
  const [ambientActive, setAmbientActive] = useState<boolean>(false);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activePlayingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or restore preferences from localStorage
  useEffect(() => {
    try {
      const savedMute = localStorage.getItem('ghostnet_sound_muted');
      if (savedMute !== null) {
        setIsMuted(savedMute === 'true');
      }
      const savedVol = localStorage.getItem('ghostnet_sound_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolumeState(parsed);
        }
      }
      const savedAmbient = localStorage.getItem('ghostnet_ambient_sonar');
      if (savedAmbient !== null) {
        setAmbientActive(savedAmbient === 'true');
      }
    } catch {
      // Ignore localStorage errors in restricted contexts
    }
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Set volume with storage
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    try {
      localStorage.setItem('ghostnet_sound_volume', clamped.toString());
    } catch {}
  }, []);

  // Toggle mute with storage
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ghostnet_sound_muted', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  }, []);

  // Toggle ambient pulse
  const toggleAmbient = useCallback(() => {
    setAmbientActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ghostnet_ambient_sonar', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  }, []);

  const triggerVisualPlaying = useCallback(() => {
    setIsPlayingSound(true);
    if (activePlayingTimeoutRef.current) {
      clearTimeout(activePlayingTimeoutRef.current);
    }
    activePlayingTimeoutRef.current = setTimeout(() => {
      setIsPlayingSound(false);
    }, 450);
  }, []);

  /**
   * Sound Synthesizer Engine
   * Generates rich, authentic acoustic & tactical UI sounds
   */
  const playSound = useCallback((type: SoundEffectType, overrideVolume?: number) => {
    if (isMuted && type !== 'click') return; // If muted, skip unless unmuting
    if (isMuted) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    triggerVisualPlaying();

    const masterGain = ctx.createGain();
    const targetVol = (overrideVolume ?? volume);
    masterGain.gain.setValueAtTime(targetVol, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      // ── 1. ACTIVE SONAR PING (Subsea Acoustic Transducer Pulse) ──
      case 'sonarPing': {
        // Primary sweeping acoustic pulse
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        // Pitch drop characteristic of acoustic cavitation & water compression
        osc1.frequency.setValueAtTime(1420, now);
        osc1.frequency.exponentialRampToValueAtTime(1020, now + 0.08);
        osc1.frequency.setValueAtTime(1020, now + 0.08);

        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.7, now + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        // Metallic harmonic strike (higher overtones for high-res transducer)
        const oscHarmonic = ctx.createOscillator();
        const gainHarmonic = ctx.createGain();
        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(2840, now);
        oscHarmonic.frequency.exponentialRampToValueAtTime(2040, now + 0.06);

        gainHarmonic.gain.setValueAtTime(0, now);
        gainHarmonic.gain.linearRampToValueAtTime(0.25, now + 0.01);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        // Subsea reverberant delayed echo
        const echoGain = ctx.createGain();
        const delay = ctx.createDelay();
        delay.delayTime.setValueAtTime(0.24, now);
        echoGain.gain.setValueAtTime(0, now);
        echoGain.gain.setValueAtTime(0.35, now + 0.24);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        // Filter for underwater attenuation
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(3, now);

        osc1.connect(gain1);
        gain1.connect(filter);

        oscHarmonic.connect(gainHarmonic);
        gainHarmonic.connect(filter);

        filter.connect(masterGain);
        filter.connect(delay);
        delay.connect(echoGain);
        echoGain.connect(masterGain);

        osc1.start(now);
        oscHarmonic.start(now);
        osc1.stop(now + 1.7);
        oscHarmonic.stop(now + 0.35);
        break;
      }

      // ── 2. DEEP SUBMARINE SONAR PING ──
      case 'sonarDeep': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.9, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.Q.setValueAtTime(6, now);

        osc.connect(gain);
        gain.connect(filter);
        filter.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.3);
        break;
      }

      // ── 3. TARGET DETECTION CONFIRMED CHIRP (Dual Tactical Blip) ──
      case 'detection': {
        const oscA = ctx.createOscillator();
        const gainA = ctx.createGain();
        oscA.type = 'sine';
        oscA.frequency.setValueAtTime(880, now); // A5

        gainA.gain.setValueAtTime(0, now);
        gainA.gain.linearRampToValueAtTime(0.6, now + 0.01);
        gainA.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        const oscB = ctx.createOscillator();
        const gainB = ctx.createGain();
        oscB.type = 'sine';
        oscB.frequency.setValueAtTime(1320, now + 0.09); // E6

        gainB.gain.setValueAtTime(0, now);
        gainB.gain.setValueAtTime(0, now + 0.08);
        gainB.gain.linearRampToValueAtTime(0.7, now + 0.10);
        gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        oscA.connect(gainA);
        gainA.connect(masterGain);
        oscB.connect(gainB);
        gainB.connect(masterGain);

        oscA.start(now);
        oscA.stop(now + 0.1);
        oscB.start(now + 0.08);
        oscB.stop(now + 0.35);
        break;
      }

      // ── 4. CRITICAL THREAT ALARM ──
      case 'criticalThreat': {
        const freqPattern = [880, 1100, 880, 1100];
        freqPattern.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.08;
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, startTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2400, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.07);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.075);
        });
        break;
      }

      // ── 5. TACTICAL MECHANICAL UI CLICK ──
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2100, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      // ── 6. DUAL SWITCH TOGGLE ──
      case 'toggle': {
        [0, 0.035].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 1600 : 2200, now + offset);

          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(0.22, now + offset + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + offset);
          osc.stop(now + offset + 0.035);
        });
        break;
      }

      // ── 7. RADAR / WATERFALL SWEEP ──
      case 'scan': {
        const bufferSize = ctx.sampleRate * 0.45;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.45);
        filter.Q.setValueAtTime(5, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
        noise.stop(now + 0.46);
        break;
      }

      // ── 8. SUCCESS HARMONIC CHIME ──
      case 'success': {
        const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        chord.forEach((note, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.065;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.7);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(noteTime);
          osc.stop(noteTime + 0.75);
        });
        break;
      }

      // ── 9. LOW DISSONANT ERROR BUZZ ──
      case 'error': {
        [160, 215].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(550, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.26);
        });
        break;
      }
    }
  }, [getAudioContext, isMuted, volume, triggerVisualPlaying]);

  // Ambient Sonar Ping loop (periodic low ping)
  useEffect(() => {
    if (!ambientActive || isMuted) {
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current);
        ambientIntervalRef.current = null;
      }
      return;
    }

    // Play once gently on activate
    playSound('sonarDeep', volume * 0.4);

    ambientIntervalRef.current = setInterval(() => {
      playSound('sonarDeep', volume * 0.35);
    }, 18000); // Every 18s

    return () => {
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current);
        ambientIntervalRef.current = null;
      }
    };
  }, [ambientActive, isMuted, playSound, volume]);

  return (
    <SoundContext.Provider
      value={{
        playSound,
        isMuted,
        toggleMute,
        volume,
        setVolume,
        ambientActive,
        toggleAmbient,
        isPlayingSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useTacticalAudio() {
  const context = useContext(SoundContext);
  if (!context) {
    return {
      playSound: () => {},
      isMuted: true,
      toggleMute: () => {},
      volume: 0.4,
      setVolume: () => {},
      ambientActive: false,
      toggleAmbient: () => {},
      isPlayingSound: false,
    };
  }
  return context;
}
