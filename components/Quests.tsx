import React, { useState, useEffect } from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  requirements: {
    type: 'catch_fish' | 'earn_money' | 'use_shock' | 'dive' | 'sell_items';
    target: number;
    current?: number;
  };
  rewards: {
    xp: number;
    money: number;
    items?: string[];
  };
  completed: boolean;
  claimed: boolean;
  expiresAt?: Date;
}

interface QuestsProps {
  playerLevel: number;
  playerMoney: number;
  questProgress: { [questId: string]: number };
  onClaimReward: (questId: string) => void;
}

const Quests: React.FC<QuestsProps> = ({ playerLevel, playerMoney, questProgress, onClaimReward }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [lastReset, setLastReset] = useState<Date>(new Date());

  // Generate quests based on player level and progress
  useEffect(() => {
    const generateQuests = (): Quest[] => {
      const dailyQuests: Quest[] = [
        {
          id: 'daily_catch_5',
          title: 'Catch 5 Fish',
          description: 'Catch any 5 fish from the lake',
          type: 'daily',
          requirements: {
            type: 'catch_fish',
            target: 5,
            current: questProgress['catch_fish_current'] || questProgress['catch_fish'] || 0,
          },
          rewards: {
            xp: 50,
            money: 25,
          },
          completed: false,
          claimed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        {
          id: 'daily_earn_100',
          title: 'Earn 100 Gold',
          description: 'Earn 100 gold from selling items',
          type: 'daily',
          requirements: {
            type: 'earn_money',
            target: 100,
            current: questProgress['sell_items_current'] || questProgress['sell_items'] || 0,
          },
          rewards: {
            xp: 75,
            money: 30,
          },
          completed: false,
          claimed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          id: 'daily_shock_2',
          title: 'Shock 2 Fishermen',
          description: 'Use electric shock on 2 other fishermen',
          type: 'daily',
          requirements: {
            type: 'use_shock',
            target: 2,
            current: questProgress['use_shock_current'] || questProgress['use_shock'] || 0,
          },
          rewards: {
            xp: 100,
            money: 50,
          },
          completed: false,
          claimed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ];

      const weeklyQuests: Quest[] = [
        {
          id: 'weekly_catch_50',
          title: 'Master Angler',
          description: 'Catch 50 fish this week',
          type: 'weekly',
          requirements: {
            type: 'catch_fish',
            target: 50,
            current: questProgress['catch_fish_current'] || questProgress['catch_fish'] || 0,
          },
          rewards: {
            xp: 500,
            money: 200,
          },
          completed: false,
          claimed: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
        {
          id: 'weekly_dive_10',
          title: 'Deep Diver',
          description: 'Complete 10 successful dives',
          type: 'weekly',
          requirements: {
            type: 'dive',
            target: 10,
            current: questProgress['dive_current'] || questProgress['dive'] || 0,
          },
          rewards: {
            xp: 750,
            money: 300,
          },
          completed: false,
          claimed: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'weekly_clean_20',
          title: 'Environmental Hero',
          description: 'Clean up 20 polluted areas',
          type: 'weekly',
          requirements: {
            type: 'sell_items',
            target: 20,
            current: questProgress['clean_pollution_current'] || questProgress['clean_pollution'] || 0,
          },
          rewards: {
            xp: 600,
            money: 250,
          },
          completed: false,
          claimed: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ];

      const achievementQuests: Quest[] = [
        {
          id: 'achievement_level_10',
          title: 'Experienced Angler',
          description: 'Reach level 10',
          type: 'achievement',
          requirements: {
            type: 'catch_fish',
            target: 10,
            current: playerLevel,
          },
          rewards: {
            xp: 1000,
            money: 500,
          },
          completed: playerLevel >= 10,
          claimed: false,
        },
        {
          id: 'achievement_rich',
          title: 'Wealthy Fisher',
          description: 'Accumulate 1000 gold',
          type: 'achievement',
          requirements: {
            type: 'earn_money',
            target: 1000,
            current: playerMoney,
          },
          rewards: {
            xp: 800,
            money: 200,
          },
          completed: playerMoney >= 1000,
          claimed: false,
        },
        {
          id: 'achievement_cleaner',
          title: 'Lake Guardian',
          description: 'Clean 100 polluted areas',
          type: 'achievement',
          requirements: {
            type: 'sell_items',
            target: 100,
            current: questProgress['clean_pollution_current'] || questProgress['clean_pollution'] || 0,
          },
          rewards: {
            xp: 1500,
            money: 750,
          },
          completed: (questProgress['clean_pollution_current'] || questProgress['clean_pollution'] || 0) >= 100,
          claimed: false,
        },
      ];

      return [...dailyQuests, ...weeklyQuests, ...achievementQuests];
    };

    setQuests(generateQuests());
  }, [playerLevel, playerMoney, questProgress]);

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    }

    return `${hours}h ${minutes}m`;
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'achievement': return '🏆';
      default: return '❓';
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">Quest Board</h2>

      <div className="space-y-6">
        {['daily', 'weekly', 'achievement'].map((questType) => (
          <div key={questType}>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 capitalize border-b border-gray-600 pb-2">
              {getQuestIcon(questType)} {questType} Quests
            </h3>

            <div className="space-y-3">
              {quests
                .filter(quest => quest.type === questType)
                .map((quest) => {
                  const progressPercentage = quest.requirements.current
                    ? (quest.requirements.current / quest.requirements.target) * 100
                    : 0;

                  return (
                    <div
                      key={quest.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        quest.completed
                          ? 'bg-green-900/30 border-green-600'
                          : 'bg-gray-900/50 border-gray-600 hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{quest.title}</h4>
                          <p className="text-sm text-gray-300 mb-2">{quest.description}</p>

                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>
                                {quest.requirements.current || 0} / {quest.requirements.target}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${getProgressColor(
                                  quest.requirements.current || 0,
                                  quest.requirements.target
                                )}`}
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Rewards */}
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-400">+{quest.rewards.xp} XP</span>
                            <span className="text-yellow-400">+{quest.rewards.money}g</span>
                          </div>
                        </div>

                        <div className="ml-4 text-right">
                          {quest.type !== 'achievement' && quest.expiresAt && (
                            <div className="text-xs text-gray-400 mb-2">
                              {formatTimeRemaining(quest.expiresAt)}
                            </div>
                          )}

                          {quest.completed && !quest.claimed ? (
                            <button
                              onClick={() => onClaimReward(quest.id)}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
                            >
                              Claim
                            </button>
                          ) : quest.claimed ? (
                            <span className="text-green-400 text-sm font-semibold">✓ Claimed</span>
                          ) : quest.completed ? (
                            <span className="text-yellow-400 text-sm">Complete!</span>
                          ) : (
                            <span className="text-gray-400 text-sm">In Progress</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quests;
