import React, { useState, useEffect, useRef } from 'react';
import { Item, Rarity } from '../types';

interface FishingMinigameProps {
  itemOnLine: Item | null;
  onComplete: (success: boolean) => void;
}

const getDifficulty = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.Legendary: return { speed: 10, zone: 8 };
        case Rarity.Epic: return { speed: 8, zone: 10 };
        case Rarity.Rare: return { speed: 6, zone: 15 };
        case Rarity.Uncommon: return { speed: 4, zone: 20 };
        default: return { speed: 3, zone: 25 };
    }
};

const FishingMinigame: React.FC<FishingMinigameProps> = ({ itemOnLine, onComplete }) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
  // FIX: Pass initial value to useRef to fix "Expected 1 arguments, but got 0" error.
  const gameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const difficulty = getDifficulty(itemOnLine?.rarity || Rarity.Common);
  const successZoneStart = 50 - difficulty.zone / 2;
  const successZoneEnd = 50 + difficulty.zone / 2;

  useEffect(() => {
    gameRef.current = setInterval(() => {
      setPosition(prev => {
        const next = prev + direction * difficulty.speed;
        if (next >= 100 || next <= 0) {
          setDirection(d => -d);
        }
        return Math.max(0, Math.min(100, next));
      });
    }, 50);

    return () => {
        if(gameRef.current) {
            clearInterval(gameRef.current);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, difficulty.speed]);

  const handleReelClick = () => {
    if(gameRef.current) {
        clearInterval(gameRef.current);
    }
    const success = position >= successZoneStart && position <= successZoneEnd;
    onComplete(success);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900/80 rounded-lg">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">Something's on the line!</h3>
      <p className="text-gray-300 mb-6">Click 'Reel In!' when the marker is in the green zone!</p>

      <div className="w-full bg-gray-700 rounded-full h-8 mb-4 relative overflow-hidden border-2 border-gray-600">
        <div 
            className="absolute top-0 bg-green-500 h-full"
            style={{ left: `${successZoneStart}%`, width: `${difficulty.zone}%` }}
        />
        <div 
            className="absolute top-0 bg-red-500 h-full w-1"
            style={{ left: `${position}%` }}
        />
      </div>

      <button
        onClick={handleReelClick}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-lg"
      >
        Reel In!
      </button>
    </div>
  );
};

export default FishingMinigame;