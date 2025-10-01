import { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameStatus, Item, InventoryItem, Bot, Rod, Bait, DangerType } from '../types';
import { ALL_ITEMS, INITIAL_PLAYER_STATE, XP_PER_LEVEL, RARITY_WEIGHTS, BOTS, SHOCK_DEVICE_COST, SHOCK_STUN_DURATION_MS, SHOCK_CAUGHT_CHANCE, SHOCK_FINE, ALL_RODS, ALL_BAITS, ENERGY_COST_FISHING, ENERGY_COST_DIVING, ENERGY_COST_CLEANING, ENERGY_REGEN_RATE } from '../constants';

const SAVE_KEY = 'challengeFishingLakeSave';

export const useGameLogic = () => {
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER_STATE);
  const [status, setStatus] = useState<GameStatus>(GameStatus.Idle);
  const [logs, setLogs] = useState<string[]>(['Welcome to Challenge Fishing Lake!']);
  const [itemOnLine, setItemOnLine] = useState<Item | null>(null);
  const [lastCaughtItem, setLastCaughtItem] = useState<InventoryItem | null>(null);
  const [bots, setBots] = useState<Bot[]>(BOTS);
  const [currentDanger, setCurrentDanger] = useState<DangerType>(DangerType.Shark);
  const [questProgress, setQuestProgress] = useState<{ [questId: string]: number }>({});

  // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [message, ...prev.slice(0, 14)]);
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure new properties exist on loaded data
        const initialStateWithSave = { ...INITIAL_PLAYER_STATE, ...parsedData };
        setPlayer(initialStateWithSave);
        addLog("Game loaded successfully!");
      } catch (e) {
        addLog("Could not load save data. Starting new game.");
      }
    }
  }, [addLog]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(player));
  }, [player]);

  useEffect(() => {
     const botInterval = setInterval(() => {
        setBots(currentBots => currentBots.map(bot => {
            const isStunned = bot.stunnedUntil && Date.now() < bot.stunnedUntil;
            
            // If stun wore off, update state
            if (bot.stunnedUntil && !isStunned) {
                addLog(`${bot.name} recovered from the shock.`);
                return { ...bot, stunnedUntil: undefined, isFishing: false };
            }
            
            if (isStunned) return bot; // Stunned bots do nothing

            if (Math.random() < 0.2) {
                return { ...bot, isFishing: !bot.isFishing };
            }
            return bot;
        }));

        const activeBots = bots.filter(b => b.isFishing && !(b.stunnedUntil && Date.now() < b.stunnedUntil));
        if (activeBots.length > 0 && Math.random() < 0.1) {
            const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
            const randomFish = ALL_ITEMS.filter(i => i.type === 'Fish')[Math.floor(Math.random() * 5)];
            addLog(`${randomBot.name} caught a ${randomFish.name}!`);
        }
    }, 5000);

    return () => clearInterval(botInterval);
  }, [bots, addLog]);


  const getCatch = (): Item => {
    // Base rarity weights
    let adjustedWeights = { ...RARITY_WEIGHTS };

    // Apply bait multiplier if equipped
    if (player.equippedBait) {
      // Find fish items and adjust their weights based on bait multipliers
      const fishItems = ALL_ITEMS.filter(item => item.type === 'Fish');
      fishItems.forEach(fish => {
        const multiplier = player.equippedBait.fishTypeMultiplier[fish.id] || 1.0;
        // Adjust the rarity weight based on the fish's rarity
        const rarity = fish.rarity;
        adjustedWeights[rarity] = Math.floor(adjustedWeights[rarity] * multiplier);
      });
    }

    // Apply rod success rate bonus
    if (player.equippedRod) {
      const bonusMultiplier = player.equippedRod.successRate;
      Object.keys(adjustedWeights).forEach(rarity => {
        const rarityKey = rarity as keyof typeof RARITY_WEIGHTS;
        adjustedWeights[rarityKey] = Math.floor(adjustedWeights[rarityKey] * bonusMultiplier);
      });
    }

    const totalWeight = Object.values(adjustedWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const rarity in adjustedWeights) {
        const typedRarity = rarity as keyof typeof RARITY_WEIGHTS;
        if (random < adjustedWeights[typedRarity]) {
            const possibleItems = ALL_ITEMS.filter(item => item.rarity === typedRarity);
            return possibleItems[Math.floor(Math.random() * possibleItems.length)];
        }
        random -= adjustedWeights[typedRarity];
    }
    return ALL_ITEMS.find(item => item.id === 'junk_2')!; // Default to seaweed
  };

  const castLine = useCallback(() => {
    if (status !== GameStatus.Idle) return;

    // Check energy
    if (player.energy < ENERGY_COST_FISHING) {
      addLog("You're too tired to fish! Rest or wait for energy to regenerate.");
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setStatus(GameStatus.Casting);
    setPlayer(prev => ({ ...prev, energy: Math.max(0, prev.energy - ENERGY_COST_FISHING) }));
    addLog('You cast your line...');

    timeoutRef.current = setTimeout(() => {
      setStatus(GameStatus.Waiting);
      addLog('Waiting for a bite...');

      const waitTime = Math.random() * 5000 + 2000;
      timeoutRef.current = setTimeout(() => {
        const caughtItem = getCatch();
        setItemOnLine(caughtItem);
        setStatus(GameStatus.Reeling);
        addLog('Something is biting! Reel it in!');
      }, waitTime);
    }, 1500);
  }, [status, player.energy, addLog]);

  const finishReeling = useCallback((success: boolean) => {
    if (!itemOnLine) return;

    if (success) {
      const newInventoryItem: InventoryItem = { ...itemOnLine, instanceId: crypto.randomUUID() };
      setLastCaughtItem(newInventoryItem);

      if (itemOnLine.type === 'Bomb') {
          addLog(`💥 You caught a ${itemOnLine.name}! It exploded!`);
          // This is where you would add screen shake or other effects
      } else {
           addLog(`You caught a ${itemOnLine.name}!`);
      }
     
      setPlayer(prev => {
        const newXp = prev.xp + itemOnLine.value;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        const newInventory = [...prev.inventory, newInventoryItem];
        return { ...prev, xp: newXp, level: newLevel, inventory: newInventory };
      });
    } else {
      setLastCaughtItem(null);
      addLog('The catch got away...');
    }
    
    setStatus(GameStatus.Caught);
    setItemOnLine(null);
  }, [itemOnLine, addLog]);

  const sellItem = useCallback((instanceId: string) => {
    const itemToSell = player.inventory.find(i => i.instanceId === instanceId);
    if (!itemToSell) return;

    setPlayer(prev => ({
      ...prev,
      money: prev.money + itemToSell.value,
      inventory: prev.inventory.filter(i => i.instanceId !== instanceId),
      reputation: itemToSell.type === 'Junk' ? prev.reputation + 2 : prev.reputation, // Bonus reputation for selling junk
    }));
    addLog(`Sold ${itemToSell.name} for ${itemToSell.value} gold.${itemToSell.type === 'Junk' ? ' +2 Reputation' : ''}`);
  }, [player.inventory, addLog]);
  
  const acknowledgeCatch = useCallback(() => {
    setStatus(GameStatus.Idle);
    setLastCaughtItem(null);
  }, []);

  const buyShockDevice = useCallback(() => {
    if (player.money >= SHOCK_DEVICE_COST) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money - SHOCK_DEVICE_COST,
        shockDevices: prev.shockDevices + 1,
      }));
      addLog(`Purchased 1 Electric Shock Device for ${SHOCK_DEVICE_COST}g.`);
    } else {
      addLog("Not enough gold to buy a shock device.");
    }
  }, [player.money, addLog]);

  const useElectricShock = useCallback((targetBotId: number) => {
    if (player.shockDevices <= 0) {
      addLog("You don't have any shock devices!");
      return;
    }

    const targetBot = bots.find(b => b.id === targetBotId);
    if (!targetBot) return;

    // Check if bot is already stunned
    if (targetBot.stunnedUntil && Date.now() < targetBot.stunnedUntil) {
      addLog(`${targetBot.name} is already stunned!`);
      return;
    }

    setPlayer(prev => ({
      ...prev,
      shockDevices: prev.shockDevices - 1,
      reputation: Math.max(0, prev.reputation - 5) // Reputation penalty for PvP
    }));

    setBots(prevBots => prevBots.map(bot =>
      bot.id === targetBotId
        ? { ...bot, stunnedUntil: Date.now() + SHOCK_STUN_DURATION_MS, isFishing: false }
        : bot
    ));

    addLog(`⚡ You zapped ${targetBot.name}! (-5 Reputation)`);

    if (Math.random() < SHOCK_CAUGHT_CHANCE) {
      addLog(`🚨 The Lake Warden caught you! You were fined ${SHOCK_FINE}g and lost more reputation!`);
      setPlayer(prev => ({
        ...prev,
        money: Math.max(0, prev.money - SHOCK_FINE),
        reputation: Math.max(0, prev.reputation - 10)
      }));
    }

  }, [player.shockDevices, bots, player.reputation, addLog]);

  // Equipment functions
  const equipRod = useCallback((rodId: string) => {
    const rod = ALL_RODS.find(r => r.id === rodId);
    if (!rod) return;

    setPlayer(prev => ({ ...prev, equippedRod: rod }));
    addLog(`Equipped ${rod.name}!`);
  }, [addLog]);

  const equipBait = useCallback((baitId: string) => {
    const bait = ALL_BAITS.find(b => b.id === baitId);
    if (!bait) return;

    setPlayer(prev => ({ ...prev, equippedBait: bait }));
    addLog(`Equipped ${bait.name}!`);
  }, [addLog]);

  const buyRod = useCallback((rodId: string) => {
    const rod = ALL_RODS.find(r => r.id === rodId);
    if (!rod) return;

    if (player.money >= rod.value) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money - rod.value,
        equippedRod: rod,
      }));
      addLog(`Purchased and equipped ${rod.name} for ${rod.value}g!`);
    } else {
      addLog("Not enough gold to buy this rod.");
    }
  }, [player.money, addLog]);

  const buyBait = useCallback((baitId: string) => {
    const bait = ALL_BAITS.find(b => b.id === baitId);
    if (!bait) return;

    if (player.money >= bait.value) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money - bait.value,
        equippedBait: bait,
      }));
      addLog(`Purchased and equipped ${bait.name} for ${bait.value}g!`);
    } else {
      addLog("Not enough gold to buy this bait.");
    }
  }, [player.money, addLog]);

  // Diving system functions
  const startDiving = useCallback(() => {
    if (status !== GameStatus.Idle) return;

    // Check energy
    if (player.energy < ENERGY_COST_DIVING) {
      addLog("You're too exhausted to dive! Rest or wait for energy to regenerate.");
      return;
    }

    setPlayer(prev => ({ ...prev, energy: Math.max(0, prev.energy - ENERGY_COST_DIVING) }));
    setStatus(GameStatus.Diving);
    addLog('🤿 You dive into the depths...');

    // Random diving time between 3-8 seconds
    const diveTime = Math.random() * 5000 + 3000;

    timeoutRef.current = setTimeout(() => {
      // 40% chance of encountering danger
      if (Math.random() < 0.4) {
        const dangers = [DangerType.Shark, DangerType.ElectricEel, DangerType.Current, DangerType.Depth];
        const randomDanger = dangers[Math.floor(Math.random() * dangers.length)];
        setCurrentDanger(randomDanger);
        setStatus(GameStatus.DivingCombat);
        addLog(`⚠️ Danger! You encountered a ${randomDanger}! Defend yourself!`);
      } else {
        // Successful dive - get rare items
        const rareItems = ALL_ITEMS.filter(item => item.rarity === 'Rare' || item.rarity === 'Epic');
        const randomRareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
        const newInventoryItem: InventoryItem = { ...randomRareItem, instanceId: crypto.randomUUID() };

        setLastCaughtItem(newInventoryItem);
        setPlayer(prev => {
          const newXp = prev.xp + randomRareItem.value * 2; // Bonus XP for diving
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          const newInventory = [...prev.inventory, newInventoryItem];
          return { ...prev, xp: newXp, level: newLevel, inventory: newInventory, reputation: prev.reputation + 1 }; // Reputation bonus for diving
        });

        setStatus(GameStatus.Caught);
        addLog(`🌟 You found a rare ${randomRareItem.name} while diving! (+1 Reputation)`);
      }
    }, diveTime);
  }, [status, player.energy, addLog]);

  const finishDivingCombat = useCallback((success: boolean) => {
    if (success) {
      // Successfully defended - get bonus item
      const rareItems = ALL_ITEMS.filter(item => item.rarity === 'Uncommon' || item.rarity === 'Rare');
      const randomItem = rareItems[Math.floor(Math.random() * rareItems.length)];
      const newInventoryItem: InventoryItem = { ...randomItem, instanceId: crypto.randomUUID() };

      setLastCaughtItem(newInventoryItem);
      setPlayer(prev => {
        const newXp = prev.xp + randomItem.value;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        const newInventory = [...prev.inventory, newInventoryItem];
        return { ...prev, xp: newXp, level: newLevel, inventory: newInventory };
      });

      setStatus(GameStatus.Caught);
      addLog(`💪 You successfully defended yourself and found ${randomItem.name}!`);
    } else {
      // Failed to defend - take damage (lose some money and get stunned)
      const damage = Math.floor(player.money * 0.1); // Lose 10% of money
      setPlayer(prev => ({
        ...prev,
        money: Math.max(0, prev.money - damage)
      }));

      setStatus(GameStatus.Idle);
      addLog(`😵 You failed to defend yourself! Lost ${damage}g and need time to recover.`);
    }
  }, [player.money]);


  // Energy regeneration
  useEffect(() => {
    const energyRegenInterval = setInterval(() => {
      setPlayer(prev => ({
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + ENERGY_REGEN_RATE)
      }));
    }, 60000); // Regenerate every minute

    return () => clearInterval(energyRegenInterval);
  }, []);

  // Lake cleaning function
  const startLakeCleaning = useCallback(() => {
    if (status !== GameStatus.Idle) return;

    if (player.energy < ENERGY_COST_CLEANING) {
      addLog("You're too tired to clean the lake! Rest or wait for energy to regenerate.");
      return;
    }

    setPlayer(prev => ({ ...prev, energy: Math.max(0, prev.energy - ENERGY_COST_CLEANING) }));
    setStatus(GameStatus.CleaningLake);
    addLog('🧽 You start cleaning the lake...');

    // Cleaning time based on pollution level (simplified - normally would be dynamic)
    const cleanTime = 10000; // 10 seconds for demo

    timeoutRef.current = setTimeout(() => {
      // Chance to find trash item
      const trashItems = ALL_ITEMS.filter(item => item.type === 'Junk');
      const foundTrash = trashItems[Math.floor(Math.random() * trashItems.length)];
      const newInventoryItem: InventoryItem = { ...foundTrash, instanceId: crypto.randomUUID() };

      setLastCaughtItem(newInventoryItem);
      setPlayer(prev => {
        const newXp = prev.xp + 10; // XP for cleaning
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          inventory: [...prev.inventory, newInventoryItem],
          pollutionCleaned: prev.pollutionCleaned + 1,
          reputation: prev.reputation + 1
        };
      });

      setStatus(GameStatus.Caught);
      addLog(`🗑️ You found and cleaned up ${foundTrash.name}! (+10 XP, +1 Reputation)`);
    }, cleanTime);
  }, [status, player.energy, addLog]);

  // Quest functions
  const updateQuestProgress = useCallback((questType: string, progress: number = 1) => {
    setQuestProgress(prev => {
      const newProgress = { ...prev };
      const questId = Object.keys(newProgress).find(id => id.includes(questType)) || questType + '_current';
      newProgress[questId] = (newProgress[questId] || 0) + progress;
      return newProgress;
    });
  }, []);

  const claimQuestReward = useCallback((questId: string) => {
    // This would normally validate quest completion and give rewards
    addLog(`🏆 Completed quest: ${questId}! Rewards claimed.`);
    // Reset progress or mark as claimed
    setQuestProgress(prev => {
      const newProgress = { ...prev };
      newProgress[questId] = 0; // Reset for daily quests
      return newProgress;
    });
  }, [addLog]);

  // Override action functions to track quest progress
  const finishReelingQuest = useCallback((success: boolean) => {
    if (success) {
      updateQuestProgress('catch_fish');
      updateQuestProgress('sell_items'); // Fishing often leads to selling
    }
    finishReeling(success);
  }, [finishReeling, updateQuestProgress]);

  const sellItemQuest = useCallback((instanceId: string) => {
    updateQuestProgress('sell_items');
    sellItem(instanceId);
  }, [sellItem, updateQuestProgress]);

  const useElectricShockQuest = useCallback((targetBotId: number) => {
    updateQuestProgress('use_shock');
    useElectricShock(targetBotId);
  }, [useElectricShock, updateQuestProgress]);

  const startDivingQuest = useCallback(() => {
    updateQuestProgress('dive');
    startDiving();
  }, [startDiving, updateQuestProgress]);

  const startLakeCleaningQuest = useCallback(() => {
    updateQuestProgress('clean_pollution');
    startLakeCleaning();
  }, [startLakeCleaning, updateQuestProgress]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    player,
    status,
    logs,
    castLine,
    finishReeling: finishReelingQuest,
    sellItem: sellItemQuest,
    itemOnLine,
    lastCaughtItem,
    acknowledgeCatch,
    bots,
    buyShockDevice,
    useElectricShock: useElectricShockQuest,
    equipRod,
    equipBait,
    buyRod,
    buyBait,
    startDiving: startDivingQuest,
    finishDivingCombat,
    startLakeCleaning: startLakeCleaningQuest,
    currentDanger,
    questProgress,
    claimQuestReward
  };
};
