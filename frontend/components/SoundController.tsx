'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Radio, Sliders, Play, Sparkles, AlertCircle, Waves, Check } from 'lucide-react';
import { useTacticalAudio, SoundEffectType } from '@/lib/sound-context';

export default function SoundController({ compact = false }: { compact?: boolean }) {
  const {
    playSound,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    ambientActive,
    toggleAmbient,
    isPlayingSound,
  } = useTacticalAudio();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const soundTests: { label: string; type: SoundEffectType; icon: React.ReactNode; desc: string }[] = [
    { label: 'Active Sonar Ping', type: 'sonarPing', icon: <Radio className="w-3 h-3 text-teal-400" />, desc: '1420Hz transducer pulse' },
    { label: 'Deep Subsea Echo', type: 'sonarDeep', icon: <Waves className="w-3 h-3 text-cyan-400" />, desc: 'Sub-bass 220Hz pulse' },
    { label: 'Target Lock Chirp', type: 'detection', icon: <Sparkles className="w-3 h-3 text-emerald-400" />, desc: '880Hz-1320Hz dual blip' },
    { label: 'Critical Threat Alert', type: 'criticalThreat', icon: <AlertCircle className="w-3 h-3 text-rose-400" />, desc: 'Pulsed tactical alarm' },
    { label: 'Acoustic Waterfall Sweep', type: 'scan', icon: <Sliders className="w-3 h-3 text-amber-400" />, desc: 'Bandpassed hydro-sweep' },
    { label: 'Mission Verified', type: 'success', icon: <Check className="w-3 h-3 text-teal-300" />, desc: 'Harmonic 4-tone chime' },
  ];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-900/90 border border-white/[0.08] hover:border-teal-500/40 backdrop-blur-xl shadow-lg transition-all group">
        {/* Mute/Unmute Quick Toggle */}
        <button
          onClick={() => {
            if (isMuted) {
              toggleMute();
              // Short delay to let state update then play confirmation
              setTimeout(() => playSound('sonarPing'), 50);
            } else {
              toggleMute();
            }
          }}
          className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
            isMuted
              ? 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
              : 'text-teal-400 bg-teal-500/10 shadow-[0_0_10px_rgba(45,212,191,0.25)] hover:bg-teal-500/20'
          }`}
          title={isMuted ? 'Acoustic Audio: Muted (Click to Unmute)' : 'Acoustic Audio: Active (Click to Mute)'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          ) : volume > 0.5 ? (
            <Volume2 className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          ) : (
            <Volume1 className="w-3.5 h-3.5 text-teal-400" />
          )}
        </button>

        {/* Dynamic Waveform Visualizer */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-white/[0.06] transition-all cursor-pointer"
          title="Acoustic Audio System Settings"
        >
          <div className="flex items-center gap-0.5 h-3.5 px-0.5">
            {[0.4, 0.9, 0.6, 1.0, 0.5].map((scale, i) => (
              <span
                key={i}
                className={`w-0.5 rounded-full transition-all duration-150 ${
                  isMuted
                    ? 'h-1 bg-slate-700'
                    : isPlayingSound
                    ? 'bg-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.8)]'
                    : 'bg-teal-500/50'
                }`}
                style={{
                  height: isMuted
                    ? '3px'
                    : isPlayingSound
                    ? `${Math.max(4, 14 * scale)}px`
                    : `${Math.max(3, 8 * scale)}px`,
                }}
              />
            ))}
          </div>

          {!compact && (
            <span className="text-[10px] font-mono tracking-wider text-slate-300 group-hover:text-teal-300 uppercase font-semibold">
              {isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}
            </span>
          )}
        </button>
      </div>

      {/* Popover Acoustic Control Suite */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-[#030712]/95 border border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Tactical Audio System
              </span>
            </div>
            <button
              onClick={() => {
                toggleMute();
                if (isMuted) {
                  setTimeout(() => playSound('click'), 50);
                }
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all ${
                isMuted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}
            >
              {isMuted ? 'UNMUTE' : 'MUTE'}
            </button>
          </div>

          {/* Master Volume Slider */}
          <div className="mt-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Master Gain</span>
              <span className="text-teal-400 font-semibold">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume1 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                }}
                onMouseUp={() => playSound('click')}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <Volume2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            </div>
          </div>

          {/* Ambient Periodic Sonar Toggle */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-200">Ambient Sonar Sweep</div>
              <div className="text-[9px] text-slate-500 font-mono">Subsea ping every 18s</div>
            </div>
            <button
              onClick={() => {
                toggleAmbient();
                playSound('toggle');
              }}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                ambientActive ? 'bg-teal-500' : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  ambientActive ? 'translate-x-4 shadow-sm' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Acoustic Soundboard Quick Test */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              Acoustic Profile Testing
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {soundTests.map((test) => (
                <button
                  key={test.type}
                  onClick={() => {
                    if (isMuted) toggleMute();
                    playSound(test.type);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-teal-500/10 border border-white/[0.05] hover:border-teal-500/30 text-left transition-all group/btn"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-white/[0.04] group-hover/btn:bg-teal-500/20 transition-colors">
                      {test.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-200 group-hover/btn:text-white">
                        {test.label}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {test.desc}
                      </div>
                    </div>
                  </div>
                  <Play className="w-2.5 h-2.5 text-slate-500 group-hover/btn:text-teal-400 shrink-0 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
