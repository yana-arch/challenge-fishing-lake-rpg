import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: number;
  name: string;
  level: number;
  totalValue: number;
  fishCaught: number;
  reputation: number;
  rank: number;
}

interface LeaderboardProps {
  currentPlayerName: string;
  currentPlayerLevel: number;
  currentPlayerMoney: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  currentPlayerName,
  currentPlayerLevel,
  currentPlayerMoney
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'level' | 'totalValue' | 'fishCaught' | 'reputation'>('level');

  useEffect(() => {
    // Generate mock leaderboard data
    const generateLeaderboard = (): LeaderboardEntry[] => {
      const botNames = [
        'Angler_Andy', 'Fisher_Fiona', 'Reel_Rachel', 'Caster_Carl',
        'Bass_Bob', 'Trout_Tracy', 'Pike_Pat', 'Carp_Cindy',
        'Salmon_Sam', 'Tuna_Tony', 'Shark_Shelia', 'Eel_Ed'
      ];

      const entries: LeaderboardEntry[] = botNames.map((name, index) => ({
        id: index + 1,
        name,
        level: Math.floor(Math.random() * 50) + 1,
        totalValue: Math.floor(Math.random() * 10000) + 100,
        fishCaught: Math.floor(Math.random() * 500) + 10,
        reputation: Math.floor(Math.random() * 1000) + 50,
        rank: 0, // Will be calculated based on sort
      }));

      // Add current player
      entries.push({
        id: 999,
        name: currentPlayerName,
        level: currentPlayerLevel,
        totalValue: currentPlayerMoney,
        fishCaught: Math.floor(Math.random() * 100) + 5, // Mock data for demo
        reputation: Math.floor(Math.random() * 200) + 25, // Mock data for demo
        rank: 0,
      });

      return entries;
    };

    setLeaderboardData(generateLeaderboard());
  }, [currentPlayerName, currentPlayerLevel, currentPlayerMoney]);

  const sortLeaderboard = (data: LeaderboardEntry[], sortBy: string): LeaderboardEntry[] => {
    const sorted = [...data].sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level;
        case 'totalValue':
          return b.totalValue - a.totalValue;
        case 'fishCaught':
          return b.fishCaught - a.fishCaught;
        case 'reputation':
          return b.reputation - a.reputation;
        default:
          return b.level - a.level;
      }
    });

    // Assign ranks
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  };

  const sortedLeaderboard = sortLeaderboard(leaderboardData, sortBy);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 border-yellow-400';
      case 2: return 'text-gray-400 border-gray-400';
      case 3: return 'text-amber-600 border-amber-600';
      default: return 'text-gray-300 border-gray-600';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">🏆 Leaderboard</h2>

      {/* Sort Options */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 bg-gray-900/50 p-2 rounded-lg">
          {[
            { key: 'level', label: 'Level' },
            { key: 'totalValue', label: 'Wealth' },
            { key: 'fishCaught', label: 'Fish Caught' },
            { key: 'reputation', label: 'Reputation' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as any)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                sortBy === option.key
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedLeaderboard.map((entry) => {
          const isCurrentPlayer = entry.name === currentPlayerName;

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isCurrentPlayer
                  ? 'bg-cyan-900/30 border-cyan-400'
                  : 'bg-gray-900/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${isCurrentPlayer ? 'text-cyan-300' : 'text-white'}`}>
                      {entry.name}
                    </span>
                    {isCurrentPlayer && (
                      <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Level {entry.level}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {sortBy === 'level' && `Level ${entry.level}`}
                  {sortBy === 'totalValue' && `${formatNumber(entry.totalValue)}g`}
                  {sortBy === 'fishCaught' && `${formatNumber(entry.fishCaught)} fish`}
                  {sortBy === 'reputation' && `${formatNumber(entry.reputation)} rep`}
                </div>
                <div className="text-xs text-gray-400">
                  Rank #{entry.rank}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Your Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-900/50 p-3 rounded">
            <div className="text-gray-400">Current Level</div>
            <div className="text-xl font-bold text-cyan-300">{currentPlayerLevel}</div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded">
            <div className="text-gray-400">Total Wealth</div>
            <div className="text-xl font-bold text-yellow-400">{formatNumber(currentPlayerMoney)}g</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
