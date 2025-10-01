import React from 'react';

export enum ItemType {
  Fish = 'Fish',
  Junk = 'Junk',
  Treasure = 'Treasure',
  Bomb = 'Bomb',
  Bait = 'Bait',
  Rod = 'Rod',
}

export enum Rarity {
    Common = 'Common',
    Uncommon = 'Uncommon',
    Rare = 'Rare',
    Epic = 'Epic',
    Legendary = 'Legendary',
}

export interface Item {
  id: string;
  name: string;
  description: string;
  value: number;
  type: ItemType;
  rarity: Rarity;
  icon: React.ReactNode;
}

export interface InventoryItem extends Item {
  instanceId: string;
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  money: number;
  inventory: InventoryItem[];
  shockDevices: number;
  equippedRod?: Rod;
  equippedBait?: Bait;
  reputation: number;
  energy: number;
  maxEnergy: number;
  pollutionCleaned: number;
}

export interface Rod {
  id: string;
  name: string;
  description: string;
  successRate: number;
  pullSpeed: number;
  durability: number;
  maxDurability: number;
  rarity: Rarity;
  value: number;
}

export interface Bait {
  id: string;
  name: string;
  description: string;
  fishTypeMultiplier: Record<string, number>;
  rarity: Rarity;
  value: number;
  quantity: number;
}

export interface Bot {
    id: number;
    name: string;
    position: { top: string; left: string };
    isFishing: boolean;
    stunnedUntil?: number;
}

export enum GameStatus {
  Idle = 'Idle',
  Casting = 'Casting',
  Waiting = 'Waiting',
  Reeling = 'Reeling',
  Caught = 'Caught',
  Diving = 'Diving',
  DivingCombat = 'DivingCombat',
  CleaningLake = 'CleaningLake',
  Crafting = 'Crafting',
}

export enum DangerType {
  Shark = 'Shark',
  ElectricEel = 'ElectricEel',
  Current = 'Current',
  Depth = 'Depth',
}

export interface PollutionEffect {
  id: string;
  name: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  fishingPenalty: number; // Reduces catch rate by percentage
  divingPenalty: number; // Reduces diving success rate by percentage
  cleanupTime: number; // Time to clean in seconds
  trashItems?: string[]; // Associated trash item IDs
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'special';
  requirements: {
    type: 'catch_fish' | 'earn_money' | 'use_shock' | 'dive' | 'sell_items' | 'clean_pollution' | 'craft_items';
    target: number;
    current: number;
    filters?: Record<string, any>; // For specific item types, rarities, etc.
  };
  rewards: {
    xp: number;
    money: number;
    items?: string[];
    reputation?: number;
  };
  completed: boolean;
  claimed: boolean;
  expiresAt?: Date;
  acceptedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: string;
    target: number;
    current: number;
  };
  reward: {
    xp: number;
    money: number;
    reputation: number;
    title?: string; // Unlock special titles
  };
  unlocked: boolean;
  unlockedAt?: Date;
}
