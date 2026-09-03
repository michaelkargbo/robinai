# RobinAI — Intelligent Assistant & Crypto Intelligence Platform

![RobinAI Brand](https://img.shields.io/badge/RobinAI-Neon%20Lime%20%23B6FF00-brightgreen?style=for-the-badge)
![Live on Vercel](https://img.shields.io/badge/Live-Vercel-black?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge)

**RobinAI** is an intelligent, multi-model AI platform designed to provide reliable general assistance (research, problem-solving, writing, coding) while offering specialized intelligence for cryptocurrency and blockchain topics (transaction inspection, wallet analysis, tokenomics, smart contract risk, and fraud detection).

---

## 🌐 Live Demo

> ### 👉 **[https://robinai-eight.vercel.app](https://robinai-eight.vercel.app)**

Deployed on **Vercel** — free global CDN with HTTPS. Works on any device, any browser, anywhere in the world.

---

## ⚡ Key Highlights & Capabilities

- 🎨 **Official Brand System**: Modern dark theme with the signature `#B6FF00` neon lime identity, sleek glassmorphism cards, and futuristic UI design.
- 🧠 **Multi-Model Intelligence**:
  - `Robin Auto` (Default dynamic intelligent router)
  - `Robin Crypto Pro` (Specialized on-chain intelligence)
  - `GPT-4o`, `Claude 3.7 Sonnet`, `Gemini 2.5 Pro`, `DeepSeek R1`
- 🔍 **Specialized Crypto Cards**:
  - **PriceCard**: Live simulated spot pricing, 24h range bar, volume, market cap, and circulating supply.
  - **TransactionCard**: EVM/Solana transaction hash decoder, confirmation counter, gas fee calculator in Gwei & USD.
  - **WalletCard**: Multi-token asset balance overview, net worth estimator, and safety score.
  - **TokenCard**: Tokenomics, liquidity depth, FDV, honeypot risk checks, and buy/sell tax diagnostics.
  - **ScamCard**: Red flag detection, threat rating badge, and immediate 5-step emergency mitigation protocol.
- 💡 **Interactive Hubs & Modals**:
  - **Explore Prompts Hub**: 24+ pre-crafted prompt templates across Crypto, Security, Coding, and General Knowledge.
  - **Live Market Radar**: Real-time ticker for top 10 cryptocurrencies (BTC, ETH, SOL, BNB, XRP, ADA, AVAX, LINK, SUI, NEAR) with 1-click Robin analysis.
  - **Safety & Anti-Scam Center**: Interactive emergency checklist for compromised wallets and malicious permissions.
  - **Export Center**: Export chat logs to Markdown/Text or structured JSON.
  - **Custom Settings**: Personalize Robin's system instructions, configure optional live API keys (Gemini, OpenAI), and adjust strictness.
- 🎙️ **Voice & Audio**:
  - Built-in **Text-to-Speech (TTS)** voice synthesis for assistant responses.
  - **Speech-to-Text** voice input support via Web Speech API.

---

## 🚀 Getting Started

### Option 1: Live Online (No Installation)

Open the live app instantly in any browser on any device:

```text
https://robinai-eight.vercel.app
```

### Option 2: Run Locally with Vite / Node.js

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Build production bundle
npm run build
```

### Option 3: Deploy Your Own Free Instance (Website)

```bash
# Install Vercel CLI & login (one-time)
npm install -g vercel
npx vercel login

# Deploy to production — get your own free URL
npx vercel deploy --prod --yes
```

---

## 📱 Mobile Companion App (iOS & Android)

The RobinAI native mobile app is built with **React Native + Expo** and connects directly to the shared backend:

```bash
# Navigate to the mobile app directory
cd mobile

# Install dependencies
npm install

# Start local Expo server
npx expo start
```

- **Open on iOS**: Scan the QR code with your iPhone Camera (via Expo Go) or press `i` for iOS Simulator.
- **Open on Android**: Scan the QR code in the Expo Go app or press `a` for Android Emulator.
- Full details in [mobile/README.md](file:///c:/Users/micky/OneDrive/Desktop/robinai/mobile/README.md).

---

## 🛡️ Security Guarantees

RobinAI adheres to strict security rules:

- **Permanent Rule**: RobinAI will never request your private key or 12/24-word recovery phrase.
- Public blockchain data is read-only and requires zero wallet connection permissions.
- Optional API keys entered in Settings are stored strictly in local browser state and never transmitted to third parties.

---

## 📁 Project Structure

```text
robinai/
├── RobinAI.jsx                           # Master React Web Application component
├── server.js                             # Express backend API (Gemini AI, CoinGecko, Etherscan)
├── index.html                            # Vite entry HTML
├── main.jsx                              # React DOM mounting script
├── index.css                             # Tailwind CSS & custom design tokens
├── vite.config.js                        # Vite dev server configuration (port 3000)
├── ROBINAI_MASTER_PROMPT.md              # Complete 18-section Master System & Product Prompt
├── mobile/                               # Native Mobile App (React Native + Expo)
│   ├── app/                              # Expo Router screens (Home, Chat, Radar, Safety, Settings)
│   ├── constants/colors.ts               # Shared #B6FF00 brand design tokens
│   ├── services/api.ts                   # Unified API & offline fallback engine
│   ├── app.json                          # iOS bundle ID, Android package, permissions
│   ├── eas.json                          # EAS Build profiles (TestFlight, Google Play)
│   ├── package.json                      # Mobile dependencies
│   └── README.md                         # Mobile setup & store release guide
├── package.json                          # Web & backend dependencies
└── README.md                             # Platform documentation
```
