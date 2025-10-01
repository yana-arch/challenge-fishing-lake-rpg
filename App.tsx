import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameStatus, ItemType } from './types';
import { CoinIcon, LevelIcon, FishIcon, ZapIcon } from './components/Icons';
import { RARITY_COLORS, SHOCK_DEVICE_COST } from './constants';
import FishingMinigame from './components/FishingMinigame';
import DivingMinigame from './components/DivingMinigame';
import Modal from './components/Modal';
import Shop from './components/Shop';
import Quests from './components/Quests';
import Leaderboard from './components/Leaderboard';
import Crafting from './components/Crafting';
import './styles/animations.css';

const App: React.FC = () => {
  const { player, status, logs, castLine, finishReeling, sellItem, itemOnLine, lastCaughtItem, acknowledgeCatch, bots, buyShockDevice, useElectricShock, equipRod, equipBait, buyRod, buyBait, startDiving, finishDivingCombat, startLakeCleaning, currentDanger, questProgress, claimQuestReward } = useGameLogic();
  const [activeTab, setActiveTab] = useState<'log' | 'actions' | 'shop' | 'quests' | 'leaderboard' | 'crafting'>('log');
  const xpForNextLevel = 100;
  const xpProgress = (player.xp % xpForNextLevel) / xpForNextLevel * 100;

  const PlayerInfoPanel: React.FC = () => (
    <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center mb-4">
        <img src={`https://picsum.photos/seed/${player.name}/80/80`} alt="avatar" className="w-16 h-16 rounded-full border-2 border-cyan-400 mr-4" />
        <div>
          <h2 className="text-xl font-bold text-cyan-300">{player.name}</h2>
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
                </div>
              </div>
              <div className="text-right">
                 <p className="text-yellow-400 font-semibold">{item.value}g</p>
                 <button onClick={() => sellItem(item.instanceId)} className="text-xs text-red-400 hover:text-red-300">Sell</button>
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
    </div>
  );

  const LakeView: React.FC = () => (
    <div className="relative w-full h-full bg-blue-900/50 rounded-lg overflow-hidden border-4 border-cyan-800/50 shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-blue-800/40"></div>
      <div className="absolute top-1/4 left-1/2 w-32 h-16 bg-green-700 rounded-full -translate-x-1/2 opacity-50 blur-md"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-12 bg-green-800 rounded-full opacity-50 blur-md"></div>
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
         return (
         <div 
            key={bot.id} 
            className="absolute text-center cursor-pointer group" 
            style={{top: bot.position.top, left: bot.position.left}}
            onClick={() => useElectricShock(bot.id)}
            >
           <img src={`https://picsum.photos/seed/${bot.name}/64/64`} alt={bot.name} className={`w-12 h-12 rounded-full border-2 border-gray-500 transition-all ${isStunned ? 'animate-bounce' : ''} group-hover:border-red-500`}/>
            <span className="mt-1 text-xs inline-block bg-black/50 px-1.5 py-0.5 rounded text-white">{bot.name}</span>
            {bot.isFishing && !isStunned &&
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gray-400/30 -rotate-45 origin-bottom-left"></div>
            }
            {isStunned &&
              <div className="absolute -top-2 -right-2 text-yellow-300">
                <ZapIcon className="w-6 h-6 animate-ping" />
              </div>
            }
         </div>
       )})}
    </div>
  );

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
    // For now, this is a placeholder - actual crafting logic would be in useGameLogic hook
    console.log(`Crafting: ${recipeId} - ${recipeName} - Success: ${success}`);
    // In a full implementation, this would trigger the crafting process in the game logic
  };

  return (
    <main className="min-h-screen bg-gray-900 bg-cover bg-center p-4 lg:p-8 font-sans" style={{backgroundImage: "url('https://picsum.photos/seed/lakebg/1920/1080')"}}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8 max-w-screen-2xl mx-auto h-[calc(100vh-4rem)]">
          <div className="lg:col-span-1 flex flex-col h-full">
            <PlayerInfoPanel/>
            <InventoryPanel/>
          </div>

          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex-grow">
              <LakeView />
            </div>
            <div className="flex-shrink-0 mt-4 space-y-2">
                <button
                    onClick={castLine}
                    disabled={status !== GameStatus.Idle && status !== GameStatus.Caught}
                    className="w-full text-2xl font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed
                    bg-cyan-600 text-white shadow-lg
                    enabled:hover:bg-cyan-500 enabled:hover:scale-105
                    disabled:bg-gray-600 disabled:text-gray-400"
                >
                    {getButtonText()}
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={startDiving}
                        disabled={status !== GameStatus.Idle && status !== GameStatus.Caught}
                        className="text-sm font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed
                        bg-blue-600 text-white shadow-lg
                        enabled:hover:bg-blue-500 enabled:hover:scale-105
                        disabled:bg-gray-600 disabled:text-gray-400"
                    >
                        🤿 Dive
                    </button>
                    <button
                        onClick={startLakeCleaning}
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

          <div className="lg:col-span-1 flex flex-col h-full bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
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

        <Modal isOpen={status === GameStatus.Caught && lastCaughtItem !== null} onClose={acknowledgeCatch}>
            <div className="text-center p-4">
                {lastCaughtItem?.type === ItemType.Bomb ? (
                    <>
                        <h2 className="text-2xl font-bold text-red-500 mb-2">BOOM!</h2>
                        <div className="mx-auto my-4 text-5xl">{lastCaughtItem?.icon}</div>
                        <p className="text-lg">You caught a <span className="font-semibold">{lastCaughtItem?.name}</span> and it exploded!</p>
                        <p className="text-gray-400 mt-1">{lastCaughtItem?.description}</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-green-400 mb-2">You Caught Something!</h2>
                        <div className={`mx-auto my-4 text-6xl ${RARITY_COLORS[lastCaughtItem?.rarity || 'Common']}`}>{lastCaughtItem?.icon}</div>
                        <p className="text-xl">It's a <span className={`font-semibold ${RARITY_COLORS[lastCaughtItem?.rarity || 'Common']}`}>{lastCaughtItem?.name}</span>!</p>
                        <p className="text-gray-400 mt-1">{lastCaughtItem?.description}</p>
                        <p className="mt-4 text-yellow-400 text-lg font-bold">Value: {lastCaughtItem?.value}g</p>
                    </>
                )}
                <button
                    onClick={acknowledgeCatch}
                    className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-transform duration-200 transform hover:scale-105"
                >
                    Awesome!
                </button>
            </div>
        </Modal>
    </main>
  );
};

export default App;
