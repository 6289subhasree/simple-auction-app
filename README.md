# Stellar Auction House

A decentralized auction dApp built on the **Stellar blockchain** using **Soroban smart contracts** — with a live Next.js frontend and Freighter wallet integration.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://auction-next.vercel.app)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue?style=for-the-badge&logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contract-purple?style=for-the-badge)](https://soroban.stellar.org)

---

## What It Does

A trustless, on-chain auction where:

1. The auction is initialized with a starting bid
2. Participants connect their Freighter wallet and place bids
3. Each new bid must exceed the current highest — enforced by the contract
4. The highest bidder and bid amount are stored on-chain, publicly queryable
5. No intermediary — the Soroban contract handles all logic automatically

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Rust + Soroban SDK |
| Blockchain | Stellar Testnet |
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Wallet | Freighter (browser extension) |
| Deployment | Vercel |

---

## Deployed Contract

```
Contract ID: CBQYE25DEZ72FCQ5CTYR5RQGBHCDIBK3NTTCJOG6SXSVKHV7CZDTMP4R
Network:     Stellar Testnet
```

---

## Smart Contract Functions

```rust
// Initialize the auction with a starting bid
pub fn initialize(env: Env, starting_bid: i128)

// Place a bid — must exceed current highest, requires auth
pub fn bid(env: Env, bidder: Address, amount: i128)

// Read the current highest bid
pub fn get_highest_bid(env: Env) -> i128

// Read the current highest bidder
pub fn get_highest_bidder(env: Env) -> Address
```

---

## Project Structure

```
├── contracts/
│   └── hello-world/
│       └── src/
│           ├── lib.rs        # Soroban smart contract
│           └── test.rs       # Contract tests
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Stars.tsx         # Animated star background
│   │   ├── Confetti.tsx      # Bid celebration effect
│   │   └── Toast.tsx         # Notifications
│   └── lib/
│       ├── contract.ts       # Soroban RPC calls
│       ├── useAuction.ts     # React state hook
│       └── freighter.ts      # Freighter wallet integration
├── Cargo.toml
└── package.json
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- Rust + Stellar CLI (for contract deployment)
- [Freighter wallet](https://freighter.app) browser extension set to **Testnet**

### Frontend

```bash
git clone https://github.com/6289subhasree/simple-auction-app.git
cd simple-auction-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Smart Contract (Soroban)

```bash
# Build the contract
cd contracts/hello-world
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --network testnet
```

---

## How to Use

1. Install [Freighter](https://freighter.app) and switch to **Testnet**
2. Get test XLM from [Stellar Friendbot](https://friendbot.stellar.org)
3. Visit the live demo and click **Connect Freighter**
4. Go to **Initialize** tab → set a starting bid → approve in Freighter
5. Go to **Place Bid** tab → enter a higher amount → approve in Freighter
6. Watch the bid-o-meter update live 🎉

---

## Author

**Subhasree Paul**  
B.Tech CSE, IEM Kolkata  
Built for the Stellar Web3 ecosystem hackathon
