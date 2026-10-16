import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DomainId, WardenAlert, Waypoint } from '../types/world';
import { OPEN_WORLD_WAYPOINTS, SHELTER_REROUTE_WAYPOINT, snapToClosestVioletPath } from '../data/route';
import { ACTIVE_SURGE_ALERT, ALL_CLEAR_STATE, DOMAIN_SURGE_PRESETS } from '../data/wardenSurges';

interface LedgerContextType {
  currentDomain: DomainId;
  currentWaypoint: Waypoint;
  currentWaypointIndex: number;
  route: Waypoint[];
  isRerouted: boolean;
  showBorderModal: boolean;
  showAboutModal: boolean;
  showWelcomeModal: boolean;
  currentStrength: number;
  fadingSignal: boolean;
  activeAlert: WardenAlert;
  countdownSeconds: number;
  soundEnabled: boolean;
  activeTab: 'map' | 'tongue' | 'warden' | 'border';
  navigatorCoords: { x: number; y: number };
  isFreeNavigating: boolean;
  setActiveTab: (tab: 'map' | 'tongue' | 'warden' | 'border') => void;
  setShowBorderModal: (show: boolean) => void;
  setShowAboutModal: (show: boolean) => void;
  setShowWelcomeModal: (show: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDomain: (domain: DomainId) => void;
  nextLeg: () => void;
  prevLeg: () => void;
  jumpToWaypoint: (index: number) => void;
  setNavigatorPosition: (x: number, y: number, autoSnap?: boolean) => void;
  rerouteToShelter: () => void;
  resetRoute: () => void;
  toggleSurgeAlert: () => void;
  setSurgePreset: (presetKey: string) => void;
  attuneLedger: (targetDomain: DomainId) => void;
  playBellSound: () => void;
  playAttuneSound: () => void;
  playClickSound: () => void;
  playExplosionSound: () => void;
  playVolcanoSound: () => void;
  playWaterfallSound: () => void;
  playWindSound: () => void;
  playBirdSound: () => void;
  stopActiveSound: () => void;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

let sharedAudioCtx: AudioContext | null = null;
let masterCompressorNode: DynamicsCompressorNode | null = null;
let masterGainNode: GainNode | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.warn('AudioContext creation error', e);
    return null;
  }
}

// Studio-grade limiter and compressor to deliver loud, punchy, unclipped audio
export function getMasterAudioDestination(ctx: AudioContext): AudioNode {
  if (!masterCompressorNode || !masterGainNode || masterCompressorNode.context !== ctx) {
    try {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-14, ctx.currentTime);
      comp.knee.setValueAtTime(8, ctx.currentTime);
      comp.ratio.setValueAtTime(6, ctx.currentTime);
      comp.attack.setValueAtTime(0.003, ctx.currentTime);
      comp.release.setValueAtTime(0.15, ctx.currentTime);

      const master = ctx.createGain();
      master.gain.setValueAtTime(1.75, ctx.currentTime); // Master volume adjusted slightly lower for balanced loudness

      comp.connect(master);
      master.connect(ctx.destination);

      masterCompressorNode = comp;
      masterGainNode = master;
    } catch (_) {
      return ctx.destination;
    }
  }
  return masterCompressorNode;
}

export function playSafeSound(playFn: (ctx: AudioContext, now: number, dest: AudioNode) => void) {
  if (typeof window === 'undefined') return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime + 0.01;
    const dest = getMasterAudioDestination(ctx);
    playFn(ctx, now, dest);
  } catch (e) {
    console.warn('Procedural audio execution error', e);
  }
}

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    preloadAllCodexAudio();
  };
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
  setTimeout(() => preloadAllCodexAudio(), 100);
}

// Audio buffers for decoded high-fidelity sound effects
let volcanoAudioBuffer: AudioBuffer | null = null;
let windAudioBuffer: AudioBuffer | null = null;
let birdAudioBuffer: AudioBuffer | null = null;

// HTMLAudioElement fallbacks
let volcanoAudioEl: HTMLAudioElement | null = null;
let windAudioEl: HTMLAudioElement | null = null;
let birdAudioEl: HTMLAudioElement | null = null;

// Exclusivity tracking: only ONE audio effect may play at any time
let activeSourceNode: AudioBufferSourceNode | null = null;
let activeGainNode: GainNode | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let activeAudioTimer: ReturnType<typeof setTimeout> | null = null;

export function stopActiveSound(fadeMs: number = 25) {
  if (activeAudioTimer) {
    clearTimeout(activeAudioTimer);
    activeAudioTimer = null;
  }

  // 1. Immediately pause and reset any playing HTMLAudioElement
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (_) {}
    activeAudioElement = null;
  }

  // 2. Rapidly fade out and disconnect Web Audio Source to eliminate pops/clicks
  if (activeGainNode && activeSourceNode) {
    const ctx = getSharedAudioContext();
    const src = activeSourceNode;
    const gain = activeGainNode;
    activeSourceNode = null;
    activeGainNode = null;

    if (ctx && ctx.state !== 'closed') {
      try {
        const now = ctx.currentTime;
        const rampSec = Math.max(0.012, fadeMs / 1000);
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + rampSec);
        setTimeout(() => {
          try {
            src.stop();
            src.disconnect();
          } catch (_) {}
        }, fadeMs + 10);
      } catch (_) {
        try {
          src.stop();
          src.disconnect();
        } catch (_) {}
      }
    } else {
      try {
        src.stop();
        src.disconnect();
      } catch (_) {}
    }
  }
}

// Helper to decode and trim an audio asset to target duration with volume normalization and smooth cosine fade-out
function decodeAndTrimAudio(
  ctx: AudioContext,
  url: string,
  targetDuration: number,
  onDecoded: (buffer: AudioBuffer) => void
) {
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
    .then((decoded) => {
      const targetLength = Math.min(decoded.length, Math.floor(decoded.sampleRate * targetDuration));
      const trimmed = ctx.createBuffer(
        decoded.numberOfChannels,
        targetLength,
        decoded.sampleRate
      );

      // Find peak amplitude across channels to normalize and maximize loudness
      let maxPeak = 0;
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const srcData = decoded.getChannelData(ch);
        for (let i = 0; i < targetLength; i++) {
          const val = Math.abs(srcData[i]);
          if (val > maxPeak) maxPeak = val;
        }
      }
      const normFactor = maxPeak > 0.02 ? Math.min(2.5, 0.98 / maxPeak) : 1.0;

      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const srcData = decoded.getChannelData(ch);
        const destData = trimmed.getChannelData(ch);
        for (let i = 0; i < targetLength; i++) {
          destData[i] = srcData[i] * normFactor;
        }

        // Smooth cosine fade-out over final 0.35s
        const fadeSamples = Math.floor(decoded.sampleRate * 0.35);
        const fadeStart = targetLength - fadeSamples;
        for (let i = 0; i < fadeSamples; i++) {
          const factor = 0.5 * (1 + Math.cos((i / fadeSamples) * Math.PI));
          destData[fadeStart + i] *= factor;
        }
      }
      onDecoded(trimmed);
    })
    .catch((err) => {
      console.warn(`Could not pre-decode audio from ${url}:`, err);
    });
}

// Preloads all audio assets for zero-latency instant playback
export function preloadAllCodexAudio() {
  if (typeof window === 'undefined') return;

  // Initialize HTMLAudioElement fallbacks
  try {
    if (!volcanoAudioEl) {
      volcanoAudioEl = new Audio('/volcano_eruption.mp4');
      volcanoAudioEl.preload = 'auto';
    }
    if (!windAudioEl) {
      windAudioEl = new Audio('/wind_blowing.wav');
      windAudioEl.preload = 'auto';
    }
    if (!birdAudioEl) {
      birdAudioEl = new Audio('/forest_bird_chirp.wav');
      birdAudioEl.preload = 'auto';
    }
  } catch (e) {
    console.warn('AudioElement preload init error', e);
  }

  const ctx = getSharedAudioContext();
  if (!ctx) return;

  if (!volcanoAudioBuffer) {
    decodeAndTrimAudio(ctx, '/volcano_eruption.mp4', 2.8, (buf) => {
      volcanoAudioBuffer = buf;
    });
  }
  if (!windAudioBuffer) {
    decodeAndTrimAudio(ctx, '/wind_blowing.wav', 2.8, (buf) => {
      windAudioBuffer = buf;
    });
  }
  if (!birdAudioBuffer) {
    decodeAndTrimAudio(ctx, '/forest_bird_chirp.wav', 2.8, (buf) => {
      birdAudioBuffer = buf;
    });
  }
}

// Export for backward compatibility
export const preloadVolcanoVideoAudio = preloadAllCodexAudio;

// Universal exclusive audio player: stops any playing track immediately before starting the new track
function playExclusiveTrack(
  getBuffer: () => AudioBuffer | null,
  getAudioEl: () => HTMLAudioElement | null,
  url: string,
  durationSec: number = 2.8,
  volume: number = 2.0,
  fallbackProcedural?: () => void
) {
  // 1. Instantly stop any previous audio
  stopActiveSound(20);

  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const buffer = getBuffer();

  // 2. Play using decoded Web Audio buffer for true 0-latency, boosted loudness, and exact envelope control
  if (ctx && buffer) {
    try {
      const now = ctx.currentTime;
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now);

      const dest = getMasterAudioDestination(ctx);
      source.connect(gain);
      gain.connect(dest);

      activeSourceNode = source;
      activeGainNode = gain;

      source.onended = () => {
        if (activeSourceNode === source) {
          activeSourceNode = null;
          activeGainNode = null;
        }
      };

      source.start(now);
      source.stop(now + durationSec + 0.05);
      return;
    } catch (e) {
      console.warn('Web Audio buffer playback error, using element fallback', e);
    }
  }

  // 3. Fallback to HTMLAudioElement
  if (typeof window !== 'undefined') {
    try {
      let el = getAudioEl();
      if (!el) {
        el = new Audio(url);
        el.preload = 'auto';
      }
      const sound = (el.cloneNode(true) as HTMLAudioElement) || el;
      sound.currentTime = 0;
      sound.volume = 0.85;
      activeAudioElement = sound;

      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            activeAudioTimer = setTimeout(() => {
              if (activeAudioElement === sound) {
                sound.pause();
                sound.currentTime = 0;
                activeAudioElement = null;
              }
            }, durationSec * 1000);
          })
          .catch((err) => {
            console.warn('HTMLAudioElement playback blocked/failed', err);
            if (fallbackProcedural) fallbackProcedural();
          });
        return;
      }
      return;
    } catch (e) {
      console.warn('HTMLAudioElement playback error', e);
    }
  }

  // 4. Procedural fallback if available
  if (fallbackProcedural) {
    fallbackProcedural();
  }
}

// Procedural caldera explosion synthesis (loud & punchy fallback)
function playProceduralCalderaExplosion() {
  playSafeSound((ctx, now, dest) => {
    const dur = 1.6;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.95;
    }

    const blastOffsets = [0, 0.32, 0.72];
    const blastIntensities = [1.8, 1.5, 1.3];

    blastOffsets.forEach((offset, idx) => {
      const t = now + offset;
      const intensity = blastIntensities[idx];

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 - idx * 25, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.35);

      oscGain.gain.setValueAtTime(0.01, t);
      oscGain.gain.linearRampToValueAtTime(1.1 * intensity, t + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, t);
      subOsc.frequency.exponentialRampToValueAtTime(65, t + 0.5);

      subGain.gain.setValueAtTime(0.01, t);
      subGain.gain.linearRampToValueAtTime(0.95 * intensity, t + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400 - idx * 150, t);
      filter.frequency.exponentialRampToValueAtTime(280, t + 0.7);
      filter.Q.value = 2.4;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, t);
      noiseGain.gain.linearRampToValueAtTime(1.3 * intensity, t + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(oscGain);
      oscGain.connect(dest);
      subOsc.connect(subGain);
      subGain.connect(dest);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.85);
      subOsc.start(t);
      subOsc.stop(t + 0.95);
      noise.start(t);
      noise.stop(t + dur);
    });
  });
}

// Procedural howling mountain wind synthesis (loud & atmospheric fallback)
function playProceduralMountainWind() {
  playSafeSound((ctx, now, dest) => {
    const dur = 2.8;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + 0.8);
    filter.frequency.exponentialRampToValueAtTime(320, now + 1.8);
    filter.frequency.exponentialRampToValueAtTime(520, now + 2.8);
    filter.Q.value = 2.2;

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.01, now);
    windGain.gain.linearRampToValueAtTime(1.8, now + 0.25);
    windGain.gain.setValueAtTime(1.6, now + dur - 0.45);
    windGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(dest);

    activeSourceNode = noise;
    activeGainNode = windGain;

    noise.onended = () => {
      if (activeSourceNode === noise) {
        activeSourceNode = null;
        activeGainNode = null;
      }
    };

    noise.start(now);
    noise.stop(now + dur);
  });
}

// Procedural forest birds chirping synthesis (bright & crisp fallback)
function playProceduralForestBirds() {
  playSafeSound((ctx, now, dest) => {
    const chirps = [
      { start: 0.0, f1: 2800, f2: 3900, f3: 3100, dur: 0.18, vol: 1.4 },
      { start: 0.22, f1: 3200, f2: 4400, f3: 3600, dur: 0.22, vol: 1.5 },
      { start: 0.52, f1: 3000, f2: 4200, f3: 3400, dur: 0.2, vol: 1.3 },
      { start: 1.1, f1: 2700, f2: 3800, f3: 3200, dur: 0.19, vol: 1.35 },
      { start: 1.35, f1: 3300, f2: 4600, f3: 3700, dur: 0.24, vol: 1.45 },
    ];

    chirps.forEach(({ start, f1, f2, f3, dur, vol }) => {
      const t = now + start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.linearRampToValueAtTime(f2, t + dur * 0.45);
      osc.frequency.exponentialRampToValueAtTime(f3, t + dur);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(vol, t + dur * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  });
}

function createProceduralAudio() {
  if (typeof window === 'undefined') {
    return {
      bell: () => {},
      attune: () => {},
      click: () => {},
      bomb: () => {},
      volcano: () => {},
      waterfall: () => {},
      wind: () => {},
      birds: () => {},
    };
  }

  return {
    // Rich resonant bronze sanctuary warning bell with deep harmonics and high loudness
    bell: () => {
      stopActiveSound(20);
      playSafeSound((ctx, now, dest) => {
        const harmonics = [
          { f: 260, g: 0.9, type: 'sine' as OscillatorType, dur: 2.8 },
          { f: 520, g: 1.4, type: 'sine' as OscillatorType, dur: 2.8 },
          { f: 780, g: 0.65, type: 'sine' as OscillatorType, dur: 2.4 },
          { f: 1040, g: 0.95, type: 'triangle' as OscillatorType, dur: 2.2 },
          { f: 1560, g: 0.6, type: 'sine' as OscillatorType, dur: 1.8 },
          { f: 2080, g: 0.45, type: 'sine' as OscillatorType, dur: 1.4 },
          { f: 3120, g: 0.3, type: 'triangle' as OscillatorType, dur: 0.9 },
        ];

        harmonics.forEach(({ f, g, type, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 0.985, now + dur);

          gain.gain.setValueAtTime(g, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + dur + 0.05);
        });
      });
    },
    // Ascending crystalline attunement chord arpeggio with high volume & octave warmth
    attune: () => {
      stopActiveSound(20);
      playSafeSound((ctx, now, dest) => {
        const notes = [
          { f: 440, delay: 0.0 },
          { f: 554.37, delay: 0.08 },
          { f: 659.25, delay: 0.16 },
          { f: 880, delay: 0.24 },
          { f: 1108.73, delay: 0.32 },
        ];
        notes.forEach(({ f, delay }) => {
          const t = now + delay;
          const osc = ctx.createOscillator();
          const subOsc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);
          osc.frequency.exponentialRampToValueAtTime(f * 1.015, t + 0.35);

          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(f / 2, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(1.1, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);

          osc.connect(gain);
          subOsc.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + 1.15);
          subOsc.start(t);
          subOsc.stop(t + 1.15);
        });
      });
    },
    // Snappy mechanical click for button presses and navigation with punchy presence
    click: () => {
      playSafeSound((ctx, now, dest) => {
        const osc = ctx.createOscillator();
        const lowOsc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

        lowOsc.type = 'sine';
        lowOsc.frequency.setValueAtTime(380, now);
        lowOsc.frequency.exponentialRampToValueAtTime(90, now + 0.07);

        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        lowOsc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.08);
        lowOsc.start(now);
        lowOsc.stop(now + 0.08);
      });
    },
    // Volcanic explosion audio with reliable procedural fallback
    volcano: () => {
      playExclusiveTrack(
        () => volcanoAudioBuffer,
        () => volcanoAudioEl,
        '/volcano_eruption.mp4',
        2.8,
        2.0,
        playProceduralCalderaExplosion
      );
    },
    bomb: () => {
      audio.volcano();
    },
    // Roaring waterfall cascade with deep rushing body and splashing froth
    waterfall: () => {
      stopActiveSound(25);
      playSafeSound((ctx, now, dest) => {
        const dur = 2.8;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.9;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Master gain for waterfall
        const waterfallMaster = ctx.createGain();
        waterfallMaster.gain.setValueAtTime(1.8, now);

        // 1. Deep rushing hydraulic body
        const lowFilter = ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.setValueAtTime(450, now);
        lowFilter.Q.value = 1.4;

        const lowGain = ctx.createGain();
        lowGain.gain.setValueAtTime(0.01, now);
        lowGain.gain.linearRampToValueAtTime(0.95, now + 0.2);
        lowGain.gain.setValueAtTime(0.9, now + dur - 0.4);
        lowGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        // 2. Continuous splashing spray & froth cascade
        const sprayFilter = ctx.createBiquadFilter();
        sprayFilter.type = 'bandpass';
        sprayFilter.frequency.setValueAtTime(820, now);
        sprayFilter.Q.value = 0.9;

        const sprayGain = ctx.createGain();
        sprayGain.gain.setValueAtTime(0.01, now);
        sprayGain.gain.linearRampToValueAtTime(0.85, now + 0.15);
        sprayGain.gain.setValueAtTime(0.8, now + dur - 0.35);
        sprayGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        // 3. Crisp mist shimmer
        const mistFilter = ctx.createBiquadFilter();
        mistFilter.type = 'highpass';
        mistFilter.frequency.setValueAtTime(1600, now);
        mistFilter.Q.value = 0.7;

        const mistGain = ctx.createGain();
        mistGain.gain.setValueAtTime(0.01, now);
        mistGain.gain.linearRampToValueAtTime(0.45, now + 0.25);
        mistGain.gain.setValueAtTime(0.4, now + dur - 0.35);
        mistGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(lowFilter);
        lowFilter.connect(lowGain);
        lowGain.connect(waterfallMaster);

        noise.connect(sprayFilter);
        sprayFilter.connect(sprayGain);
        sprayGain.connect(waterfallMaster);

        noise.connect(mistFilter);
        mistFilter.connect(mistGain);
        mistGain.connect(waterfallMaster);

        waterfallMaster.connect(dest);

        activeSourceNode = noise;
        activeGainNode = waterfallMaster;

        noise.onended = () => {
          if (activeSourceNode === noise) {
            activeSourceNode = null;
            activeGainNode = null;
          }
        };

        noise.start(now);
        noise.stop(now + dur);
      });
    },
    // Howling mountain wind blowing sound with procedural fallback
    wind: () => {
      playExclusiveTrack(
        () => windAudioBuffer,
        () => windAudioEl,
        '/wind_blowing.wav',
        2.8,
        2.0,
        playProceduralMountainWind
      );
    },
    // Birds chirping sound with procedural fallback
    birds: () => {
      playExclusiveTrack(
        () => birdAudioBuffer,
        () => birdAudioEl,
        '/forest_bird_chirp.wav',
        2.8,
        2.1,
        playProceduralForestBirds
      );
    },
  };
}

const audio = createProceduralAudio();

export const LedgerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [currentDomain, setCurrentDomain] = useState<DomainId>('tidereach');
  const [isRerouted, setIsRerouted] = useState<boolean>(false);
  const [showBorderModal, setShowBorderModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'map' | 'tongue' | 'warden' | 'border'>('map');
  const [activeAlert, setActiveAlert] = useState<WardenAlert>(ACTIVE_SURGE_ALERT);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(ACTIVE_SURGE_ALERT.countdownSeconds);

  // Open-World Navigator Coordinate State
  const [navigatorCoords, setNavigatorCoords] = useState<{ x: number; y: number }>({
    x: OPEN_WORLD_WAYPOINTS[0].x,
    y: OPEN_WORLD_WAYPOINTS[0].y,
  });
  const [isFreeNavigating, setIsFreeNavigating] = useState<boolean>(true);

  const currentWaypoint = OPEN_WORLD_WAYPOINTS[currentWaypointIndex] || OPEN_WORLD_WAYPOINTS[0];

  const route = React.useMemo(() => {
    if (!isRerouted) return OPEN_WORLD_WAYPOINTS;
    return OPEN_WORLD_WAYPOINTS.map((wp) => (wp.id === 'wp-gale-shear' ? SHELTER_REROUTE_WAYPOINT : wp));
  }, [isRerouted]);

  const currentStrength = currentWaypoint.currentStrength;
  const fadingSignal = currentStrength < 35 || currentWaypoint.isBorder;

  useEffect(() => {
    document.documentElement.setAttribute('data-domain', currentDomain);
  }, [currentDomain]);

  useEffect(() => {
    preloadAllCodexAudio();
    const handleGesture = () => {
      const ctx = getSharedAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      preloadAllCodexAudio();
    };
    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('pointerdown', handleGesture, { passive: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
    };
  }, []);

  useEffect(() => {
    if (activeAlert.urgency === 'ALL_CLEAR' || countdownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAlert, countdownSeconds]);

  const playBellSound = () => {
    if (soundEnabled) audio.bell();
  };

  const playAttuneSound = () => {
    if (soundEnabled) audio.attune();
  };

  const playClickSound = () => {
    if (soundEnabled) audio.click();
  };

  const playVolcanoSound = () => {
    if (soundEnabled) audio.volcano();
  };
  const playExplosionSound = playVolcanoSound;

  const playWaterfallSound = () => {
    if (soundEnabled) audio.waterfall();
  };

  const playWindSound = () => {
    if (soundEnabled) audio.wind();
  };

  const playBirdSound = () => {
    if (soundEnabled) audio.birds();
  };

  // Set navigator position anywhere by hovering or cursor moving on path with hysteresis
  const setNavigatorPosition = (cursorX: number, cursorY: number, autoSnap: boolean = false) => {
    setIsFreeNavigating(true);
    let finalX = Math.round(cursorX);
    let finalY = Math.round(cursorY);

    if (autoSnap) {
      const snapped = snapToClosestVioletPath(cursorX, cursorY, 24);
      if (snapped.isNearPath) {
        finalX = Math.round(snapped.x);
        finalY = Math.round(snapped.y);
      }
    }

    setNavigatorCoords({ x: finalX, y: finalY });

    // Only switch waypoint/domain if within direct proximity (<42px) with hysteresis to prevent rapid flickering
    let candidateIdx = -1;
    let candidateMinDist = Infinity;
    OPEN_WORLD_WAYPOINTS.forEach((wp, idx) => {
      const d = Math.hypot(wp.x - finalX, wp.y - finalY);
      if (d < candidateMinDist && d < 42) {
        candidateMinDist = d;
        candidateIdx = idx;
      }
    });

    if (candidateIdx !== -1 && candidateIdx !== currentWaypointIndex) {
      const currentWp = OPEN_WORLD_WAYPOINTS[currentWaypointIndex];
      const currentDist = currentWp ? Math.hypot(currentWp.x - finalX, currentWp.y - finalY) : Infinity;
      // Require the new waypoint to be at least 14px closer before switching to eliminate jitter
      if (candidateMinDist < currentDist - 14) {
        setCurrentWaypointIndex(candidateIdx);
        const newDomain = OPEN_WORLD_WAYPOINTS[candidateIdx].domainId;
        if (newDomain && newDomain !== currentDomain) {
          setCurrentDomain(newDomain);
        }
      }
    }
  };

  const jumpToWaypoint = (index: number) => {
    if (index >= 0 && index < OPEN_WORLD_WAYPOINTS.length) {
      stopActiveSound();
      playClickSound();
      const targetWp = OPEN_WORLD_WAYPOINTS[index];
      setCurrentWaypointIndex(index);
      setNavigatorCoords({ x: targetWp.x, y: targetWp.y });
      setCurrentDomain(targetWp.domainId);

      // Play situational sound on waypoint jump
      if (targetWp.id === 'wp-ashfall-volcano' || targetWp.id === 'wp-cinder-crag' || targetWp.id === 'wp-sulfur-vents') {
        playVolcanoSound();
      } else if (
        targetWp.id === 'wp-shadowmere-trail' ||
        targetWp.id === 'wp-shadowmere-rest' ||
        targetWp.id === 'wp-sunken-foundry'
      ) {
        playBirdSound();
      } else if (targetWp.domainId === 'tidereach') {
        playWaterfallSound();
      } else if (targetWp.domainId === 'skydrift') {
        playWindSound();
      }
    }
  };

  const nextLeg = () => {
    if (currentWaypointIndex < OPEN_WORLD_WAYPOINTS.length - 1) {
      jumpToWaypoint(currentWaypointIndex + 1);
    } else {
      jumpToWaypoint(0);
    }
  };

  const prevLeg = () => {
    if (currentWaypointIndex > 0) {
      jumpToWaypoint(currentWaypointIndex - 1);
    } else {
      jumpToWaypoint(OPEN_WORLD_WAYPOINTS.length - 1);
    }
  };

  const setDomain = (domain: DomainId) => {
    playClickSound();
    setCurrentDomain(domain);
  };

  const attuneLedger = (targetDomain: DomainId) => {
    playAttuneSound();
    setCurrentDomain(targetDomain);
    setTimeout(() => {
      setShowBorderModal(false);
    }, 800);
  };

  const rerouteToShelter = () => {
    playBellSound();
    setIsRerouted(true);
    setNavigatorCoords({ x: SHELTER_REROUTE_WAYPOINT.x, y: SHELTER_REROUTE_WAYPOINT.y });
  };

  const resetRoute = () => {
    playClickSound();
    setIsRerouted(false);
  };

  const toggleSurgeAlert = () => {
    playClickSound();
    if (activeAlert.urgency === 'ALL_CLEAR') {
      setActiveAlert(ACTIVE_SURGE_ALERT);
      setCountdownSeconds(ACTIVE_SURGE_ALERT.countdownSeconds);
      playBellSound();
    } else {
      setActiveAlert(ALL_CLEAR_STATE);
      setCountdownSeconds(0);
    }
  };

  const setSurgePreset = (presetKey: string) => {
    playClickSound();
    const preset = DOMAIN_SURGE_PRESETS[presetKey];
    if (preset) {
      setActiveAlert(preset);
      setCountdownSeconds(preset.countdownSeconds);
      if (preset.urgency === 'CRITICAL' || preset.urgency === 'WARNING') {
        playBellSound();
      }
    }
  };

  return (
    <LedgerContext.Provider
      value={{
        currentDomain,
        currentWaypoint,
        currentWaypointIndex,
        route,
        isRerouted,
        showBorderModal,
        showAboutModal,
        showWelcomeModal,
        currentStrength,
        fadingSignal,
        activeAlert,
        countdownSeconds,
        soundEnabled,
        activeTab,
        navigatorCoords,
        isFreeNavigating,
        setActiveTab: (tab) => {
          if (tab !== 'map') stopActiveSound();
          setActiveTab(tab);
        },
        setShowBorderModal,
        setShowAboutModal,
        setShowWelcomeModal,
        setSoundEnabled,
        setDomain,
        nextLeg,
        prevLeg,
        jumpToWaypoint,
        setNavigatorPosition,
        rerouteToShelter,
        resetRoute,
        toggleSurgeAlert,
        setSurgePreset,
        attuneLedger,
        playBellSound,
        playAttuneSound,
        playClickSound,
        playExplosionSound,
        playVolcanoSound,
        playWaterfallSound,
        playWindSound,
        playBirdSound,
        stopActiveSound,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = (): LedgerContextType => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
