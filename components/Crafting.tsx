import React, { useState } from 'react';
import { ALL_ITEMS } from '../constants';
import { Item, ItemType, Rarity } from '../types';

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { itemId: string; quantity: number }[];
  result: Item;
  craftingTime: number; // in seconds
  requiredLevel: number;
}

interface CraftingProps {
  playerInventory: any[];
  playerLevel: number;
  playerMoney: number;
  onCraft: (recipeId: string, recipeName: string, success: boolean) => void;
}

const Crafting: React.FC<CraftingProps> = ({ playerInventory, playerLevel, onCraft }) => {
  const [selectedCategory, setSelectedCategory] = useState<'bait' | 'rod' | 'special'>('bait');

  // Define crafting recipes
  const recipes: Recipe[] = [
    // Bait recipes
    {
      id: 'recipe_magic_bait',
      name: 'Magic Bait',
      description: 'Craft enchanted bait that attracts rare fish',
      ingredients: [
        { itemId: 'fish_1', quantity: 3 }, // 3 Guppies
        { itemId: 'treasure_1', quantity: 1 }, // 1 Small Chest
      ],
      result: {
        id: 'bait_magic',
        name: 'Magic Bait',
        description: 'Enchanted bait that attracts rare fish.',
        value: 100,
        type: ItemType.Bait,
        rarity: Rarity.Epic,
        icon: '🪄', // Placeholder icon
      },
      craftingTime: 30,
      requiredLevel: 5,
    },
    {
      id: 'recipe_super_bait',
      name: 'Super Bait',
      description: 'Premium bait for legendary fish',
      ingredients: [
        { itemId: 'fish_4', quantity: 2 }, // 2 Golden Carp
        { itemId: 'treasure_3', quantity: 1 }, // 1 Golden Crown
      ],
      result: {
        id: 'bait_super',
        name: 'Super Bait',
        description: 'Ultimate bait for legendary fish.',
        value: 200,
        type: ItemType.Bait,
        rarity: Rarity.Legendary,
        icon: '⭐', // Placeholder icon
      },
      craftingTime: 60,
      requiredLevel: 10,
    },

    // Rod upgrade recipes
    {
      id: 'recipe_reinforced_rod',
      name: 'Reinforced Rod',
      description: 'Upgrade your rod with better materials',
      ingredients: [
        { itemId: 'rod_basic', quantity: 1 }, // Basic rod (would need to be consumed)
        { itemId: 'treasure_2', quantity: 2 }, // 2 Ancient Relics
      ],
      result: {
        id: 'rod_reinforced',
        name: 'Reinforced Rod',
        description: 'A stronger, more durable fishing rod.',
        value: 300,
        type: ItemType.Rod,
        rarity: Rarity.Uncommon,
        icon: '🔧', // Placeholder icon
      },
      craftingTime: 45,
      requiredLevel: 3,
    },

    // Special items
    {
      id: 'recipe_lucky_charm',
      name: 'Lucky Charm',
      description: 'A mystical charm that increases fishing luck',
      ingredients: [
        { itemId: 'treasure_4', quantity: 1 }, // 1 Diamond Gem
        { itemId: 'fish_5', quantity: 1 }, // 1 Lake Serpent
      ],
      result: {
        id: 'special_lucky_charm',
        name: 'Lucky Charm',
        description: 'Increases chance of catching rare items.',
        value: 500,
        type: ItemType.Treasure,
        rarity: Rarity.Legendary,
        icon: '🍀', // Placeholder icon
      },
      craftingTime: 90,
      requiredLevel: 15,
    },
  ];

  const getInventoryCount = (itemId: string): number => {
    return playerInventory.filter(item => item.id === itemId).length;
  };

  const canCraftRecipe = (recipe: Recipe): boolean => {
    if (playerLevel < recipe.requiredLevel) return false;

    return recipe.ingredients.every(ingredient =>
      getInventoryCount(ingredient.itemId) >= ingredient.quantity
    );
  };

  const getCraftButtonText = (recipe: Recipe): string => {
    if (playerLevel < recipe.requiredLevel) {
      return `Level ${recipe.requiredLevel} required`;
    }

    const missingIngredients = recipe.ingredients.filter(
      ingredient => getInventoryCount(ingredient.itemId) < ingredient.quantity
    );

    if (missingIngredients.length > 0) {
      return 'Missing ingredients';
    }

    return `Craft (${recipe.craftingTime}s)`;
  };

  const getFilteredRecipes = (): Recipe[] => {
    switch (selectedCategory) {
      case 'bait':
        return recipes.filter(r => r.result.type === ItemType.Bait);
      case 'rod':
        return recipes.filter(r => r.result.type === ItemType.Rod);
      case 'special':
        return recipes.filter(r => r.result.type === ItemType.Treasure);
      default:
        return recipes;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">🔨 Crafting Station</h2>

      {/* Category Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 bg-gray-900/50 p-2 rounded-lg">
          {[
            { key: 'bait', label: '🪱 Bait' },
            { key: 'rod', label: '🎣 Rods' },
            { key: 'special', label: '✨ Special' },
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                selectedCategory === category.key
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {getFilteredRecipes().map((recipe) => {
          const canCraft = canCraftRecipe(recipe);
          const hasRequiredLevel = playerLevel >= recipe.requiredLevel;

          return (
            <div
              key={recipe.id}
              className={`p-4 rounded-lg border transition-colors ${
                canCraft
                  ? 'bg-gray-900/50 border-cyan-400 hover:border-cyan-300'
                  : 'bg-gray-900/30 border-gray-600 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{recipe.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{recipe.description}</p>

                  {/* Required Level */}
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      hasRequiredLevel ? 'bg-green-600 text-green-200' : 'bg-red-600 text-red-200'
                    }`}>
                      Level {recipe.requiredLevel} required
                    </span>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1">Ingredients:</p>
                    <div className="space-y-1">
                      {recipe.ingredients.map((ingredient, index) => {
                        const available = getInventoryCount(ingredient.itemId);
                        const item = ALL_ITEMS.find(i => i.id === ingredient.itemId);
                        const hasEnough = available >= ingredient.quantity;

                        return (
                          <div key={index} className="flex items-center text-sm">
                            <span className={`${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                              {available}/{ingredient.quantity} {item?.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1">Result:</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg ${
                        recipe.result.rarity === 'Common' ? 'text-gray-300' :
                        recipe.result.rarity === 'Uncommon' ? 'text-green-400' :
                        recipe.result.rarity === 'Rare' ? 'text-blue-400' :
                        recipe.result.rarity === 'Epic' ? 'text-purple-500' :
                        'text-yellow-400'
                      }`}>
                        {recipe.result.icon}
                      </span>
                      <span className={`font-semibold ${
                        recipe.result.rarity === 'Common' ? 'text-gray-300' :
                        recipe.result.rarity === 'Uncommon' ? 'text-green-400' :
                        recipe.result.rarity === 'Rare' ? 'text-blue-400' :
                        recipe.result.rarity === 'Epic' ? 'text-purple-500' :
                        'text-yellow-400'
                      }`}>
                        {recipe.result.name}
                      </span>
                    </div>
                  </div>

                  {/* Crafting Time */}
                  <div className="text-sm text-cyan-400 mb-3">
                    Crafting time: {formatTime(recipe.craftingTime)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onCraft(recipe.id)}
                disabled={!canCraft}
                className={`w-full font-semibold py-2 px-4 rounded transition-colors ${
                  canCraft
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {getCraftButtonText(recipe)}
              </button>
            </div>
          );
        })}
      </div>

      {getFilteredRecipes().length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No recipes available in this category yet.
        </div>
      )}
    </div>
  );
};

export default Crafting;
