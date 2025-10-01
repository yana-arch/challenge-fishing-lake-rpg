import React from 'react';
import { ALL_RODS, ALL_BAITS } from '../constants';
import { Rod, Bait } from '../types';

interface ShopProps {
  playerMoney: number;
  onBuyRod: (rodId: string) => void;
  onBuyBait: (baitId: string) => void;
}

const Shop: React.FC<ShopProps> = ({ playerMoney, onBuyRod, onBuyBait }) => {
  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">Fishing Shop</h2>

      {/* Rods Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-gray-600 pb-2">
          🎣 Fishing Rods
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_RODS.map((rod) => (
            <div
              key={rod.id}
              className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{rod.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  rod.rarity === 'Common' ? 'bg-gray-600 text-gray-200' :
                  rod.rarity === 'Uncommon' ? 'bg-green-600 text-green-200' :
                  rod.rarity === 'Rare' ? 'bg-blue-600 text-blue-200' :
                  rod.rarity === 'Epic' ? 'bg-purple-600 text-purple-200' :
                  'bg-yellow-600 text-yellow-200'
                }`}>
                  {rod.rarity}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-3">{rod.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="text-green-400">
                  Success Rate: {Math.round(rod.successRate * 100)}%
                </div>
                <div className="text-blue-400">
                  Pull Speed: {rod.pullSpeed}x
                </div>
                <div className="text-yellow-400">
                  Durability: {rod.durability}/{rod.maxDurability}
                </div>
                <div className="text-cyan-400">
                  Value: {rod.value}g
                </div>
              </div>

              <button
                onClick={() => onBuyRod(rod.id)}
                disabled={playerMoney < rod.value || rod.value === 0}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                {rod.value === 0 ? 'Already Owned' : `Buy - ${rod.value}g`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Baits Section */}
      <div>
        <h3 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-gray-600 pb-2">
          🪱 Fishing Baits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_BAITS.map((bait) => (
            <div
              key={bait.id}
              className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{bait.name}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  bait.rarity === 'Common' ? 'bg-gray-600 text-gray-200' :
                  bait.rarity === 'Uncommon' ? 'bg-green-600 text-green-200' :
                  bait.rarity === 'Rare' ? 'bg-blue-600 text-blue-200' :
                  bait.rarity === 'Epic' ? 'bg-purple-600 text-purple-200' :
                  'bg-yellow-600 text-yellow-200'
                }`}>
                  {bait.rarity}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-3">{bait.description}</p>

              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-1">Fish Type Multipliers:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(bait.fishTypeMultiplier).map(([fishId, multiplier]) => (
                    <div key={fishId} className="text-cyan-300">
                      {fishId.replace('fish_', '').toUpperCase()}: {multiplier}x
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-yellow-400 font-semibold">
                  Quantity: {bait.quantity}
                </span>
                <span className="text-cyan-400 font-semibold">
                  {bait.value}g each
                </span>
              </div>

              <button
                onClick={() => onBuyBait(bait.id)}
                disabled={playerMoney < bait.value}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Buy - {bait.value}g
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
