import React from 'react';
import { Item, ItemType, Player, Rarity, Bot, Rod, Bait } from './types';
import { FishIcon, JunkIcon, TreasureIcon, BombIcon, BootIcon, RockIcon, GoldFishIcon, WormIcon, ShrimpIcon, GemIcon, PhoneIcon, CrownIcon } from './components/Icons';

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
  { id: 'treasure_3', name: 'Golden Crown', description: 'A magnificent crown from an ancient civilization.', value: 800, type: ItemType.Treasure, rarity: Rarity.Legendary, icon: React.createElement(CrownIcon, { className: "w-6 h-6 text-yellow-400" }) },
  { id: 'treasure_4', name: 'Diamond Gem', description: 'A precious gem that sparkles with incredible brilliance.', value: 600, type: ItemType.Treasure, rarity: Rarity.Epic, icon: React.createElement(GemIcon, { className: "w-6 h-6 text-cyan-400" }) },

  // Bomb
  { id: 'bomb_1', name: 'Mini Nuke', description: 'Handle with care! Causes a small explosion.', value: -10, type: ItemType.Bomb, rarity: Rarity.Uncommon, icon: React.createElement(BombIcon, { className: "w-6 h-6 text-red-500" }) },

  // Additional Junk/Pollution (Vietnamese themed)
  { id: 'junk_5', name: 'Plastic Bottle', description: 'Non-biodegradable plastic polluting the lake.', value: 0, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(JunkIcon, { className: "w-6 h-6 text-blue-300" }) },
  { id: 'junk_6', name: 'Discarded Battery', description: 'Hazardous waste contaminating the water.', value: 0, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(JunkIcon, { className: "w-6 h-6 text-green-600" }) },
  { id: 'junk_7', name: 'Rusty Rubble', description: 'Old construction debris.', value: 1, type: ItemType.Junk, rarity: Rarity.Uncommon, icon: React.createElement(RockIcon, { className: "w-6 h-6 text-orange-600" }) },
  { id: 'junk_8', name: 'Ancient Smartphone', description: 'A relic from the digital age found deep in the lake.', value: 10, type: ItemType.Junk, rarity: Rarity.Rare, icon: React.createElement(PhoneIcon, { className: "w-6 h-6 text-gray-600" }) },
  { id: 'junk_9', name: 'Coconut Shell', description: 'Natural waste but still needs cleaning.', value: 1, type: ItemType.Junk, rarity: Rarity.Common, icon: React.createElement(JunkIcon, { className: "w-6 h-6 text-brown-600" }) },
];

// Rods (Fishing Rods)
export const ALL_RODS: Rod[] = [
  {
    id: 'rod_basic',
    name: 'Basic Rod',
    description: 'A simple fishing rod for beginners.',
    successRate: 0.7,
    pullSpeed: 1.0,
    durability: 100,
    maxDurability: 100,
    rarity: Rarity.Common,
    value: 0,
  },
  {
    id: 'rod_pro',
    name: 'Professional Rod',
    description: 'Higher success rate and faster pulling.',
    successRate: 0.85,
    pullSpeed: 1.3,
    durability: 150,
    maxDurability: 150,
    rarity: Rarity.Uncommon,
    value: 200,
  },
  {
    id: 'rod_master',
    name: 'Master Angler Rod',
    description: 'Exceptional performance for skilled fishermen.',
    successRate: 0.95,
    pullSpeed: 1.6,
    durability: 200,
    maxDurability: 200,
    rarity: Rarity.Rare,
    value: 500,
  },
  {
    id: 'rod_legendary',
    name: 'Legendary Golden Rod',
    description: 'A rod of legends that almost never fails.',
    successRate: 0.99,
    pullSpeed: 2.0,
    durability: 300,
    maxDurability: 300,
    rarity: Rarity.Legendary,
    value: 2000,
  },
];

export const INITIAL_PLAYER_STATE: Player = {
  name: 'Player',
  level: 1,
  xp: 0,
  money: 50,
  inventory: [],
  shockDevices: 1,
  equippedRod: ALL_RODS[0], // Start with basic rod
  reputation: 0,
  energy: 100,
  maxEnergy: 100,
  pollutionCleaned: 0,
  pollutionLevel: 0,
  disruptiveActions: {
    steals: 0,
    explosions: 0,
    chemicals: 0,
  },
  debt: 0,
  inDebt: false,
  lastLogin: Date.now(),
  debtInterestRate: 0.05, // 5% daily
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

// Baits
export const ALL_BAITS: Bait[] = [
  {
    id: 'bait_worm',
    name: 'Earthworm',
    description: 'Basic bait that attracts common fish.',
    fishTypeMultiplier: {
      'fish_1': 1.5, // Guppy
      'fish_2': 1.2, // Tuna
      'fish_3': 1.0, // Salmon
      'fish_4': 0.8, // Golden Carp
      'fish_5': 0.5, // Lake Serpent
    },
    rarity: Rarity.Common,
    value: 5,
    quantity: 10,
  },
  {
    id: 'bait_shrimp',
    name: 'Fresh Shrimp',
    description: 'Premium bait for larger fish.',
    fishTypeMultiplier: {
      'fish_1': 0.8, // Guppy
      'fish_2': 1.8, // Tuna
      'fish_3': 1.5, // Salmon
      'fish_4': 1.2, // Golden Carp
      'fish_5': 1.0, // Lake Serpent
    },
    rarity: Rarity.Uncommon,
    value: 15,
    quantity: 5,
  },
  {
    id: 'bait_magic',
    name: 'Magic Bait',
    description: 'Enchanted bait that attracts rare fish.',
    fishTypeMultiplier: {
      'fish_1': 0.3, // Guppy
      'fish_2': 0.5, // Tuna
      'fish_3': 1.0, // Salmon
      'fish_4': 2.0, // Golden Carp
      'fish_5': 3.0, // Lake Serpent
    },
    rarity: Rarity.Epic,
    value: 100,
    quantity: 2,
  },
];

// Pollution Effects (affecting lake quality)
export const POLLUTION_EFFECTS = [
  {
    id: 'low_pollution',
    name: 'Slight Contamination',
    description: 'Minor pollution affecting aquatic life.',
    severity: 'Low' as const,
    fishingPenalty: 5, // 5% reduction in catch rates
    divingPenalty: 3, // 3% reduction in diving success
    cleanupTime: 10, // 10 seconds to clean
    trashItems: ['junk_1', 'junk_2', 'junk_3', 'junk_4'], // Associated trash items
  },
  {
    id: 'medium_pollution',
    name: 'Moderate Pollution',
    description: 'Moderate pollution impacting the ecosystem.',
    severity: 'Medium' as const,
    fishingPenalty: 15, // 15% reduction in catch rates
    divingPenalty: 10, // 10% reduction in diving success
    cleanupTime: 20, // 20 seconds to clean
    trashItems: ['junk_5', 'junk_6', 'junk_7', 'junk_9'], // Associated trash items
  },
  {
    id: 'high_pollution',
    name: 'Severe Pollution',
    description: 'Heavy pollution severely affecting lake quality.',
    severity: 'High' as const,
    fishingPenalty: 30, // 30% reduction in catch rates
    divingPenalty: 20, // 20% reduction in diving success
    cleanupTime: 35, // 35 seconds to clean
    trashItems: ['junk_8'], // Associated trash items (rare items)
  },
];

// Energy Constants
export const ENERGY_COST_FISHING = 5;
export const ENERGY_COST_DIVING = 15;
export const ENERGY_COST_CLEANING = 10;
export const ENERGY_REGEN_RATE = 2; // per minute
export const CLEAN_LAKE_REPUTATION_BONUS = 10;

// Pollution Constants
export const getPollutionEffect = (pollutionLevel: number) => {
  if (pollutionLevel >= 50) return POLLUTION_EFFECTS[2]; // High
  if (pollutionLevel >= 25) return POLLUTION_EFFECTS[1]; // Medium
  return POLLUTION_EFFECTS[0]; // Low
};

// Disruptive Action Constants
export const THIEF_TOOLS_COST = 500; // Gold cost for thief tools
export const LAKE_BOMB_COST = 1000;
export const CHEMICAL_BOTTLE_COST = 300;
export const BLACK_MARKET_THRESHOLD = 50; // Reputation below this to access
export const DETECTION_BASE_CHANCE = 0.3; // Base 30%
export const DETECTION_CROWD_BONUS = 0.3; // Additional 30% if crowded
export const STEAL_SUCCESS_DURATION_MS = 10000; // 10s stealth mini-game
export const EXPLOSION_DURATION_MS_MIN = 30000; // 30s min
export const EXPLOSION_DURATION_MS_MAX = 120000; // 2min max
export const CHEMICAL_DURATION_HOURS = 4;
