# RobinAI Mobile App (iOS & Android) — Complete Master Guide

The official native companion mobile application for **RobinAI**, built with **React Native + Expo** and **Expo Router**.

Connects directly to the existing RobinAI website backend (`server.js`), AI services, user accounts, and brand design system (`#B6FF00` Neon Lime on `#0A0A0A` Dark Background).

---

## 📱 Features & Native Modules

- **5-Tab Native Navigation**:
  1. **Home**: Hero brand welcome (*"I'm Robin, your AI assistant"*), recent conversation history, market snapshot, quick prompts.
  2. **AI Chat**: Native `KeyboardAvoidingView`, Markdown formatting, code block syntax highlighting, copy response, retry/regenerate, share, and reasoning thought inspector.
  3. **Intelligence**: Real-time CoinGecko market radar, on-chain transaction hash decoder, wallet health scanner, and anti-scam red flag audit.
  4. **History**: Categorized conversation history (**Today**, **Yesterday**, **Previous 7 Days**, **Older**) with search filter, swipe-to-delete, and rename modal.
  5. **Profile**: User avatar, Free vs Pro subscriber badge, daily usage limit analytics, edit profile, and logout.
- **Authentication**: Email/password registration, login, session persistence via `expo-secure-store`, password reset, and account deletion.
- **Subscription Architecture**: Paywall comparing Free vs Pro tier ($19/mo or $190/yr) with native Apple In-App Purchase & Google Play Billing hooks.
- **Hardware Integrations**:
  - Haptic feedback via `expo-haptics`
  - Face ID & Biometric lock via `expo-local-authentication`
  - Push notification token registration via `expo-notifications`
  - Resilient offline fallback engine adhering to Robin's core security rules

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# In the mobile directory:
cd mobile
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `EXPO_PUBLIC_API_URL` to your backend:
- **Physical phone over Wi-Fi**: `http://<YOUR_LOCAL_IP>:4000` (e.g. `http://192.168.1.100:4000`)
- **iOS Simulator**: `http://localhost:4000`
- **Android Emulator**: `http://10.0.2.2:4000`
- **Production Cloud**: `https://robinai-eight.vercel.app` (or your custom backend domain)

*(You can also update this dynamically in the app under Settings → API Endpoint URL)*

### 3. Start Backend & Mobile
```bash
# Terminal 1 (in root folder):
node server.js

# Terminal 2 (in mobile folder):
npx expo start
```
- **iOS**: Scan QR code with Camera app to open in **Expo Go** (or press `i` for iOS Simulator).
- **Android**: Scan QR code inside **Expo Go** app (or press `a` for Android Emulator).
- **Web preview**: Press `w` to preview in your browser.

---

## 📦 App Store & Google Play Deployment

### 1. Install & Log In to EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure Project with EAS
```bash
eas project:init
```

### 3. iOS — Apple TestFlight & App Store
1. **Enroll in Apple Developer Program** ($99/year at [developer.apple.com](https://developer.apple.com)).
2. **Build for Apple TestFlight** (internal/external testers):
   ```bash
   eas build --platform ios --profile preview
   ```
3. **Build for App Store Release**:
   ```bash
   eas build --platform ios --profile production
   ```
4. **Submit to App Store Connect**:
   ```bash
   eas submit --platform ios
   ```

### 4. Android — Google Play Console
1. **Create Google Play Developer Account** ($25 one-time at [play.google.com/console](https://play.google.com/console)).
2. **Generate Standalone APK** (for direct test installation on any Android device):
   ```bash
   eas build --platform android --profile preview
   ```
3. **Generate Android App Bundle (AAB)** (for Google Play Store submission):
   ```bash
   eas build --platform android --profile production
   ```
4. **Submit to Google Play Track**:
   ```bash
   eas submit --platform android --track internal
   ```

---

## 📋 App Store Metadata Reference

When submitting to App Store Connect & Google Play Console:

| Field | Recommended Value |
|---|---|
| **App Name** | RobinAI |
| **Subtitle** | AI Assistant & Crypto Intel |
| **Category** | Productivity / Finance |
| **Age Rating** | 12+ (Infrequent advisory content) |
| **Primary Color** | `#B6FF00` (Neon Lime) on `#0A0A0A` |
| **Support Email** | support@robinai.com |
| **Description** | RobinAI is an intelligent multi-model AI platform designed to provide users with reliable general assistance (writing, coding, research, productivity) while offering specialized intelligence for cryptocurrency and blockchain topics (transaction inspection, wallet analysis, tokenomics, smart contract risk, and scam detection). |
| **Keywords** | AI assistant, crypto, blockchain, Bitcoin, Ethereum, web3, wallet security, scam audit |

---

## 🔑 Required API Keys & Credentials Checklist

When you are ready to connect production live services, plug in the following credentials:

| Service | Environment Variable | Where to Obtain | Purpose |
|---|---|---|---|
| **Gemini AI** | `GEMINI_API_KEY` in root `.env` | [Google AI Studio](https://aistudio.google.com/) (Free) | Powers live Robin AI chat reasoning |
| **Etherscan** | `ETHERSCAN_API_KEY` in root `.env` | [Etherscan Developer Portal](https://etherscan.io/myapikey) (Free) | Powers real-time EVM transaction & wallet lookup |
| **CoinGecko** | `COINGECKO_API_KEY` (Optional) | [CoinGecko API](https://www.coingecko.com/en/api) | High-rate spot pricing |
| **JWT Secret** | `JWT_SECRET` in root `.env` | Any random 64-char string | Encrypts authentication tokens |
| **RevenueCat** | `EXPO_PUBLIC_REVENUECAT_*` in `mobile/.env` | [RevenueCat Dashboard](https://www.revenuecat.com/) | Syncs native Apple & Google In-App Purchases |
| **Apple Dev** | Apple Team ID & Credentials | [developer.apple.com](https://developer.apple.com) | App Store & TestFlight release |
| **Google Play** | Service Account JSON | [play.google.com/console](https://play.google.com/console) | Google Play Store release |

---

## 📁 Mobile Directory Structure

```text
mobile/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx         # Auth stack
│   │   ├── login.tsx           # Email + Password Login
│   │   ├── register.tsx        # Registration
│   │   └── forgot.tsx          # Password Reset
│   ├── (tabs)/
│   │   ├── _layout.tsx         # 5-Tab Navigation (Home, Chat, Intel, History, Profile)
│   │   ├── index.tsx           # Home Dashboard Screen
│   │   ├── chat.tsx            # AI Chat Screen
│   │   ├── intelligence.tsx    # Crypto Radar & On-chain Screen
│   │   ├── history.tsx         # Categorized History Screen
│   │   └── profile.tsx         # User Profile & Usage Screen
│   ├── subscription.tsx        # Subscription & IAP Paywall Screen
│   ├── settings.tsx            # Full Settings Screen
│   └── _layout.tsx             # Root Stack & Auth/Chat Providers
├── assets/
│   ├── icon.png                # Official RobinAI App Icon
│   ├── adaptive-icon.png       # Android Adaptive Icon
│   ├── splash.png              # Splash Screen
│   └── favicon.png             # Web/PWA Favicon
├── constants/
│   └── colors.ts               # Official #B6FF00 & #0A0A0A brand tokens
├── services/
│   ├── api.ts                  # HTTP client & offline fallback
│   ├── authService.ts          # Auth & SecureStore token manager
│   ├── chatService.ts          # Conversation sync service
│   ├── intelligenceService.ts  # On-chain & Market data service
│   └── subscriptionService.ts  # IAP & RevenueCat hooks
├── store/
│   ├── AuthContext.tsx         # User authentication state
│   └── ChatContext.tsx         # Active conversation & message state
├── app.json                    # Expo Native Configuration
├── eas.json                    # EAS Build Profiles
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript Configuration
└── README.md                   # Complete Guide
```
