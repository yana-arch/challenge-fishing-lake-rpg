import { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameStatus, Item, InventoryItem, Bot } from '../types';
import { ALL_ITEMS, INITIAL_PLAYER_STATE, XP_PER_LEVEL, RARITY_WEIGHTS, BOTS, SHOCK_DEVICE_COST, SHOCK_STUN_DURATION_MS, SHOCK_CAUGHT_CHANCE, SHOCK_FINE } from '../constants';

const SAVE_KEY = 'challengeFishingLakeSave';

export const useGameLogic = () => {
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER_STATE);
  const [status, setStatus] = useState<GameStatus>(GameStatus.Idle);
  const [logs, setLogs] = useState<string[]>(['Welcome to Challenge Fishing Lake!']);
  const [itemOnLine, setItemOnLine] = useState<Item | null>(null);
  const [lastCaughtItem, setLastCaughtItem] = useState<InventoryItem | null>(null);
  const [bots, setBots] = useState<Bot[]>(BOTS);

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
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const rarity in RARITY_WEIGHTS) {
        const typedRarity = rarity as keyof typeof RARITY_WEIGHTS;
        if (random < RARITY_WEIGHTS[typedRarity]) {
            const possibleItems = ALL_ITEMS.filter(item => item.rarity === typedRarity);
            return possibleItems[Math.floor(Math.random() * possibleItems.length)];
        }
        random -= RARITY_WEIGHTS[typedRarity];
    }
    return ALL_ITEMS.find(item => item.id === 'junk_2')!; // Default to seaweed
  };

  const castLine = useCallback(() => {
    if (status !== GameStatus.Idle) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setStatus(GameStatus.Casting);
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
  }, [status, addLog]);

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
    }));
    addLog(`Sold ${itemToSell.name} for ${itemToSell.value} gold.`);
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
    
    setPlayer(prev => ({ ...prev, shockDevices: prev.shockDevices - 1 }));
    
    setBots(prevBots => prevBots.map(bot => 
      bot.id === targetBotId 
        ? { ...bot, stunnedUntil: Date.now() + SHOCK_STUN_DURATION_MS, isFishing: false } 
        : bot
    ));

    addLog(`⚡ You zapped ${targetBot.name}!`);

    if (Math.random() < SHOCK_CAUGHT_CHANCE) {
      addLog(`🚨 The Lake Warden caught you! You were fined ${SHOCK_FINE}g!`);
      setPlayer(prev => ({ ...prev, money: Math.max(0, prev.money - SHOCK_FINE) }));
    }

  }, [player.shockDevices, bots, addLog]);


  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { player, status, logs, castLine, finishReeling, sellItem, itemOnLine, lastCaughtItem, acknowledgeCatch, bots, buyShockDevice, useElectricShock };
};