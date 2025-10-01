# Challenge Fishing Lake RPG

<img width="1200" height="475" alt="Fishing Lake RPG Banner" src="https://github.com/yana-arch/challenge-fishing-lake-rpg/assets/header-placeholder" />

Welcome to "Challenge Fishing Lake" - where anglers compete not just for rare fish, but must contend with unexpected challenges beneath the lake's surface and cunning rivals in this turn-based strategy fishing RPG!

Project URL: https://github.com/yana-arch/challenge-fishing-lake-rpg

## 🎮 Game Overview

Become the ultimate Fishing King in this immersive RPG where skill, strategy, and a bit of mischief determine your success. Here, luck and fishing ability are only part of the equation – vigilance and cunning tactics are the keys to victory.

### Core gameplay includes:

- **Diverse Fishing System**: Start with a basic fishing rod and upgrade to advanced equipment with different stats (success rate, pulling speed, durability)
- **Varied Baits**: Use different baits tailored for specific fish types (worms, shrimp, synthetic bait) and special baits for rare items
- **Fishing Mini-games**: When fish bite, mini-games appear requiring split-second decisions like timing button holds, following power bars, or mouse tracking fish movements
- **Rich Inventory**: Catch dozens of fish types from common to legendary, plus unique items like stones, bombs, treasures, and environmental hazards

### Unique Features:

- **Self-Catching Mode** (Optional): Dive into the lake yourself using nets or diving techniques

  - **Dangers**: Face aggressive fish, eels, or small sharks requiring evasion mini-games
  - **Risks**: Failure means lost energy or minor injuries preventing fishing for a short time
  - **Rewards**: Catch fish unattainable by rod, or gain higher success rates for certain species

- **"Electrifying" PvP System** (Offline Turn-based):

  - **Goal**: Disrupt other players (starting as bots, multiplayer potential later) to make them lose fish or miss opportunities
  - **How**: Purchase/consume one-time "electro-devices" around neighboring players, causing electro-shock that interrupts their mini-games, makes them lose fish, or stuns them briefly
  - **Risks**:
    - **Detection**: The lake's "security cameras" or other players can spot suspicious activity
    - **Penalties**:
      - Fishing bans: 1 day fishing moratorium
      - Fines: Large money deduction, possible redemption by "repurchasing" lost fish value
      - Reputation loss: Decreases player standing

- **Environmental Impact**: Garbage items pollute the lake, affecting gameplay – clean it up for reputation bonuses!

## 🎯 Game Features

### Core Systems:

- **Rod Upgrades**: Buy and upgrade fishing rods with different statistics
- **Bait Management**: Strategic bait selection for different fish types
- **Mini-games**: Dynamic fishing mini-games tested for smooth 60fps gameplay
- **Shop System**: Purchase equipment, baits, and electro-devices
- **Crafting**: Use caught fish and collected materials to create advanced baits, stat boosters, or small gadgets

### Social & Progression:

- **Leaderboards**: View top anglers, rare fish collectors, wealthiest players
- **Quests**: Daily quests, weekly challenges, story quests (catch legendary fish, clean lake, etc.)
- **Reputation System**: Build or lose reputation through actions - affects VIP access and discounts
- **Levels & Skills**: Level up through fishing, quests; unlock better equipment, new fishing spots, skill points for upgrades
- **Skill Tree**: Faster fishing, rarer fish chances, better self-catching defenses, electro-detection

### Visual Effects:

- **Shock Effects**: Electro-shock targets turn white and shake
- **Explosion Effects**: Mini-bombs create small blasts affecting nearby players
- **Water Effects**: Ripples, bubbles, fallen leaves on the lake surface
- **Shark Attacks**: Water disturbance, wound effects, bubble trails during self-catching danger

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Hooks & Context API
- **Icons & Animations**: Tailwind, CSS Animations
- **Persistence**: LocalStorage for game saves
- **Audio**: Web Audio API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yana-arch/challenge-fishing-lake-rpg.git
   cd challenge-fishing-lake-rpg
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser to start playing!

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎮 How to Play

1. **Start Fishing**: Choose your bait and cast your rod
2. **Master Mini-games**: Time your reactions in fishing mini-games to catch fish successfully
3. **Upgrade Equipment**: Visit the shop to buy better rods and special baits
4. **Strategic PvP**: Use electro-devices strategically without getting caught
5. **Complete Quests**: Take on daily and weekly challenges for rewards
6. **Level Up**: Gain experience, unlock new areas and skill upgrades
7. **Craft Items**: Use your catch to craft powerful baits and tools

## 🏗 Project Structure

```
challenge-fishing-lake-rpg/
├── public/
├── src/
│   ├── components/       # React components
│   │   ├── FishingMinigame.tsx
│   │   ├── DivingMinigame.tsx
│   │   ├── Shop.tsx
│   │   ├── Crafting.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Quests.tsx
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   │   ├── useGameLogic.ts
│   │   └── ...
│   ├── styles/          # CSS styles
│   │   └── animations.css
│   ├── constants.ts     # Game constants
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   └── index.tsx        # App entry point
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 Development Roadmap

### Phase 1 - Core Gameplay (Current)

- Basic lake interface and player avatars
- Core fishing system with mini-games
- Basic inventory and fish selling
- Save/load system

### Phase 2 - Unique Features

- Electro-PvP system with detection
- Self-catching mode with dangers
- Rod upgrades and bait purchasing
- Simple leveling system

### Phase 3 - Polish & Expansion

- Enhanced UI animations
- More fish, items, quests
- Crafting system
- Multiplayer potential

## 🤝 Contributing

Feel free to submit issues and feature requests!

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

**Ready to become the Fishing King? Cast your rod and let the challenge begin! 🎣**

Built with ❤️ using React, TypeScript, and Tailwind CSS
