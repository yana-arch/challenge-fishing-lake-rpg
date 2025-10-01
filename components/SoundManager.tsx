import React, { createContext, useContext, useRef, useEffect } from 'react';

// Sound effect URLs (you can replace these with actual sound files)
const SOUNDS = {
  buttonClick: '', // Add actual sound file URL
  fishingCast: '', // Add actual sound file URL
  fishBite: '', // Add actual sound file URL
  reelingFish: '', // Add actual sound file URL
  catchSuccess: '', // Add actual sound file URL
  divingStart: '', // Add actual sound file URL
  combatHit: '', // Add actual sound file URL
  levelUp: '', // Add actual sound file URL
  reputationChange: '', // Add actual sound file URL
  cleanupComplete: '', // Add actual sound file URL
  craftingSuccess: '', // Add actual sound file URL
  bombExplosion: '', // Add actual sound file URL
  shockDevice: '', // Add actual sound file URL
  wardenDetected: '', // Add actual sound file URL
};

interface SoundManagerContextType {
  playSound: (soundName: keyof typeof SOUNDS) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const SoundManagerContext = createContext<SoundManagerContextType | null>(null);

export const SoundManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(false);
  const volumeRef = useRef(0.5);

  const playSound = (soundName: keyof typeof SOUNDS) => {
    if (isMutedRef.current) return;

    try {
      // Create audio context for web audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // For demo purposes, we'll create synthetic sounds using Web Audio API
      playSyntheticSound(audioContext, soundName);
    } catch (error) {
      // Fallback to HTML audio if Web Audio API fails
      console.log(`Playing sound: ${soundName}`);
      // In a real implementation, you would load and play actual audio files here
    }
  };

  const playSyntheticSound = (audioContext: AudioContext, soundName: keyof typeof SOUNDS) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(volumeRef.current, audioContext.currentTime);

    // Different sound effects based on the sound name
    switch (soundName) {
      case 'buttonClick':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;

      case 'fishingCast':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;

      case 'fishBite':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'catchSuccess':
        // Create a victory sound - ascending tones
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3); // G5
        oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45); // C6

        gainNode.gain.setValueAtTime(volumeRef.current, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
        break;

      case 'bombExplosion':
        // Create an explosion sound - descending noise
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(volumeRef.current * 1.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'levelUp':
        // Celebration sound
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.15); // C#5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.3); // E5
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.45); // A5

        gainNode.gain.setValueAtTime(volumeRef.current, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;

      case 'reputationChange':
        if (volumeRef.current > 0) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(volumeRef.current * 0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }
        break;

      default:
        // Generic click sound for other interactions
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
    }
  };

  const setVolume = (volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume));
  };

  const toggleMute = () => {
    isMutedRef.current = !isMutedRef.current;
  };

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.resume();
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    };

    // Listen for first user interaction to enable audio
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const contextValue: SoundManagerContextType = {
    playSound,
    setVolume,
    toggleMute,
    isMuted: isMutedRef.current,
  };

  return (
    <SoundManagerContext.Provider value={contextValue}>
      {children}
    </SoundManagerContext.Provider>
  );
};

export const useSoundManager = () => {
  const context = useContext(SoundManagerContext);
  if (!context) {
    throw new Error('useSoundManager must be used within a SoundManagerProvider');
  }
  return context;
};

// Custom hook for easy sound effects integration
export const useSound = (soundName: keyof typeof SOUNDS) => {
  const { playSound } = useSoundManager();

  const play = () => playSound(soundName);

  return play;
};
