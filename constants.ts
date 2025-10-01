import React from 'react';
import { Item, ItemType, Player, Rarity, Bot } from './types';
import { FishIcon, JunkIcon, TreasureIcon, BombIcon, BootIcon, RockIcon, GoldFishIcon } from './components/Icons';

export const ALL_ITEMS: Item[] = [
  // Fish
  // FIX: Replaced JSX with React.createElement to be valid in a .ts file
  { id: 'fish_1', name: 'Guppy', description: 'A small, common fish.', value: 5, type: ItemType.Fish, rarity: Rarity.Common, icon: React.createElement(FishIcon, { className: "w-6 h-6 text-gray-400" }) },
  { id: 'fish_2', name: 'Tuna', description: 'A popular saltwater fish.', value: 25, type: ItemType.Fish, rarity: Rarity.Uncommon, icon: React.createElement(FishIcon, { className: "w-6 h-6 text-blue-400" }) },
  { id: 'fish_3', name: 'Salmon', description: 'Prized for its pink flesh.', value: 50, type: ItemType.Fish, rarity: Rarity.Rare, icon: React.createElement(FishIcon, { className: "w-6 h-6 text-pink-400" }) },
  { id: 'fish_4', name: 'Golden Carp', description: 'A fish that glitters like gold.', value: 200, type: ItemType.Fish, rarity: Rarity.Epic, icon: React.createElement(GoldFishIcon, { className: "w-6 h-6 text-yellow-400" }) },
  { id: 'fish_5', name: 'Lake Serpent', description: 'A legendary creature of the deep.', value: 1000, type: ItemType.Fish, rarity: Rarity.Legendary, icon: React.createElement(FishIcon, { className: "w-8 h-8 text-purple-500" }) },
  
  // Junk
  { id: 'junk_1', name: 'Old Boot', description: 'Someone lost their footwear.', value: 1, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(BootIcon, { className: "w-6 h-6 text-amber-800" }) },
  { id: 'junk_2', name: 'Seaweed', description: 'Slimy and green.', value: 0, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(JunkIcon, { className: "w-6 h-6 text-green-700" }) },
  { id: 'junk_3', name: 'Rock', description: 'Just a plain old rock.', value: 0, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(RockIcon, { className: "w-6 h-6 text-gray-500" }) },
  { id: 'junk_4', name: 'Tin Can', description: 'Remember to recycle.', value: 1, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(JunkIcon, { className: "w-6 h-6 text-gray-400" }) },

  // Treasure
  { id: 'treasure_1', name: 'Small Chest', description: 'Contains a small amount of gold.', value: 100, type: ItemType.Treasure, rarity: Rarity.Rare, icon: React.createElement(TreasureIcon, { className: "w-6 h-6 text-yellow-500" }) },
  { id: 'treasure_2', name: 'Ancient Relic', description: 'A piece of a forgotten era.', value: 500, type: ItemType.Treasure, rarity: Rarity.Epic, icon: React.createElement(TreasureIcon, { className: "w-6 h-6 text-indigo-500" }) },
  
  // Bomb
  { id: 'bomb_1', name: 'Mini Nuke', description: 'Handle with care! Causes a small explosion.', value: -10, type: ItemType.Bomb, rarity: Rarity.Uncommon, icon: React.createElement(BombIcon, { className: "w-6 h-6 text-red-500" }) },
];

export const INITIAL_PLAYER_STATE: Player = {
  name: 'Player',
  level: 1,
  xp: 0,
  money: 50,
  inventory: [],
  shockDevices: 1,
};

export const BOTS: Bot[] = [
    { id: 1, name: 'Angler_Andy', position: { top: '20%', left: '15%' }, isFishing: true },
    { id: 2, name: 'Fisher_Fiona', position: { top: '30%', left: '80%' }, isFishing: false },
    { id: 3, name: 'Reel_Rachel', position: { top: '70%', left: '10%' }, isFishing: true },
    { id: 4, name: 'Caster_Carl', position: { top: '80%', left: '75%' }, isFishing: true },
];

export const XP_PER_LEVEL = 100;
export const RARITY_WEIGHTS: Record<Rarity, number> = {
    [Rarity.Common]: 100,
    [Rarity.Uncommon]: 50,
    [Rarity.Rare]: 20,
    [Rarity.Epic]: 5,
    [Rarity.Legendary]: 1,
};

export const RARITY_COLORS: Record<Rarity, string> = {
    [Rarity.Common]: 'text-gray-300',
    [Rarity.Uncommon]: 'text-green-400',
    [Rarity.Rare]: 'text-blue-400',
    [Rarity.Epic]: 'text-purple-500',
    [Rarity.Legendary]: 'text-yellow-400',
};

// Electric Shock Constants
export const SHOCK_DEVICE_COST = 150;
export const SHOCK_STUN_DURATION_MS = 5000; // 5 seconds
export const SHOCK_CAUGHT_CHANCE = 0.3; // 30%
export const SHOCK_FINE = 300;
