import { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameStatus, Item, InventoryItem, Bot, Rod, Bait, DangerType } from '../types';
import { ALL_ITEMS, INITIAL_PLAYER_STATE, XP_PER_LEVEL, RARITY_WEIGHTS, BOTS, SHOCK_DEVICE_COST, SHOCK_STUN_DURATION_MS, SHOCK_CAUGHT_CHANCE, SHOCK_FINE, ALL_RODS, ALL_BAITS, ENERGY_COST_FISHING, ENERGY_COST_DIVING, ENERGY_COST_CLEANING, ENERGY_REGEN_RATE, getPollutionEffect } from '../constants';

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
  const [debtPayAmount, setDebtPayAmount] = useState<number>(0);

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

    // Apply pollution penalty
    const pollutionEffect = getPollutionEffect(player.pollutionLevel);
    const penalty = pollutionEffect.fishingPenalty / 100; // Convert percentage to decimal
    Object.keys(adjustedWeights).forEach(rarity => {
      const rarityKey = rarity as keyof typeof RARITY_WEIGHTS;
      // Penalty affects rare items more, encouraging cleaning
      const penaltyMultiplier = penalty * (rarity === 'Legendary' ? 2 : rarity === 'Epic' ? 1.5 : rarity === 'Rare' ? 1.2 : 1);
      adjustedWeights[rarityKey] = Math.max(1, Math.floor(adjustedWeights[rarityKey] * (1 - penaltyMultiplier)));
    });

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
          // Set special status for bomb - will show target selection screen
          // Pass the bomb item back to App for modal display
          setLastCaughtItem(itemOnLine);
          setStatus(GameStatus.Caught);
          setItemOnLine(null);
          return; // Don't add bomb to inventory or proceed normally
      } else {
           addLog(`You caught a ${itemOnLine.name}!`);
      }

      setPlayer(prev => {
        const newXp = prev.xp + itemOnLine.value;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        const newInventoryItem: InventoryItem = {
          ...itemOnLine,
          instanceId: crypto.randomUUID(),
          edible: itemOnLine.type === 'Fish',
          energyValue: itemOnLine.type === 'Fish' ?
            (itemOnLine.rarity === 'Common' ? 15 :
             itemOnLine.rarity === 'Uncommon' ? 25 :
             itemOnLine.rarity === 'Rare' ? 40 :
             itemOnLine.rarity === 'Epic' ? 60 :
             itemOnLine.rarity === 'Legendary' ? 100 : 10) : undefined
        };
        const newInventory = [...prev.inventory, newInventoryItem];
        // Pollution increases when catching junk/trash
        const pollutionIncrease = itemOnLine.type === 'Junk' ? 1 : 0;
        return { ...prev, xp: newXp, level: newLevel, inventory: newInventory, pollutionLevel: prev.pollutionLevel + pollutionIncrease };
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
        const newInventoryItem: InventoryItem = {
          ...randomRareItem,
          instanceId: crypto.randomUUID(),
          edible: randomRareItem.type === 'Fish',
          energyValue: randomRareItem.type === 'Fish' ?
            (randomRareItem.rarity === 'Common' ? 15 :
             randomRareItem.rarity === 'Uncommon' ? 25 :
             randomRareItem.rarity === 'Rare' ? 40 :
             randomRareItem.rarity === 'Epic' ? 60 :
             randomRareItem.rarity === 'Legendary' ? 100 : 10) : undefined
        };

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
      const newInventoryItem: InventoryItem = {
        ...randomItem,
        instanceId: crypto.randomUUID(),
        edible: randomItem.type === 'Fish',
        energyValue: randomItem.type === 'Fish' ?
          (randomItem.rarity === 'Common' ? 15 :
           randomItem.rarity === 'Uncommon' ? 25 :
           randomItem.rarity === 'Rare' ? 40 :
           randomItem.rarity === 'Epic' ? 60 :
           randomItem.rarity === 'Legendary' ? 100 : 10) : undefined
      };

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

    // Cleaning time based on pollution level
    const pollutionEffect = getPollutionEffect(player.pollutionLevel);
    const cleanTime = pollutionEffect.cleanupTime * 1000; // Convert to milliseconds

    timeoutRef.current = setTimeout(() => {
      // Chance to find trash item based on pollution level
      const pollutionEffect = getPollutionEffect(player.pollutionLevel);
      const trashItems = pollutionEffect.trashItems.flatMap(itemId => ALL_ITEMS.filter(item => item.id === itemId));
      const foundTrash = trashItems[Math.floor(Math.random() * trashItems.length)] || ALL_ITEMS.find(item => item.id === 'junk_2')!;
      const newInventoryItem: InventoryItem = {
        ...foundTrash,
        instanceId: crypto.randomUUID(),
        edible: foundTrash.type === 'Fish',
        energyValue: foundTrash.type === 'Fish' ?
          (foundTrash.rarity === 'Common' ? 15 :
           foundTrash.rarity === 'Uncommon' ? 25 :
           foundTrash.rarity === 'Rare' ? 40 :
           foundTrash.rarity === 'Epic' ? 60 :
           foundTrash.rarity === 'Legendary' ? 100 : 10) : undefined
      };

      setLastCaughtItem(newInventoryItem);
      setPlayer(prev => {
        const newXp = prev.xp + 10; // XP for cleaning
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        // Cleaning reduces pollution
        const pollutionDecrease = Math.min(1, prev.pollutionLevel);
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          inventory: [...prev.inventory, newInventoryItem],
          pollutionCleaned: prev.pollutionCleaned + 1,
          reputation: prev.reputation + 1,
          pollutionLevel: Math.max(0, prev.pollutionLevel - pollutionDecrease)
        };
      });

      setStatus(GameStatus.Caught);
      addLog(`🗑️ You cleaned up ${foundTrash.name}! (-1 Pollution, +10 XP, +1 Reputation)`);
    }, cleanTime);
  }, [status, player.energy, addLog, player.pollutionLevel]);

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

  // Debt system functions
  const applyPenalty = useCallback((amount: number, type: string = 'fine') => {
    setPlayer(prev => {
      let newMoney = prev.money - amount;
      let newDebt = prev.debt;
      let newInDebt = prev.inDebt;

      // If money goes negative, convert to debt
      if (newMoney < 0) {
        newDebt += Math.abs(newMoney);
        newMoney = 0;
        newInDebt = true;
        addLog(`💸 You've gone into debt! ${Math.abs(newMoney)}g added to your debt.`);
      }

      // Apply reputation effects for disruptive actions
      let newReputation = prev.reputation;
      if (['steal', 'explode', 'chemical'].includes(type)) {
        newReputation = Math.max(0, newReputation - (type === 'explode' ? 15 : 10));
      }

      return {
        ...prev,
        money: newMoney,
        debt: newDebt,
        inDebt: newInDebt,
        reputation: newReputation,
      };
    });
  }, [addLog]);

  const calculateDebtInterest = useCallback(() => {
    if (!player.inDebt || player.debt <= 0) return;

    const daysPassed = Math.max(0, (Date.now() - player.lastLogin) / (1000 * 60 * 60 * 24));
    if (daysPassed > 0.01) { // Only update if meaningful time passed
      setPlayer(prev => {
        const interestAmount = Math.floor(prev.debt * prev.debtInterestRate * Math.min(daysPassed, 7)); // Cap at 7 days
        const newDebt = prev.debt + interestAmount;
        if (interestAmount > 0) {
          addLog(`📈 Debt interest accrued: +${interestAmount}g ($newDebt{g} total)`);
        }
        return {
          ...prev,
          debt: Math.min(5000, newDebt), // Cap debt at 5000g
          lastLogin: Date.now(),
        };
      });
    }
  }, [player.inDebt, player.debt, player.lastLogin, addLog]);

  const applyDebtTax = useCallback(() => {
    if (!player.inDebt) return;

    setPlayer(prev => {
      const taxAmount = Math.floor(prev.debt * 0.10); // 10% tax
      if (prev.money > 0) {
        const actualTax = Math.min(taxAmount, prev.money);
        addLog(`💰 Debt tax applied: -${actualTax}g`);
        return { ...prev, money: prev.money - actualTax };
      } else if (taxAmount > 0) {
        // Add to debt if no gold available
        addLog(`📌 Debt tax added to debt: +${taxAmount}g`);
        return { ...prev, debt: prev.debt + taxAmount };
      }
      return prev;
    });
  }, [player.inDebt, addLog]);

  const repayDebt = useCallback((amount: number) => {
    if (amount <= 0 || player.money < amount) return;

    setPlayer(prev => {
      const repayment = Math.min(amount, prev.debt);
      const remainingAmount = amount - repayment;
      const newMoney = prev.money - repayment + remainingAmount; // Refund what couldn't be applied
      const newDebt = prev.debt - repayment;
      const newInDebt = newDebt > 0;

      addLog(`✅ Debt repayment: -${repayment}g from debt. ${newDebt > 0 ? `Remaining: ${newDebt}g` : 'Debt cleared!'}`);

      if (!newInDebt) {
        addLog(`🎉 All debts cleared! You regained your honor.`);
      }

      return {
        ...prev,
        money: newMoney,
        debt: newDebt,
        inDebt: newInDebt,
      };
    });
  }, [player.money, addLog]);

  // Eating fish system
  const eatFish = useCallback((instanceId: string) => {
    if (player.energy >= player.maxEnergy) {
      addLog("You're full! No need to eat more.");
      return;
    }

    const fish = player.inventory.find(item => item.instanceId === instanceId);
    if (!fish || !fish.edible || !fish.energyValue) {
      addLog("That item isn't edible!");
      return;
    }

    setPlayer(prev => {
      const newEnergy = Math.min(prev.maxEnergy, prev.energy + fish.energyValue!);
      const newInventory = prev.inventory.filter(item => item.instanceId !== instanceId);

      addLog(`🍽️ Ate ${fish.name}! +${fish.energyValue} energy`);

      return {
        ...prev,
        energy: newEnergy,
        inventory: newInventory,
      };
    });
  }, [player, addLog]);

  // Throw bomb at bot system
  const throwBombAtBot = useCallback((botId: number) => {
    setBots(prevBots => prevBots.map(bot =>
      bot.id === botId
        ? { ...bot, stunnedUntil: Date.now() + 15000, isFishing: false }
        : bot
    ));
    addLog(`💥 Bomb thrown at bot ${botId}! They're stunned for 15 seconds!`);
  }, [addLog]);

  // Simple share fish system (prototype)
  const shareFish = useCallback((instanceId: string, targetBotId: number) => {
    const fish = player.inventory.find(item => item.instanceId === instanceId);
    if (!fish) return;

    const targetBot = bots.find(b => b.id === targetBotId);
    if (!targetBot) return;

    setPlayer(prev => ({
      ...prev,
      reputation: Math.min(100, prev.reputation + (fish.rarity === 'Rare' ? 10 : 5)),
    }));

    addLog(`🎁 Shared ${fish.name} with ${targetBot.name}. +${fish.rarity === 'Rare' ? 10 : 5} reputation!`);
  }, [player, bots, addLog]);

  // Calculate debt interest on load (stable without callback dependencies)
  useEffect(() => {
    // Only run if player data is available
    if (player.inDebt) {
      const daysPassed = Math.max(0, (Date.now() - player.lastLogin) / (1000 * 60 * 60 * 24));
      if (daysPassed > 0.01) {
        const interestAmount = Math.floor(player.debt * player.debtInterestRate * Math.min(daysPassed, 7));
        if (interestAmount > 0) {
          setPlayer(prev => ({
            ...prev,
            debt: Math.min(5000, prev.debt + interestAmount),
            lastLogin: Date.now(),
          }));
          addLog(`📈 Debt interest accrued: +${interestAmount}g`);
        }
      }

      // Apply debt tax
      const taxAmount = Math.floor(player.debt * 0.10);
      if (taxAmount > 0) {
        setPlayer(prev => {
          const actualTax = Math.min(taxAmount, prev.money);
          if (actualTax > 0) {
            addLog(`💰 Debt tax applied: -${actualTax}g`);
            return { ...prev, money: prev.money - actualTax };
          }
          return prev;
        });
      }
    }

    // Set up daily interest check (every 24 hours)
    const dailyInterval = setInterval(() => {
      if (player.inDebt && player.debt > 0) {
        const interestAmount = Math.floor(player.debt * player.debtInterestRate);
        if (interestAmount > 0) {
          setPlayer(prev => ({
            ...prev,
            debt: Math.min(5000, prev.debt + interestAmount),
          }));
          // Only log if tab is active to avoid spam
          if (!document.hidden) {
            addLog(`📈 Daily debt interest: +${interestAmount}g`);
          }
        }
      }
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(dailyInterval);
  }, [player.inDebt, player.debt, player.lastLogin, player.debtInterestRate, player.money, addLog]); // Use direct player state deps instead of callbacks

  // Override useElectricShock to use new penalty system
  const useElectricShockQuestWithDebt = useCallback((targetBotId: number) => {
    if (player.shockDevices <= 0) {
      addLog("You don't have any shock devices!");
      return;
    }

    const targetBot = bots.find(b => b.id === targetBotId);
    if (!targetBot) return;

    if (targetBot.stunnedUntil && Date.now() < targetBot.stunnedUntil) {
      addLog(`${targetBot.name} is already stunned!`);
      return;
    }

    setPlayer(prev => ({
      ...prev,
      shockDevices: prev.shockDevices - 1,
      reputation: Math.max(0, prev.reputation - 5)
    }));

    setBots(prevBots => prevBots.map(bot =>
      bot.id === targetBotId
        ? { ...bot, stunnedUntil: Date.now() + SHOCK_STUN_DURATION_MS, isFishing: false }
        : bot
    ));

    addLog(`⚡ You zapped ${targetBot.name}! (-5 Reputation)`);

    if (Math.random() < SHOCK_CAUGHT_CHANCE) {
      addLog(`🚨 The Lake Warden caught you! You were fined ${SHOCK_FINE}g!`);
      applyPenalty(SHOCK_FINE, 'shock');
    }

    updateQuestProgress('use_shock');
  }, [player.shockDevices, bots, player.reputation, addLog, applyPenalty, updateQuestProgress]);

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
    useElectricShock: useElectricShockQuestWithDebt,
    equipRod,
    equipBait,
    buyRod,
    buyBait,
    startDiving: startDivingQuest,
    finishDivingCombat,
    startLakeCleaning: startLakeCleaningQuest,
    currentDanger,
    questProgress,
    claimQuestReward,
    applyPenalty,
    calculateDebtInterest,
    applyDebtTax,
    repayDebt,
    debtPayAmount,
    setDebtPayAmount,
    eatFish,
    throwBombAtBot,
    shareFish
  };
};
