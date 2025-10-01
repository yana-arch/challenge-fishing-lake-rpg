import React, { useState, useEffect, useRef } from 'react';
import { DangerType } from '../types';

interface DivingMinigameProps {
  danger: DangerType;
  onComplete: (success: boolean) => void;
}

const DivingMinigame: React.FC<DivingMinigameProps> = ({ danger, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);
  const [position, setPosition] = useState(50);
  // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
  const gameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetZoneStart = 40;
  const targetZoneEnd = 60;
  const gameDuration = 8000; // 8 seconds
  const progressSpeed = gameDuration / 100; // complete in 8 seconds

  useEffect(() => {
    // Moving danger indicator
    gameRef.current = setInterval(() => {
      setPosition(prev => {
        const next = prev + direction * 3; // Move the danger indicator
        if (next >= 100 || next <= 0) {
          setDirection(d => -d);
        }
        return Math.max(0, Math.min(100, next));
      });
    }, 100);

    // Overall progress bar
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Game over - check final position
          if (gameRef.current) clearInterval(gameRef.current);
          if (progressRef.current) clearInterval(progressRef.current);
          const success = position >= targetZoneStart && position <= targetZoneEnd;
          onComplete(success);
          return 100;
        }
        return prev + 1;
      });
    }, progressSpeed);

    return () => {
      if (gameRef.current) clearInterval(gameRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [direction, position, onComplete, progress, targetZoneStart, targetZoneEnd, progressSpeed]);

  const getDangerEmoji = (type: DangerType) => {
    switch (type) {
      case DangerType.Shark: return '🦈';
      case DangerType.ElectricEel: return '🪱';
      case DangerType.Current: return '🌊';
      case DangerType.Depth: return '💧';
      default: return '⚠️';
    }
  };

  const getDangerDescription = (type: DangerType) => {
    switch (type) {
      case DangerType.Shark: return 'Avoid the shark by staying in the safe zone!';
      case DangerType.ElectricEel: return 'Keep your distance from the electric eel!';
      case DangerType.Current: return 'Fight against the strong current!';
      case DangerType.Depth: return 'The pressure is crushing - maintain position!';
      default: return 'Avoid danger!';
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900/80 rounded-lg">
      <h3 className="text-xl font-bold text-red-400 mb-2">Danger!</h3>
      <div className="text-4xl mb-2">{getDangerEmoji(danger)}</div>
      <p className="text-gray-300 mb-4 text-center">{getDangerDescription(danger)}</p>

      {/* Safe zone indicator */}
      <div className="w-full bg-gray-700 rounded-full h-4 mb-4 relative overflow-hidden border border-gray-600">
        <div
          className="absolute top-0 bg-green-500 h-full"
          style={{ left: `${targetZoneStart}%`, width: `${targetZoneEnd - targetZoneStart}%` }}
        />
        <div
          className="absolute top-0 bg-red-500 h-full w-1"
          style={{ left: `${position}%` }}
        />
      </div>
      <p className="text-sm text-gray-400 mb-4">Keep the red indicator in the green zone!</p>

      {/* Progress bar */}
      <div className="w-full mb-2">
        <div className="text-sm text-gray-300 mb-1">Time remaining</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress > 80 ? 'bg-red-500' : progress > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => {
          if (gameRef.current) clearInterval(gameRef.current);
          if (progressRef.current) clearInterval(progressRef.current);
          const success = position >= targetZoneStart && position <= targetZoneEnd;
          onComplete(success);
        }}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Retreat!
      </button>
    </div>
  );
};

export default DivingMinigame;
