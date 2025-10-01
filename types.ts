export enum ItemType {
  Fish = 'Fish',
  Junk = 'Junk',
  Treasure = 'Treasure',
  Bomb = 'Bomb',
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
}