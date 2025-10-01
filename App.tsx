import React, { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { useSoundManager } from './components/SoundManager';
import { SoundManagerProvider } from './components/SoundManager';
import { GameStatus, ItemType, Item } from './types';
import { CoinIcon, LevelIcon, FishIcon, ZapIcon } from './components/Icons';
import { RARITY_COLORS, SHOCK_DEVICE_COST, LAKE_BOMB_COST, CHEMICAL_BOTTLE_COST } from './constants';
import FishingMinigame from './components/FishingMinigame';
import DivingMinigame from './components/DivingMinigame';
import Modal from './components/Modal';
import Shop from './components/Shop';
import Quests from './components/Quests';
import Leaderboard from './components/Leaderboard';
import Crafting from './components/Crafting';
import './styles/animations.css';

const App: React.FC = () => {
  const { player, status, logs, castLine, finishReeling, sellItem, itemOnLine, lastCaughtItem, acknowledgeCatch, bots, buyShockDevice, useElectricShock, throwBombAtBot: throwBomb, dumpChemicalAtBot, careBotWithHealth, equipRod, equipBait, buyRod, buyBait, startDiving, finishDivingCombat, startLakeCleaning, currentDanger, questProgress, claimQuestReward, applyPenalty, calculateDebtInterest, applyDebtTax, repayDebt, debtPayAmount, setDebtPayAmount, eatFish, craftItem, shareFish } = useGameLogic();
  const { playSound } = useSoundManager();
  const [activeTab, setActiveTab] = useState<'log' | 'actions' | 'shop' | 'quests' | 'leaderboard' | 'crafting'>('log');
  const [showTutorial, setShowTutorial] = useState(!localStorage.getItem('tutorialCompleted'));
  const [disruptiveAction, setDisruptiveAction] = useState<'steal' | 'explode' | 'chemical' | null>(null);
  const [targetBotId, setTargetBotId] = useState<number | null>(null);
  const [showDebtModal, setShowDebtModal] = useState<boolean>(false);
  const xpForNextLevel = 100;
  const xpProgress = (player.xp % xpForNextLevel) / xpForNextLevel * 100;

  // Dynamic height adjustment using ResizeObserver
  useEffect(() => {
    const updateLakeHeight = () => {
      const playerInfo = document.getElementById('player-info-panel');
      const controls = document.getElementById('controls-area');
      const lake = document.getElementById('lake-view');

      if (playerInfo && controls && lake) {
        const playerHeight = playerInfo.offsetHeight;
        const controlsHeight = controls.offsetHeight;
        const availableHeight = window.innerHeight - playerHeight - controlsHeight - 200; // 200px margin
        lake.style.minHeight = `${Math.max(400, availableHeight)}px`;
      }
    };

    // Initial call
    updateLakeHeight();

    // ResizeObserver for elements
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target.id === 'player-info-panel' || entry.target.id === 'controls-area') {
          updateLakeHeight();
        }
      }
    });

    // Observe elements
    const playerPanel = document.getElementById('player-info-panel');
    const controlsArea = document.getElementById('controls-area');
    if (playerPanel) resizeObserver.observe(playerPanel);
    if (controlsArea) resizeObserver.observe(controlsArea);

    // Window resize listener
    const handleResize = () => updateLakeHeight();
    window.addEventListener('resize', handleResize);

    // Orientation change for mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(updateLakeHeight, 100); // Delay for orientation change
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateLakeHeight);
    };
  }, []);

  const PlayerInfoPanel: React.FC = () => (
    <div id="player-info-panel" className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700 gpu-accelerated">
      <div className="flex items-center mb-4">
        <img src={`https://picsum.photos/seed/${player.name}/80/80`} alt="avatar" className="w-16 h-16 rounded-full border-2 border-cyan-400 mr-4" />
        <div className="truncate">
          <h2 className="text-xl font-bold text-cyan-300 truncate-with-tooltip" title={player.name}>{player.name}</h2>
          <div className="flex items-center text-yellow-400 mt-1">
            <CoinIcon className="w-5 h-5 mr-1" />
            <span>{player.money}</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-semibold text-gray-300 flex items-center"><LevelIcon className="w-4 h-4 mr-1"/> Level {player.level}</span>
            <span className="text-gray-400">{player.xp % xpForNextLevel} / {xpForNextLevel} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${xpProgress}%` }}></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-cyan-300 flex items-center">
              <ZapIcon className="w-4 h-4 mr-1" />
              Energy
            </span>
            <span className="text-gray-300">{player.energy} / {player.maxEnergy}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-green-400 flex items-center">★ Reputation</span>
            <span className="text-green-400">{player.reputation}</span>
          </div>

          {player.inDebt && (
            <div className="bg-red-900/30 p-2 rounded mt-2 border border-red-500/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-400 flex items-center">💸 Debt</span>
                <span className="text-red-400 font-semibold">{player.debt}g</span>
              </div>
              <div className="mt-1">
                <button
                  onClick={() => setShowDebtModal(true)}
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 rounded"
                >
                  Repay Debt
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 mt-2">
            Polluted areas cleaned: {player.pollutionCleaned}
          </div>
        </div>
      </div>
    </div>
  );
  
  const InventoryPanel: React.FC = () => (
    <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg mt-4 border border-gray-700 flex-grow flex flex-col">
       <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-gray-700 pb-2">Inventory ({player.inventory.length}/20)</h3>
       <div className="overflow-y-auto pr-2 flex-grow">
        {player.inventory.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">Your bag is empty.</p>
        ) : (
          [...player.inventory].reverse().map((item) => (
            <div key={item.instanceId} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md mb-2">
              <div className="flex items-center">
                <div className="mr-3">{item.icon}</div>
                <div>
                  <p className={`font-semibold ${RARITY_COLORS[item.rarity]}`}>{item.name}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                  {item.energyValue && (
                    <p className="text-xs text-green-400">🍽️ Restore +{item.energyValue} energy</p>
                  )}
                </div>
              </div>
              <div className="text-right flex flex-col gap-1">
                 <p className="text-yellow-400 font-semibold">{item.value}g</p>
                 <div className="flex gap-1">
                   {item.edible && player.energy < player.maxEnergy && (
                     <button
                       onClick={() => eatFish(item.instanceId)}
                       className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                       disabled={player.energy >= player.maxEnergy}
                     >
                       Eat
                     </button>
                   )}
                   <button
                     onClick={() => {
                       const availableBots = bots.filter(b => b.state !== 'fainted' && b.health < 80);
                       if (availableBots.length > 0) {
                         careBotWithHealth(item.instanceId, availableBots[Math.floor(Math.random() * availableBots.length)].id);
                       } else {
                         careBotWithHealth(item.instanceId, Math.floor(Math.random() * bots.length) + 1);
                       }
                     }}
                     className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                   >
                     Care
                   </button>
                   <button
                     onClick={() => sellItem(item.instanceId)}
                     className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                   >
                     Sell
                   </button>
                 </div>
              </div>
            </div>
          ))
        )}
       </div>
    </div>
  );

  const GameLogPanel: React.FC = () => (
     <div className="overflow-y-auto flex-grow pr-2 flex flex-col-reverse">
        {logs.map((log, index) => (
        <p key={index} className="text-sm text-gray-300 mb-1 animate-fade-in">{log}</p>
        ))}
    </div>
  );

  const ActionsPanel: React.FC = () => (
    <div>
        <h3 className="text-lg font-bold text-cyan-300 mb-4">Actions</h3>
        <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-white">Electric Shock Device</p>
                    <p className="text-xs text-gray-400">Temporarily stuns another fisherman.</p>
                     <p className="text-sm text-yellow-400 mt-1">Cost: {SHOCK_DEVICE_COST}g</p>
                </div>
                <button
                    onClick={buyShockDevice}
                    disabled={player.money < SHOCK_DEVICE_COST}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Buy
                </button>
            </div>
            <p className="text-right text-sm mt-2">You have: {player.shockDevices}</p>
        </div>

        {/* Health-Related Disruptive Actions */}
        <div className="bg-yellow-900/20 p-3 rounded-lg mt-3 border border-yellow-500/30">
            <h4 className="text-yellow-300 font-semibold mb-2">💥 Disruptive Actions</h4>
            <div className="space-y-2">
                <div>
                    <p className="text-sm text-gray-300">Lake Bomb - Area damage to all nearby bots</p>
                    <button
                        disabled={player.money < LAKE_BOMB_COST}
                        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-50"
                        onClick={() => setDisruptiveAction('explode')}
                    >
                        Detonate ({LAKE_BOMB_COST}g)
                    </button>
                </div>
                <div>
                    <p className="text-sm text-gray-300">Chemical Bomb - Periodic damage to nearby bots</p>
                    <button
                        disabled={player.money < CHEMICAL_BOTTLE_COST}
                        className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded disabled:opacity-50"
                        onClick={() => setDisruptiveAction('chemical')}
                    >
                        Dump ({CHEMICAL_BOTTLE_COST}g)
                    </button>
                </div>
            </div>
            <p className="text-xs text-red-400 mt-2">⚠️ Damages bot health, affects reputation, may trigger penalties!</p>
        </div>
    </div>
  );

  const getPollutionEffect = (pollutionLevel: number) => {
    if (pollutionLevel >= 50) return 'high';
    if (pollutionLevel >= 25) return 'medium';
    return 'low';
  };

  const LakeView: React.FC = () => {
    const pollutionLevel = getPollutionEffect(player.pollutionLevel);
    const pollutionOpacity = player.pollutionLevel > 0 ? 0.1 + (player.pollutionLevel / 100) * 0.4 : 0;
    const pollutionColor = pollutionLevel === 'high' ? 'bg-red-900/50' : pollutionLevel === 'medium' ? 'bg-yellow-900/50' : 'bg-blue-900/30';

    return (
      <div id="lake-view" className="relative w-full h-full bg-blue-900/50 rounded-lg overflow-hidden border-4 border-cyan-800/50 shadow-inner gpu-accelerated">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-blue-800/40"></div>
        <div className={`absolute inset-0 ${pollutionColor}`} style={{ opacity: pollutionOpacity }}></div>
        <div className="absolute top-1/4 left-1/2 w-32 h-16 bg-green-700 rounded-full -translate-x-1/2 opacity-50 blur-md"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-12 bg-green-800 rounded-full opacity-50 blur-md"></div>
        <div className="absolute top-4 left-4 bg-black/50 p-2 rounded text-white text-sm">
          Pollution: {player.pollutionLevel} ({pollutionLevel.toUpperCase()})
        </div>
       {/* Player Avatar */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
            <img src={`https://picsum.photos/seed/${player.name}/80/80`} alt="player" className="w-20 h-20 rounded-full border-4 border-cyan-300 shadow-lg"/>
            <span className="mt-2 inline-block bg-black/50 px-2 py-1 rounded text-white font-semibold">{player.name}</span>
            {status !== GameStatus.Idle && status !== GameStatus.Caught && 
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-2 h-16 bg-gray-400/50 -rotate-45 origin-bottom-left"></div>
            }
       </div>
       {/* Bots */}
       {bots.map(bot => {
         const isStunned = bot.stunnedUntil && Date.now() < bot.stunnedUntil;
         const healthPercent = (bot.health / bot.maxHealth) * 100;
         const healthColor = bot.state === 'fainted' ? 'bg-gray-600' :
                           bot.state === 'weak' ? 'bg-red-500' :
                           bot.state === 'tired' ? 'bg-yellow-500' :
                           bot.state === 'caution' ? 'bg-orange-500' : 'bg-green-500';

         return (
         <div
            key={bot.id}
            className="absolute text-center cursor-pointer group"
            style={{top: bot.position.top, left: bot.position.left}}
            onClick={() => useElectricShock(bot.id)}
            >
           {/* Health Bar */}
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
             <div
               className={`h-full ${healthColor} transition-all duration-300`}
               style={{ width: `${healthPercent}%` }}
             ></div>
           </div>

           <img src={`https://picsum.photos/seed/${bot.name}/64/64`} alt={bot.name} className={`w-12 h-12 rounded-full border-2 border-gray-500 transition-all ${isStunned ? 'animate-bounce' : ''} ${bot.state === 'fainted' ? 'grayscale opacity-50' : ''} group-hover:border-red-500`}/>
            <span className={`mt-1 text-xs inline-block bg-black/50 px-1.5 py-0.5 rounded text-white ${bot.state === 'fainted' ? 'line-through' : ''}`}>
              {bot.state === 'fainted' ? `💔 ${bot.name}` : bot.name}
            </span>
            {bot.isFishing && !isStunned && bot.state !== 'fainted' && bot.health >= 30 &&
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gray-400/30 -rotate-45 origin-bottom-left"></div>
            }
            {isStunned &&
              <div className="absolute -top-2 -right-2 text-yellow-300">
                <ZapIcon className="w-6 h-6 animate-ping" />
              </div>
            }
            {bot.state === 'weak' && !isStunned &&
              <div className="absolute -top-1 -right-1 text-red-400 text-xs">😷</div>
            }
         </div>
       )})}
    </div>
  );
};

  const getButtonText = () => {
    switch(status) {
        case GameStatus.Idle:
        case GameStatus.Caught:
            return 'Cast Line';
        case GameStatus.Casting:
            return 'Casting...';
        case GameStatus.Waiting:
            return 'Waiting...';
        case GameStatus.Reeling:
            return 'Reeling!';
        case GameStatus.Diving:
            return 'Diving...';
        case GameStatus.DivingCombat:
            return 'Fighting!';
        case GameStatus.CleaningLake:
            return 'Cleaning...';
        default:
            return '...';
    }
  }

  const handleCrafting = (recipeId: string, recipeName: string, success: boolean) => {
    craftItem(recipeId, recipeName);
  };

  return (
    <main className="min-h-screen bg-gray-900 bg-cover bg-center p-4 lg:p-8 font-sans" style={{backgroundImage: "url('https://picsum.photos/seed/lakebg/1920/1080')"}}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8 max-w-screen-2xl mx-auto h-[calc(100vh-4rem)]">
          <div className="lg:col-span-1 flex flex-col h-full overflow-auto">
            <PlayerInfoPanel/>
            <InventoryPanel/>
          </div>

          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex-grow">
              <LakeView />
            </div>
            <div id="controls-area" className="flex-shrink-0 mt-4 space-y-2 gpu-accelerated">
                <button
                    onClick={() => {
                      playSound('fishingCast');
                      castLine();
                    }}
                    disabled={status !== GameStatus.Idle && status !== GameStatus.Caught}
                    className="w-full text-2xl font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed btn-responsive
                    bg-cyan-600 text-white shadow-lg focus-visible
                    enabled:hover:bg-cyan-500 enabled:hover:scale-105
                    disabled:bg-gray-600 disabled:text-gray-400"
                >
                    {getButtonText()}
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => {
                          playSound('divingStart');
                          startDiving();
                        }}
                        disabled={status !== GameStatus.Idle && status !== GameStatus.Caught}
                        className="text-sm font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed
                        bg-blue-600 text-white shadow-lg
                        enabled:hover:bg-blue-500 enabled:hover:scale-105
                        disabled:bg-gray-600 disabled:text-gray-400"
                    >
                        🤿 Dive
                    </button>
                    <button
                        onClick={() => {
                          playSound('cleanupComplete');
                          startLakeCleaning();
                        }}
                        disabled={status !== GameStatus.Idle && status !== GameStatus.Caught}
                        className="text-sm font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed
                        bg-green-600 text-white shadow-lg
                        enabled:hover:bg-green-500 enabled:hover:scale-105
                        disabled:bg-gray-600 disabled:text-gray-400"
                    >
                        🧽 Clean
                    </button>
                </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col h-full bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 overflow-auto">
            <div className="flex-shrink-0 border-b border-gray-700 overflow-x-auto">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('log')}
                  className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'log' ? 'bg-gray-700 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  Game Log
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'actions' ? 'bg-gray-700 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  Actions
                </button>
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'shop' ? 'bg-gray-700 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  Shop
                </button>
                <button
                  onClick={() => setActiveTab('quests')}
                  className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'quests' ? 'bg-gray-700 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  Quests
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-gray-700 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab('crafting')}
                  className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'crafting' ? 'bg-gray-700 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  Crafting
                </button>
              </div>
            </div>

            <Modal isOpen={showTutorial} onClose={() => {
              setShowTutorial(false);
              localStorage.setItem('tutorialCompleted', 'true');
            }}>
              <div className="text-center p-6 max-w-md">
                <h2 className="text-2xl font-bold text-cyan-300 mb-4">Welcome to Hồ Câu Thử Thách!</h2>
                <div className="space-y-4 text-left text-gray-300">
                  <div>
                    <h3 className="font-semibold text-white mb-2">🎣 Câu Cá:</h3>
                    <p className="text-sm">Click "Cast Line", wait, then click "Reel In" when the marker is in the green zone.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">🤿 Lặn:</h3>
                    <p className="text-sm">Dive for rare items but beware of dangers!</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">🧽 Dọn Rác:</h3>
                    <p className="text-sm">Clean the lake to reduce pollution and catch better fish.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">⚡ Chích Điện:</h3>
                    <p className="text-sm">Buy shock devices and zap other fishermen to stun them.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">💡 Mẹo:</h3>
                    <p className="text-sm">Higher pollution reduces catch rates. Clean the lake to improve fishing!</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    localStorage.setItem('tutorialCompleted', 'true');
                  }}
                  className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
                >
                  Let's Go Fishing!
                </button>
              </div>
            </Modal>

            <div className="p-4 flex-grow flex flex-col overflow-y-auto">
              {activeTab === 'log' && <GameLogPanel />}
              {activeTab === 'actions' && <ActionsPanel />}
              {activeTab === 'shop' && <Shop playerMoney={player.money} onBuyRod={buyRod} onBuyBait={buyBait} />}
              {activeTab === 'quests' && <Quests playerLevel={player.level} playerMoney={player.money} questProgress={questProgress} onClaimReward={claimQuestReward} />}
              {activeTab === 'leaderboard' && <Leaderboard currentPlayerName={player.name} currentPlayerLevel={player.level} currentPlayerMoney={player.money} />}
              {activeTab === 'crafting' && <Crafting playerInventory={player.inventory} playerLevel={player.level} playerMoney={player.money} onCraft={(recipeId, recipeName, success) => handleCrafting(recipeId, recipeName, success)} />}
            </div>
          </div>
        </div>

        <Modal isOpen={status === GameStatus.Reeling} showCloseButton={false}>
          {itemOnLine && <FishingMinigame itemOnLine={itemOnLine} onComplete={finishReeling} />}
        </Modal>

        <Modal isOpen={status === GameStatus.DivingCombat} showCloseButton={false}>
          <DivingMinigame danger={currentDanger} onComplete={finishDivingCombat} />
        </Modal>

        <Modal isOpen={status === GameStatus.Caught} onClose={acknowledgeCatch}>
            <div className="text-center p-4">
                {lastCaughtItem && (lastCaughtItem.type === ItemType.Bomb || lastCaughtItem.type === 'Bomb') ? (
                    <>
                        <h2 className="text-2xl font-bold text-red-500 mb-2">💣 Throw the Bomb!</h2>
                        <div className="mx-auto my-4 text-5xl">{lastCaughtItem.icon}</div>
                        <p className="text-lg mb-4">You caught <span className="font-semibold text-red-400">{lastCaughtItem.name}</span>!</p>
                        <p className="text-sm text-orange-300 mb-4">Choose who to throw it at (they'll be stunned for 15 seconds):</p>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                            {bots.map(bot => (
                                <button
                                    key={bot.id}
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
                                    onClick={() => {
                                        throwBomb(bot.id);
                                        acknowledgeCatch();
                                    }}
                                >
                                    Throw at {bot.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={acknowledgeCatch}
                            className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Don't Throw (Discard Bomb)
                        </button>
                    </>
                ) : lastCaughtItem ? (
                    lastCaughtItem.type === ItemType.Bomb ? (
                        <>
                            <h2 className="text-2xl font-bold text-red-500 mb-2">BOOM!</h2>
                            <div className="mx-auto my-4 text-5xl">{lastCaughtItem.icon}</div>
                            <p className="text-lg">You caught a <span className="font-semibold">{lastCaughtItem.name}</span> and it exploded!</p>
                            <p className="text-gray-400 mt-1">{lastCaughtItem.description}</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-green-400 mb-2">You Caught Something!</h2>
                            <div className={`mx-auto my-4 text-6xl ${RARITY_COLORS[lastCaughtItem.rarity || 'Common']}`}>{lastCaughtItem.icon}</div>
                            <p className="text-xl">It's a <span className={`font-semibold ${RARITY_COLORS[lastCaughtItem.rarity || 'Common']}`}>{lastCaughtItem.name}</span>!</p>
                            <p className="text-gray-400 mt-1">{lastCaughtItem.description}</p>
                            <p className="mt-4 text-yellow-400 text-lg font-bold">Value: {lastCaughtItem.value}g</p>
                        </>
                    )
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-orange-400 mb-2">Missed It!</h2>
                        <div className="mx-auto my-4 text-6xl">💭</div>
                        <p className="text-xl">The catch got away...</p>
                        <p className="text-gray-400 mt-1">Better luck next time!</p>
                    </>
                )}
                {lastCaughtItem && !(lastCaughtItem.type === ItemType.Bomb || lastCaughtItem.type === 'Bomb') && (
                    <button
                        onClick={acknowledgeCatch}
                        className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-transform duration-200 transform hover:scale-105"
                    >
                        Awesome!
                    </button>
                )}
            </div>
        </Modal>

        {/* Disruptive Action Confirmation Modals */}
        <Modal isOpen={disruptiveAction === 'explode'} onClose={() => setDisruptiveAction(null)}>
          <div className="p-6 max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">💥 Lake Bomb - Choose Target Area</h2>
            <div className="text-center mb-6">
              <div className="mx-auto my-4 text-6xl">💣</div>
              <p className="text-sm text-yellow-300 mb-2">This will damage <strong>ALL nearby bots</strong> in the blast radius!</p>
              <p className="text-sm text-red-300">Cost: {LAKE_BOMB_COST}g • -15 Reputation • Pollution increase</p>
              <p className="text-xs text-gray-400 mt-2">High chance of detection and penalties!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  throwBomb(0); // 0 means area damage
                  setDisruptiveAction(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-semibold"
              >
                Detonate Bomb!
              </button>
              <button
                onClick={() => setDisruptiveAction(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={disruptiveAction === 'chemical'} onClose={() => setDisruptiveAction(null)}>
          <div className="p-6 max-w-md">
            <h2 className="text-2xl font-bold text-green-400 mb-4">🧪 Chemical Dump - Choose Target</h2>
            <div className="text-center mb-6">
              <div className="mx-auto my-4 text-6xl">🧪</div>
              <p className="text-sm text-yellow-300 mb-2">This will <strong>periodically damage nearby bots</strong>!</p>
              <p className="text-sm text-red-300">Cost: {CHEMICAL_BOTTLE_COST}g • -10 Reputation • Pollution +10 • 4-hour duration</p>
              <p className="text-xs text-gray-400 mt-2">Steady, invisible damage...</p>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-gray-300">Select target bot:</p>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {bots.filter(bot => bot.state !== 'fainted').map(bot => (
                  <button
                    key={bot.id}
                    className="bg-gray-700 hover:bg-red-600 text-left py-2 px-3 rounded text-sm transition-colors"
                    onClick={() => {
                      dumpChemicalAtBot(bot.id);
                      setDisruptiveAction(null);
                    }}
                  >
                    {bot.name} (Health: {Math.round((bot.health / bot.maxHealth) * 100)}%)
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setDisruptiveAction(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </Modal>

        <Modal isOpen={showDebtModal} onClose={() => setShowDebtModal(false)}>
            <div className="p-6 max-w-sm">
                <h2 className="text-2xl font-bold text-red-400 mb-4">💸 Debt Repayment</h2>
                <div className="space-y-3 mb-4">
                    <div className="bg-gray-800 p-3 rounded">
                        <div className="flex justify-between text-sm">
                            <span>Current Debt:</span>
                            <span className="text-red-400 font-semibold">{player.debt}g</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span>Available Gold:</span>
                            <span className="text-yellow-400 font-semibold">{player.money}g</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Amount to Repay:
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={Math.min(player.debt, player.money)}
                            value={debtPayAmount}
                            onChange={(e) => setDebtPayAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                            placeholder="Enter amount"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setDebtPayAmount(Math.min(player.debt, player.money))}
                                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                All
                            </button>
                            <button
                                onClick={() => setDebtPayAmount(Math.min(player.debt, player.money, 100))}
                                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                100g
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (debtPayAmount > 0) repayDebt(debtPayAmount);
                            setShowDebtModal(false);
                            setDebtPayAmount(0);
                        }}
                        disabled={debtPayAmount <= 0 || debtPayAmount > Math.min(player.debt, player.money)}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-semibold"
                    >
                        Repay {debtPayAmount}g
                    </button>
                    <button
                        onClick={() => {
                            setShowDebtModal(false);
                            setDebtPayAmount(0);
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    </main>
  );
};

export default App;
