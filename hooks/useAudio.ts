import { useEffect, useRef, useCallback } from 'react';

interface AudioManager {
  playSound: (soundName: string) => void;
  playMusic: (musicName: string) => void;
  stopMusic: () => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

export const useAudio = (): AudioManager => {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const masterVolume = useRef(0.5);
  const musicVolume = useRef(0.3);
  const sfxVolume = useRef(0.7);

  // Sound effects mapping (in a real game, these would be actual audio files)
  const soundEffects: Record<string, string> = {
