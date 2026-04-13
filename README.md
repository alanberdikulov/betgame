# Betting Suite

An interactive probability-education tool disguised as a betting game. Place stakes across four simultaneous games — coin flips, dice rolls, a card-sum market, and two-card side bets — then watch everything resolve in a single round. Each bet surfaces the true mathematical probability alongside a randomized payout multiplier, helping you build real intuition for expected value, market spreads, and edge.

<p align="center">
  <img src="docs/demo.gif" alt="Betting Suite — full round demo" width="800" />
</p>

---

## Table of Contents

- [Features](#features)
- [Games](#games)
  - [Coin Flips](#coin-flips)
  - [Dice](#dice)
  - [3-Card Market](#3-card-market)
  - [2-Card Side Bets](#2-card-side-bets)
- [Bias & Pricing System](#bias--pricing-system)
- [Round Lifecycle](#round-lifecycle)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Building & Deploying](#building--deploying)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Features

| Capability | Detail |
|-----------|--------|
| **Four games in one round** | Coins, dice, a bid/ask card market, and two-card bets all resolve simultaneously |
| **True probabilities** | Every bet line shows the analytically exact probability — toggle on/off via the toolbar |
| **Dynamic pricing** | Multipliers are regenerated each round with a weighted bias system (Fair / House / Player) |
| **Bid/Ask market** | Trade on the sum of three card ranks with a synthetic spread that occasionally favors the player |
| **Bank management** | Start with $1,000; total stakes are validated against your bank before each round |
| **Round history** | The Outcome panel tracks results and P&L for up to 80 past rounds |
| **Zero backend** | Everything runs client-side — no server, no database, no accounts |
| **PWA-ready** | Includes a service worker and web manifest for offline/installable use |

---

## Games

### Coin Flips

Three fair coins are flipped. Seven bet types are offered:

| Bet | Probability | Description |
|-----|:-----------:|-------------|
| Exact order HTH | 12.5% | The three coins land in exactly this sequence |
| Exact order THT | 12.5% | The three coins land in exactly this sequence |
| Exactly 2 heads | 37.5% | Any two of three coins are heads |
| Exactly 1 head | 37.5% | Exactly one coin is heads |
| At least 2 heads | 50.0% | Two or three coins are heads |
| First coin is H | 50.0% | Only the first coin matters |
| Contains HH | 37.5% | At least two consecutive heads appear |

### Dice

Two standard six-sided dice are rolled. Seven bet types are offered:

| Bet | Probability | Description |
|-----|:-----------:|-------------|
| Sum is 7 | 16.7% | Classic craps-style bet |
| Doubles | 16.7% | Both dice show the same face |
| Sum ≥ 10 | 16.7% | High-roll bet |
| At least one 6 | 30.6% | Either die shows a six |
| Odd sum | 50.0% | The total is odd |
| First die > second | 41.7% | Strict ordering bet |
| Sum in {4, 5} | 19.4% | Low-roll bet |

### 3-Card Market

Three cards are drawn without replacement from a standard 52-card deck (A = 1, J = 11, Q = 12, K = 13). A **bid/ask spread** is quoted on the sum of all three ranks.

- **Buy @Ask** — you profit if the actual sum exceeds the ask price
- **Sell @Bid** — you profit if the actual sum falls below the bid price
- **P&L** = `units × (actual_sum − entry_price)` for buys; reversed for sells

The spread (2–4 points) is randomly generated around a sampled fair value, with a **25% chance** of the quote being nudged in the player's favor. Cards stay face-down until the round resolves.

### 2-Card Side Bets

The **first two** cards of the same three-card deal are used for an independent set of bets:

| Bet | Probability | Description |
|-----|:-----------:|-------------|
| Product of first 2 < 50 | 78.4% | Rank × rank is below 50 |
| Sum of first 2 is even | 51.0% | Both ranks same parity |
| Different colors | 51.0% | One red, one black |
| At least one face card | 47.1% | J, Q, or K among the first two |

Probabilities are computed exactly, accounting for sampling without replacement from 52 cards.

---

## Bias & Pricing System

Each round, every bet's payout multiplier is generated through a two-step process:

1. **Fair multiplier** — `1 / probability` (floored at 1.1×)
2. **Bias perturbation** — a random factor drawn from one of three bands:

| Bias | Selection weight | Factor range | Effect |
|------|:----------------:|:------------:|--------|
| **Fair** | 45% | 0.98 – 1.02 | Multiplier ≈ true fair value |
| **House** | 35% | 0.80 – 0.95 | Multiplier below fair value — the house has an edge |
| **Player** | 20% | 1.05 – 1.25 | Multiplier above fair value — the player has an edge |

Because house-biased lines are generated more often than player-biased ones, the suite is a **slightly negative EV environment** overall — matching how real betting markets operate.

Both the **probability** column and the **bias badge** can be toggled on or off with the toolbar checkboxes, so you can practice with or without that information.

---

## Round Lifecycle

```
┌────────────────────────────────────────────────────────┐
│  1. Multipliers & market quotes refreshed              │
│  2. Place stakes on any/all games + take a market side │
│  3. Click "Start the game"                             │
│     • Total stake validated against bank               │
│     • Coins flipped, dice rolled, 3 cards drawn        │
│     • All bets settled simultaneously                  │
│     • Cards revealed, round P&L displayed              │
│  4. Click "Next" → new multipliers, new quotes, repeat │
└────────────────────────────────────────────────────────┘
```

**Settlement:** winning bets return `stake + round(stake × multiplier)`. Losing stakes are forfeited. Market P&L is added or subtracted separately. Up to **80 rounds** of history are kept in memory.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI framework | React | 18 |
| Language | TypeScript | 5 |
| State management | Zustand | 4 |
| Build tool | Vite | 4 |
| Linting | ESLint + @typescript-eslint | 8 / 6 |
| Deployment | Vercel (static) | — |

No UI component library is used — all layout and styling is hand-written CSS with a responsive grid.

---

## Project Structure

```
betgame/
├── public/
│   ├── manifest.json          # PWA web manifest
│   └── sw.js                  # Service worker for offline support
│
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Round orchestration, settlement logic, predicate maps
│   ├── styles.css             # Global styles (responsive 2×2 grid)
│   │
│   ├── components/
│   │   ├── Outcome.tsx        # Round result display + scrollable history
│   │   ├── Coins.tsx          # Coin-flip betting table, bank status bar, round controls
│   │   ├── Dice.tsx           # Dice betting table
│   │   ├── Market.tsx         # 3-card bid/ask market with card rendering
│   │   └── FirstTwo.tsx       # 2-card side-bet table
│   │
│   ├── store/
│   │   └── useGameStore.ts    # Zustand store — bank, stakes, terms, market, history
│   │
│   └── lib/
│       ├── probabilities.ts   # Analytical probability functions + outcome predicates
│       ├── bias.ts            # Fair multiplier → biased multiplier generation
│       ├── deck.ts            # Card types, 52-card deck, Fisher-Yates shuffle, draw
│       ├── random.ts          # RNG helpers (int, float, weighted choice, coin flip, dice roll)
│       └── format.ts          # Display formatters (money, multiplier, probability, dice faces)
│
├── docs/
│   └── demo.gif               # Screen recording used in this README
│
├── build.cjs                  # Vercel build helper (runs vite build)
├── vite.config.ts             # Vite config (React plugin, relative base path)
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                # Vercel deployment config
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js ≥ 18

```bash
# Clone the repository
git clone <repo-url>
cd betgame

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app opens at [http://localhost:5173](http://localhost:5173) by default.

---

## Building & Deploying

```bash
# Production build (type-check + bundle)
npm run build-with-tsc

# Production build (skip type-check)
npm run build

# Preview the production bundle locally
npm run preview

# Lint
npm run lint
```

### Vercel

The project includes a `vercel.json` that points to `node build.cjs` as the build command and `dist/` as the output directory. Push to a connected repo and Vercel handles the rest — zero additional configuration needed.

---

## Design Decisions

- **Predicates live next to probabilities.** Each bet type in `probabilities.ts` has a paired `*Prob_*` function (returns the exact probability) and a `*Pred_*` function (returns a boolean for a given outcome). This keeps the math auditable in one place.
- **Bias is transparent.** The bias system is intentionally visible to the player (when toggled on) so they can practice identifying +EV and −EV lines — a core skill in real-world betting and trading.
- **Market quotes are imperfect by design.** The bid/ask is centred on a sampled fair value from three independent uniform [1–13] draws rather than the exact without-replacement distribution. This mirrors real-world market-making where the market-maker's model is an approximation.
- **No persistent storage.** Keeping all state in Zustand (in-memory) means a page refresh resets everything. This is deliberate — the tool is for practice sessions, not long-term tracking.

---

## Known Limitations

- **No persistence** — bank and history reset on page refresh.
- **No reset button in the UI** — a `resetGame` action exists in the store but is not yet wired to a button. Refresh the page to restart from $1,000.
- **`Math.random()` only** — adequate for an educational tool, not suitable for audit-grade fairness.
- **No automated tests** — probability functions are analytically correct but have no test suite.
- **Market fair-value approximation** — see [Design Decisions](#design-decisions) above.

---

## License

This project is provided as-is for educational purposes.
