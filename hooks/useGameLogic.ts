import { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameStatus, Item, InventoryItem, Bot, Rod, Bait, DangerType } from '../types';
import { ALL_ITEMS, INITIAL_PLAYER_STATE, XP_PER_LEVEL, RARITY_WEIGHTS, BOTS, SHOCK_DEVICE_COST, SHOCK_STUN_DURATION_MS, SHOCK_CAUGHT_CHANCE, SHOCK_FINE, ALL_RODS, ALL_BAITS, ENERGY_COST_FISHING, ENERGY_COST_DIVING, ENERGY_COST_CLEANING, ENERGY_REGEN_RATE, getPollutionEffect, SHOCK_BOT_DAMAGE, BOMB_BOT_DAMAGE_AREA_BASE, BOMB_BOT_DAMAGE_POLLUTION_MULTIPLIER, CHEMICAL_BOT_DAMAGE_PER_PERIOD, DAMAGE_OVERUSE_MULTIPLIER, OVERUSE_LIMIT_PER_HOUR, BOT_MAX_HEALTH, BOT_REGEN_RATE_PER_30_SEC, BOT_FISHING_HEALTH_COST, BOT_AUTO_FISH_HEALTH_COST, BOT_EAT_RESTORE_HEALTH, BOT_CHEMICAL_DAMAGE_DELAY_MINUTES, BOT_FAINTED_DURATION_MS, BOT_FAINTED_RESET_HEALTH, BOT_CARE_REPUTATION_MULTIPLIER, BOT_SHARE_ENERGY_BONUS, BOT_REVENGE_CHANCE, BOT_REVENGE_DAMAGE, BOT_LAKE_UPSET_POLLUTION_BONUS, LAKE_ALARM_DAMAGE_THRESHOLD, LAKE_ALARM_DEBT_PENALTY, LAKE_ALARM_DISCOVERY_INCREASE, BOT_CARE_POLLUTION_REDUCTION, BOT_SHARE_DEBT_REDUCTION_PERCENT, LAKE_BOMB_COST, CHEMICAL_BOTTLE_COST } from '../constants';

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

  // Crafting system
  const craftItem = useCallback((recipeId: string, recipeName: string) => {
    const recipes = [
      {
        id: 'recipe_magic_bait',
        name: 'Magic Bait',
        ingredients: [
          { itemId: 'fish_1', quantity: 3 },
          { itemId: 'treasure_1', quantity: 1 },
        ],
        result: {
          id: 'bait_magic',
          name: 'Magic Bait',
          description: 'Enchanted bait that attracts rare fish.',
          value: 100,
          type: 'Bait' as any,
          rarity: 'Epic' as any,
          icon: '🪄',
          fishTypeMultiplier: {
            'fish_1': 0.5, 'fish_2': 0.8, 'fish_3': 1.2, 'fish_4': 1.8, 'fish_5': 2.5
          },
          quantity: 2,
        } as any,
        requiredLevel: 5,
        craftingTime: 30,
      },
      {
        id: 'recipe_super_bait',
        name: 'Super Bait',
        ingredients: [
          { itemId: 'fish_4', quantity: 2 },
          { itemId: 'treasure_3', quantity: 1 },
        ],
        result: {
          id: 'bait_super',
          name: 'Super Bait',
          description: 'Ultimate bait for legendary fish.',
          value: 200,
          type: 'Bait' as any,
          rarity: 'Legendary' as any,
          icon: '⭐',
          fishTypeMultiplier: {
            'fish_1': 0.3, 'fish_2': 0.5, 'fish_3': 1.0, 'fish_4': 2.0, 'fish_5': 3.0
          },
          quantity: 1,
        } as any,
        requiredLevel: 10,
        craftingTime: 60,
      },
      {
        id: 'recipe_reinforced_rod',
        name: 'Reinforced Rod',
        ingredients: [
          { itemId: 'rod_basic', quantity: 1 },
          { itemId: 'treasure_2', quantity: 2 },
        ],
        result: {
          id: 'rod_reinforced',
          name: 'Reinforced Rod',
          description: 'A stronger, more durable fishing rod.',
          value: 350,
          type: 'Rod' as any,
          rarity: 'Uncommon' as any,
          icon: '🔧',
          successRate: 0.85,
          pullSpeed: 1.3,
          durability: 200,
          maxDurability: 200,
        } as any,
        requiredLevel: 3,
        craftingTime: 45,
      },
      {
        id: 'recipe_lucky_charm',
        name: 'Lucky Charm',
        ingredients: [
          { itemId: 'treasure_4', quantity: 1 },
          { itemId: 'fish_5', quantity: 1 },
        ],
        result: {
          id: 'special_lucky_charm',
          name: 'Lucky Charm',
          description: 'Increases chance of catching rare items.',
          value: 500,
          type: 'Treasure' as any,
          rarity: 'Legendary' as any,
          icon: '🍀',
        } as any,
        requiredLevel: 15,
        craftingTime: 90,
      },
    ];

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Check if player has required level
    if (player.level < recipe.requiredLevel) {
      addLog(`You need to be level ${recipe.requiredLevel} to craft ${recipeName}!`);
      return;
    }

    // Check and consume ingredients
    let canCraft = true;
    const inventoryCounts: { [key: string]: number } = {};
    player.inventory.forEach(item => {
      inventoryCounts[item.id] = (inventoryCounts[item.id] || 0) + 1;
    });

    for (const ingredient of recipe.ingredients) {
      if (!inventoryCounts[ingredient.itemId] || inventoryCounts[ingredient.itemId] < ingredient.quantity) {
        canCraft = false;
        break;
      }
    }

    if (!canCraft) {
      addLog(`Missing ingredients to craft ${recipeName}!`);
      return;
    }

    // Consume ingredients
    setPlayer(prev => {
      let newInventory = [...prev.inventory];
      for (const ingredient of recipe.ingredients) {
        let remaining = ingredient.quantity;
        // First, look for exact item IDs, then try to remove instances
        newInventory = newInventory.filter(item => {
          if (item.id === ingredient.itemId && remaining > 0) {
            remaining--;
            return false; // Remove this item
          }
          return true; // Keep other items
        });
      }
      return { ...prev, inventory: newInventory };
    });

    // Simulate crafting delay
    setTimeout(() => {
      // Add crafted item to inventory
      const craftedItem = {
        ...recipe.result,
        instanceId: crypto.randomUUID(),
        edible: false,
        energyValue: undefined,
      };

      setPlayer(prev => ({
        ...prev,
        inventory: [...prev.inventory, craftedItem],
        xp: prev.xp + Math.floor(recipe.result.value / 10), // XP for crafting
      }));

      addLog(`🎉 Successfully crafted ${recipeName}! (+${Math.floor(recipe.result.value / 10)} XP)`);
    }, recipe.craftingTime * 100); // Convert seconds to milliseconds

    addLog(`🔨 Started crafting ${recipeName}... (${recipe.craftingTime}s)`);
  }, [player.inventory, player.level, addLog]);

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

  // Bot Health System Functions

  // Damage application logic
  const applyDamageToBot = useCallback((botId: number, damage: number, source: 'shock' | 'bomb' | 'chemical' | 'steal') => {
    setBots(prevBots => prevBots.map(bot => {
      if (bot.id !== botId) return bot;

      const currentTime = Date.now();
      let overuseDamage = 1;

      // Calculate overuse damage multiplier
      const gameState = { overuse: { shock: 0, bomb: 0, chemical: 0 } }; // This would be stored in game state
      if (gameState.overuse[source] >= OVERUSE_LIMIT_PER_HOUR) {
        overuseDamage = DAMAGE_OVERUSE_MULTIPLIER;
        addLog(`⚠️ Overusing ${source} actions! Damage increased by ${Math.floor((overuseDamage - 1) * 100)}%!`);
      }

      const totalDamage = damage * overuseDamage;
      const newHealth = Math.max(0, bot.health - totalDamage);

      // Update bot state based on health
      let newState: Bot['state'] = 'healthy';
      if (newHealth <= 20) newState = 'weak';
      else if (newHealth <= 50) newState = 'tired';
      else if (newHealth <= 80) newState = 'caution';

      // Special handling for fainted
      if (newHealth === 0) {
        newState = 'fainted';
        addLog(`😵 ${bot.name} fainted from damage! They need time to recover...`);
        // Schedule recovery
        setTimeout(() => {
          setBots(recoveryBots => recoveryBots.map(recoveryBot => {
            if (recoveryBot.id === botId) {
              addLog(`🛌 ${recoveryBot.name} recovered from fainting!`);
              return {
                ...recoveryBot,
                health: BOT_FAINTED_RESET_HEALTH,
                state: 'caution' as const,
                stunnedUntil: undefined
              };
            }
            return recoveryBot;
          }));
        }, BOT_FAINTED_DURATION_MS);
      }

      // Trigger revenge system if health is low
      if (newHealth < 50 && Math.random() < BOT_REVENGE_CHANCE) {
        addLog(`👎 ${bot.name} is unhappy about the damage! Watch out for retaliation...`);
        // Schedule random revenge in 10-30 seconds
        setTimeout(() => {
          setPlayer(prev => {
            const newEnergy = Math.max(0, prev.energy - BOT_REVENGE_DAMAGE);
            if (newEnergy < prev.energy) {
              addLog(`⚡ ${bot.name} retaliated! Lost ${BOT_REVENGE_DAMAGE} energy.`);
            }
            return { ...prev, energy: newEnergy };
          });
        }, Math.random() * 20000 + 10000);
      }

      // Log damage
      const damageDescription = {
        shock: '⚡ shocked',
        bomb: '💥 bombed',
        chemical: '🧪 poisoned',
        steal: '🤏 stole from'
      }[source];

      addLog(`${damageDescription} ${bot.name}! Health: ${bot.health}/${BOT_MAX_HEALTH} → ${newHealth}/${BOT_MAX_HEALTH}`);

      return {
        ...bot,
        health: newState === 'fainted' ? 0 : newHealth,
        state: newState,
        stunnedUntil: newState === 'fainted' ? currentTime + BOT_FAINTED_DURATION_MS : bot.stunnedUntil,
        isFishing: newHealth < 80 ? false : bot.isFishing
      };
    }));
  }, [addLog]);

  // Bot health regeneration
  useEffect(() => {
    const regenerationInterval = setInterval(() => {
      setBots(currentBots => currentBots.map(bot => {
        if (bot.state === 'fainted' || bot.health >= BOT_MAX_HEALTH) return bot;

        const newHealth = Math.min(BOT_MAX_HEALTH, bot.health + BOT_REGEN_RATE_PER_30_SEC);
        let newState: Bot['state'] = 'healthy';
        if (newHealth <= 20) newState = 'weak';
        else if (newHealth <= 50) newState = 'tired';
        else if (newHealth <= 80) newState = 'caution';

        return {
          ...bot,
          health: newHealth,
          state: newState,
          lastRegenTime: Date.now()
        };
      }));
    }, 30000); // Every 30 seconds

    return () => clearInterval(regenerationInterval);
  }, []);

  // Bot auto-fishing with health cost
  useEffect(() => {
    const botFishingInterval = setInterval(() => {
      setBots(currentBots => currentBots.map(bot => {
        const isStunned = bot.stunnedUntil && Date.now() < bot.stunnedUntil;
        if (isStunned || !bot.isFishing || bot.state === 'fainted' || bot.health < BOT_FISHING_HEALTH_COST) {
          return bot;
        }

        // Deduct health for fishing
        const newHealth = Math.max(0, bot.health - BOT_FISHING_HEALTH_COST);
        let newState: Bot['state'] = 'healthy';
        if (newHealth <= 20) newState = 'weak';
        else if (newHealth <= 50) newState = 'tired';
        else if (newHealth <= 80) newState = 'caution';

        // Auto-catching fish logic
        if (Math.random() < 0.5) { // 50% chance for bot to catch something
          const randomFish = ALL_ITEMS.filter(i => i.type === 'Fish')[Math.floor(Math.random() * 5)];
          bot.inventory.push({
            ...randomFish,
            instanceId: crypto.randomUUID(),
            edible: true,
            energyValue: randomFish.rarity === 'Rare' ? 40 : 20
          });
        }

        return {
          ...bot,
          health: newHealth,
          state: newState,
          lastFishedTime: Date.now()
        };
      }));
    }, 10000); // Every 10 seconds

    return () => clearInterval(botFishingInterval);
  }, []);

  // Override existing disruptive actions to use health system

  // Updated electric shock with health damage
  const useElectricShockWithHealth = useCallback((targetBotId: number) => {
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

    // Apply health damage
    applyDamageToBot(targetBotId, SHOCK_BOT_DAMAGE, 'shock');

    setPlayer(prev => ({
      ...prev,
      shockDevices: prev.shockDevices - 1,
      reputation: Math.max(0, prev.reputation - 5),
      disruptiveActions: {
        ...prev.disruptiveActions,
        shocks: prev.disruptiveActions.steals + 1
      }
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
  }, [player.shockDevices, bots, player.reputation, addLog, applyPenalty, updateQuestProgress, applyDamageToBot]);

  // Updated bomb system with area damage
  const throwBombAtBotWithHealth = useCallback((botId: number) => {
    if (player.money < LAKE_BOMB_COST) {
      addLog("Not enough gold for a lake bomb!");
      return;
    }

    // Area damage effect on nearby bots
    bots.forEach(bot => {
      const distance = Math.random() * 100; // Simulate distance
      if (distance < 50) { // Bots within range
        const baseDamage = BOMB_BOT_DAMAGE_AREA_BASE;
        const pollutionMultiplier = player.pollutionLevel > 50 ? BOMB_BOT_DAMAGE_POLLUTION_MULTIPLIER : 1;
        applyDamageToBot(bot.id, baseDamage * pollutionMultiplier, 'bomb');
      }
    });

    setPlayer(prev => ({
      ...prev,
      money: prev.money - LAKE_BOMB_COST,
      reputation: Math.max(0, prev.reputation - 15),
      disruptiveActions: {
        ...prev.disruptiveActions,
        explosions: prev.disruptiveActions.explosions + 1
      }
    }));

    addLog(`💥 Lake bomb detonated! All nearby bots damaged. (-15 Reputation, -${LAKE_BOMB_COST}g)`);

    // Risk system for explosions
    if (Math.random() < 0.7) { // 70% chance of getting caught
      applyPenalty(LAKE_ALARM_DEBT_PENALTY, 'explode');
      addLog(`🚨 The explosion drew attention! Alarm triggered, +${LAKE_ALARM_DEBT_PENALTY}g debt!`);
    }
  }, [bots, player.money, player.pollutionLevel, addLog, applyPenalty, applyDamageToBot]);

  // New chemical dumping system
  const dumpChemicalAtBot = useCallback((botId: number) => {
    if (player.money < CHEMICAL_BOTTLE_COST) {
      addLog("Not enough gold for a chemical bottle!");
      return;
    }

    // Target specific bot
    applyDamageToBot(botId, 0, 'chemical'); // Initial damage

    // Set up periodic damage
    const damageInterval = setInterval(() => {
      applyDamageToBot(botId, CHEMICAL_BOT_DAMAGE_PER_PERIOD, 'chemical');
    }, BOT_CHEMICAL_DAMAGE_DELAY_MINUTES * 60 * 1000); // Damage every 5 minutes

    // Stop damage after some time
    setTimeout(() => {
      clearInterval(damageInterval);
    }, 4 * 60 * 60 * 1000); // 4 hours

    setPlayer(prev => ({
      ...prev,
      money: prev.money - CHEMICAL_BOTTLE_COST,
      reputation: Math.max(0, prev.reputation - 10),
      pollutionLevel: prev.pollutionLevel + 10,
      disruptiveActions: {
        ...prev.disruptiveActions,
        chemicals: prev.disruptiveActions.chemicals + 1
      }
    }));

    const targetBot = bots.find(b => b.id === botId);
    addLog(`🧪 Dumped chemicals near ${targetBot?.name}! They'll suffer periodic damage. (-10 Reputation, +10 Pollution, -${CHEMICAL_BOTTLE_COST}g)`);
  }, [bots, player.money, addLog, applyDamageToBot]);

  // Enhanced care system for bots
  const careBotWithHealth = useCallback((instanceId: string, targetBotId: number) => {
    const fish = player.inventory.find(item => item.instanceId === instanceId);
    if (!fish || !fish.edible || !fish.energyValue) {
      addLog("That item isn't edible enough to share!");
      return;
    }

    const targetBot = bots.find(b => b.id === targetBotId);
    if (!targetBot) return;

    // Remove fish from player inventory
    setPlayer(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.instanceId !== instanceId),
      reputation: Math.min(100, prev.reputation + BOT_CARE_REPUTATION_MULTIPLIER),
      energy: Math.min(prev.maxEnergy, prev.energy + BOT_SHARE_ENERGY_BONUS),
      pollutionLevel: Math.max(0, prev.pollutionLevel - BOT_CARE_POLLUTION_REDUCTION),
      debt: prev.inDebt ? Math.max(0, prev.debt - (prev.debt * BOT_SHARE_DEBT_REDUCTION_PERCENT / 100)) : prev.debt
    }));

    // Heal the bot
    setBots(prevBots => prevBots.map(bot => {
      if (bot.id !== targetBotId) return bot;

      const healAmount = Math.min(BOT_MAX_HEALTH - bot.health, BOT_EAT_RESTORE_HEALTH * (fish.energyValue! / 20));
      const newHealth = Math.min(BOT_MAX_HEALTH, bot.health + healAmount);

      let newState: Bot['state'] = 'healthy';
      if (newHealth <= 20) newState = 'weak';
      else if (newHealth <= 50) newState = 'tired';
      else if (newHealth <= 80) newState = 'caution';

      addLog(`🍽️ ${bot.name} ate your ${fish.name}! Health: ${bot.health}/${BOT_MAX_HEALTH} → ${newHealth}/${BOT_MAX_HEALTH} (+${Math.floor(healAmount)})`);

      return {
        ...bot,
        health: newHealth,
        state: newState,
        inventory: [
          ...bot.inventory,
          {
            ...fish,
            instanceId: crypto.randomUUID(),
            edible: true,
            energyValue: fish.energyValue
          }
        ]
      };
    }));

    addLog(`🎁 Shared ${fish.name} with ${targetBot?.name}! (+${BOT_CARE_REPUTATION_MULTIPLIER} Reputation, +${BOT_SHARE_ENERGY_BONUS} Energy)`);
    if (player.pollutionLevel > BOT_CARE_POLLUTION_REDUCTION) {
      addLog(`♻️ Your kindness to the fishers helped clean the lake! (-${BOT_CARE_POLLUTION_REDUCTION} Pollution)`);
    }
  }, [player, bots, addLog]);

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
    useElectricShock: useElectricShockWithHealth,
    throwBombAtBot: throwBombAtBotWithHealth,
    dumpChemicalAtBot,
    careBotWithHealth,
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
    craftItem,
    shareFish: careBotWithHealth // Updated to use health system
  };
};
