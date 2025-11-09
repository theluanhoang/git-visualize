import { useCallback, useRef } from 'react';

interface SoundConfig {
  volume?: number;
  playbackRate?: number;
}

export const useCelebrationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<Map<string, AudioBuffer>>(new Map());

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createTone = useCallback((
    frequency: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): AudioBuffer => {
    const audioContext = initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    }

    return buffer;
  }, [initAudioContext]);

  const playSound = useCallback(async (
    buffer: AudioBuffer, 
    config: SoundConfig = {}
  ) => {
    const audioContext = initAudioContext();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    source.playbackRate.value = config.playbackRate || 1;
    gainNode.gain.value = config.volume || 0.3;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
  }, [initAudioContext]);

  const playVictoryJingle = useCallback(async (config: SoundConfig = {}) => {
    const audioContext = initAudioContext();
    
    const melody = [
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 783.99, duration: 0.2 }, // G5
      { freq: 1046.50, duration: 0.4 }, // C6
    ];

    for (let i = 0; i < melody.length; i++) {
      const note = melody[i];
      const buffer = createTone(note.freq, note.duration, 'sine', 0.2);
      setTimeout(() => {
        playSound(buffer, config);
      }, i * 200);
    }
  }, [createTone, playSound]);

  const playFireworkSound = useCallback(async (config: SoundConfig = {}) => {
    const audioContext = initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.8;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const noise = (Math.random() * 2 - 1) * 0.3;
      const tone = Math.sin(2 * Math.PI * 200 * t) * 0.2;
      data[i] = (noise + tone) * envelope * (config.volume || 0.4);
    }

    playSound(buffer, config);
  }, [playSound]);

  const playConfettiSound = useCallback(async (config: SoundConfig = {}) => {
    const audioContext = initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.5;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4);
      const tone = Math.sin(2 * Math.PI * 800 * t) * 0.1;
      data[i] = tone * envelope * (config.volume || 0.3);
    }

    playSound(buffer, config);
  }, [playSound]);

  const playSuccessChime = useCallback(async (config: SoundConfig = {}) => {
    const audioContext = initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.6;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const tone1 = Math.sin(2 * Math.PI * 523.25 * t) * 0.3; // C5
      const tone2 = Math.sin(2 * Math.PI * 659.25 * t) * 0.2; // E5
      data[i] = (tone1 + tone2) * envelope * (config.volume || 0.3);
    }

    playSound(buffer, config);
  }, [playSound]);

  return {
    playVictoryJingle,
    playFireworkSound,
    playConfettiSound,
    playSuccessChime
  };
};
