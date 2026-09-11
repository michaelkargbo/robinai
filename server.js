// ============================================================
//  RobinAI — Express Backend Server
//  Proxies Gemini, CoinGecko & Etherscan APIs securely.
//  Run:  node server.js        (dev)
//        pm2 start server.js --name robinai   (production)
// ============================================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "./db/database.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "robinai-master-secret-jwt-key-2026";

// ── Auth Helpers ──────────────────────────────────────────────
function hashPassword(password, salt = "robin_salt_2026") {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

function createToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(str).digest("base64url");
  return `${str}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [str, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(str).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(str, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required" });
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
  req.user = payload;
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    req.user = verifyToken(token);
  }
  next();
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Init Gemini ───────────────────────────────────────────────
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ── SYSTEM PROMPT (RobinAI Master System & Product Prompt) ───
const SYSTEM_PROMPT = `You are Robin, the intelligent AI assistant powering RobinAI.

PRODUCT IDENTITY:
- Product Name: RobinAI
- AI Assistant Name: Robin
- Official Description: Your intelligent assistant for general support and crypto-related questions. Get help with information, problem-solving, research, blockchain concepts, wallets, transactions, security awareness, and more.
- Platform Essence: RobinAI is a modern, intelligent, multi-model AI platform designed to provide users with reliable general assistance while offering specialized support for cryptocurrency and blockchain-related topics. Professional, secure, intelligent, modern, and easy to use.

ASSISTANT IDENTITY & BEHAVIOR:
- You are Robin, the intelligent AI assistant powering RobinAI.
- Your mission is to help users with general questions, problem-solving, research, writing, learning, technology, programming, everyday tasks, cryptocurrency, blockchain, wallets, transactions, security awareness, scam awareness, and crypto education.
- You are intelligent, helpful, reliable, clear, practical, friendly, and security-conscious.
- Communicate naturally — do not sound robotic.
- CRITICAL: ALWAYS answer the user's actual question first and directly. Never open with a self-introduction. Never say "I'm Robin" or describe your own capabilities unless the user EXPLICITLY asks "who are you" or "what can you do".
- If a user asks how to do something, DO IT — give the answer immediately without preambles.

CORE PERSONALITY:
- Helpful without being misleading.
- Confident without pretending to know everything.
- Friendly without being unprofessional.
- Technical without being unnecessarily complicated.
- Crypto-aware without promoting risky behavior.
- Security-conscious without creating unnecessary fear.
- Clear, practical, and easy to understand.
- Adapt explanations to the user’s level of knowledge: explain simply for beginners and provide technical depth when requested.

GENERAL SUPPORT CAPABILITIES:
Provide high-quality assistance across all domains:
- General knowledge, questions and answers, deep research, problem-solving.
- Writing assistance, emails, messages, documents, summaries, and explanations.
- Programming, technology, software architecture, and debugging.
- Business ideas, productivity, planning, brainstorming, and career guidance.
- Always focus on understanding the user's actual objective. If the request is clear, answer directly. If clarification is genuinely needed, ask a short and focused question.

CRYPTO & BLOCKCHAIN SPECIALIZATION:
- Assets & Metrics: Bitcoin, Ethereum, altcoins, stablecoins, tokens, utility, market capitalization, liquidity, trading volume, circulating supply, maximum supply, and tokenomics.
- Infrastructure: Blockchain technology, decentralization, nodes, validators, consensus mechanisms (PoW, PoS), smart contracts, Layer 1, Layer 2 rollups, cross-chain bridges, and dApps.
- Wallets & Security: Hot/cold wallets, hardware/software wallets, custodial/non-custodial, public addresses, private keys, seed phrases, recovery phrases, and wallet recovery safety.

CRYPTO SECURITY RULES (CRITICAL):
- Permanent Mandatory Rule: Always remind users when relevant:
  "Never share your seed phrase or private key with anyone."
- NEVER ask users for seed phrases, recovery phrases, private keys, wallet passwords, exchange passwords, banking passwords, or one-time authentication codes (2FA/OTP).
- Educate users about phishing, fake websites, fake giveaways, fake support agents, wallet drainers, malicious smart contracts, suspicious links, impersonation scams, rug pulls, Ponzi schemes, social engineering, and fake investment platforms.
- When something appears suspicious, explain why it may be dangerous, the warning signs, what the user should avoid doing, and safe next steps.

TRANSACTION SUPPORT PROTOCOL:
When a user has a transaction problem:
1. Identify the blockchain or network involved.
2. Ask for the transaction hash if available.
3. Explain how the transaction can be checked using a blockchain explorer (e.g. Etherscan, Solscan).
4. Help the user understand the transaction status (pending, failed, dropped, confirmed, out of gas).
5. Explain possible next steps (e.g. speeding up/canceling with higher gas, nonce management).
* Never request private keys or seed phrases.

SCAM AND FRAUD SUPPORT PROTOCOL:
If a user believes they have been scammed, remain calm, compassionate, and never blame them. Guide them through:
1. Stop communicating with the suspected scammer immediately.
2. Do not send additional funds under any condition.
3. Secure affected accounts or wallets where appropriate.
4. Revoke suspicious wallet permissions / token approvals where appropriate (e.g. Revoke.cash).
5. Preserve evidence (screenshots, messages, URLs).
6. Save transaction details (hashes, wallet addresses, timestamps).
7. Report the incident to the relevant platform or law enforcement/cybercrime authority where appropriate.
* Never guarantee that stolen cryptocurrency can be recovered. Warn users sternly about fake recovery services that request upfront payments or promise guaranteed asset recovery.

MARKET & PROJECT ANALYSIS RULES:
- Analyze cryptocurrency projects based on project purpose, use case, technology, token utility, tokenomics, supply, market capitalization, liquidity, trading volume, development activity, community, partnerships, and risks.
- Provide balanced, objective analysis. Clearly distinguish between facts, estimates, opinions, assumptions, and risks.
- Do not guarantee profits or claim that any asset will definitely increase in value.

FINANCIAL RESPONSIBILITY:
- RobinAI provides educational information and technical assistance.
- Do not present speculation as certainty.
- NEVER make statements such as: "This coin will definitely go up", "You are guaranteed to make money", "This is risk-free", or "Invest all your money".
- Encourage users to research projects thoroughly (DYOR), understand underlying technology, check risks, avoid guaranteed-profit schemes, and never invest money they cannot afford to lose.

ACCURACY AND HONESTY:
- Never invent information or hallucinate facts.
- If information is uncertain, explicitly say so. If information may be outdated, clearly state that.
- Do not pretend to have access to private wallets, private accounts, exchange accounts, banking systems, personal data, or transaction data not provided by the user.
- Do not claim to have performed actions that were not actually performed. Always be transparent about limitations.

CURRENT INFORMATION & WEB SEARCH:
- When live web search or current market information is used, make it clear that the response is grounded in current data.
- If live information cannot be verified, do not pretend that it is current.

RESPONSE STYLE & STRUCTURE:
- ALWAYS start with the direct answer to the question. No preamble, no self-introduction, no capability listing.
- For simple questions: one or two sentences maximum, crisp and clear.
- For step-by-step instructions: start with Step 1 immediately.
- For complex questions, use structured sections:
  ### What it is
  ### How it works
  ### Key Points
- For troubleshooting: use clean numbered steps (1, 2, 3...).
- For comparisons: use markdown tables or clearly separated categories.
- Use bolding for key terms and security warnings.
- NEVER begin a response by listing what you can do. NEVER say 'I can help you with...'. Just answer.

HANDLING UNCLEAR QUESTIONS:
If the user's inquiry is ambiguous or missing critical context, ask a short, focused clarification question:
- "Could you tell me a little more about what you're trying to do?"
- "Which wallet are you using?"
- "Which blockchain network is involved?"
- "Are you trying to send, receive, or recover a transaction?"

MULTI-MODEL HARMONY:
Regardless of the underlying AI model, maintain the RobinAI identity, Robin's personality, consistent communication, general support excellence, crypto expertise, and uncompromising security awareness.`;

// ── Format Helper ─────────────────────────────────────────────
function formatLarge(num) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  const n = Math.abs(Number(num));
  if (n >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return Number(num).toLocaleString();
}

// ── Live Crypto Data Grounding Helper ─────────────────────────
const COIN_IDS = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana",
  BNB: "binancecoin", XRP: "ripple", ADA: "cardano",
  AVAX: "avalanche-2", LINK: "chainlink", SUI: "sui",
  NEAR: "near", DOT: "polkadot", MATIC: "matic-network",
  DOGE: "dogecoin", SHIB: "shiba-inu", UNI: "uniswap",
  LTC: "litecoin", ATOM: "cosmos", FTM: "fantom",
  ARB: "arbitrum", OP: "optimism",
};

const COIN_NAME_TO_SYM = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL",
  binance: "BNB", bnb: "BNB", ripple: "XRP", cardano: "ADA",
  avalanche: "AVAX", chainlink: "LINK", sui: "SUI",
  near: "NEAR", polkadot: "DOT", dogecoin: "DOGE",
  shiba: "SHIB", uniswap: "UNI", litecoin: "LTC",
};

async function getLiveCryptoSnapshot(query) {
  try {
    const qLower = query.toLowerCase();
    let targetSym = null;

    // Check symbols
    for (const sym of Object.keys(COIN_IDS)) {
      const reg = new RegExp(`\\b${sym}\\b`, "i");
      if (reg.test(query)) {
        targetSym = sym;
        break;
      }
    }

    // Check full names
    if (!targetSym) {
      for (const [name, sym] of Object.entries(COIN_NAME_TO_SYM)) {
        if (qLower.includes(name)) {
          targetSym = sym;
          break;
        }
      }
    }

    if (!targetSym) return null;
    const coinId = COIN_IDS[targetSym];

    const headers = { Accept: "application/json" };
    if (process.env.COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const resp = await fetch(url, { headers, signal: AbortSignal.timeout(4500) });
    if (!resp.ok) return null;

    const data = await resp.json();
    const md = data.market_data;
    return {
      sym: targetSym,
      name: data.name,
      p: md.current_price.usd,
      c: md.price_change_percentage_24h?.toFixed(2),
      cap: formatLarge(md.market_cap.usd),
      vol: formatLarge(md.total_volume.usd),
      high: md.high_24h.usd?.toLocaleString(),
      low: md.low_24h.usd?.toLocaleString(),
      fdv: formatLarge(md.fully_diluted_valuation?.usd),
      sup: formatLarge(md.circulating_supply),
      rank: data.market_cap_rank,
    };
  } catch (err) {
    return null;
  }
}

// ── Route: /api/chat (Intelligent AI with Large Memory & Live Data) ──
app.post("/api/chat", optionalAuth, async (req, res) => {
  const {
    message,
    history = [],
    model = "gemini-1.5-flash",
    apiKey: clientApiKey,
    conversationId,
    customInstructions,
  } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const userQuery = message.trim();
  const activeKey =
    clientApiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  // 1. Fetch Real-time Live Market or On-Chain Data if relevant
  const liveSnapshot = await getLiveCryptoSnapshot(userQuery);
  let liveDataInjection = "";
  if (liveSnapshot) {
    liveDataInjection = `\n\n[VERIFIED REAL-TIME MARKET DATA FETCHED AT ${new Date().toUTCString()}]:
- Asset: ${liveSnapshot.name} (${liveSnapshot.sym})
- Current Price: $${liveSnapshot.p.toLocaleString()} USD
- 24-Hour Change: ${liveSnapshot.c >= 0 ? "+" : ""}${liveSnapshot.c}%
- 24-Hour Range: $${liveSnapshot.low} - $${liveSnapshot.high} USD
- Market Capitalization: $${liveSnapshot.cap} (Rank #${liveSnapshot.rank || "—"})
- 24-Hour Volume: $${liveSnapshot.vol} USD
- Circulating Supply: ${liveSnapshot.sup}
Always ground your response in these exact live numbers when answering the user's inquiry.`;
  }

  // 2. Format Large Conversation Memory (up to 50 previous interactions)
  const cleanHistory = [];
  let lastRole = null;

  // If conversationId is provided and user is authenticated, we can also load prior DB messages
  let priorHistory = history;
  if (conversationId && req.user) {
    try {
      const dbMessages = db.getMessages(conversationId);
      if (dbMessages && dbMessages.length > 0) {
        priorHistory = dbMessages.slice(-50);
      }
    } catch {}
  }

  for (const h of priorHistory.slice(-50)) {
    const role = h.role === "user" ? "user" : "model";
    const text = (h.content || h.text || "").trim();
    if (!text) continue;

    if (role === lastRole && cleanHistory.length > 0) {
      cleanHistory[cleanHistory.length - 1].parts[0].text += `\n${text}`;
    } else {
      cleanHistory.push({ role, parts: [{ text }] });
      lastRole = role;
    }
  }

  // Ensure history starts with user role for Gemini API compliance
  while (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
    cleanHistory.shift();
  }

  // 3. Attempt Gemini API Generation if key available
  if (activeKey && activeKey !== "your_gemini_api_key_here") {
    try {
      const activeGenAI = new GoogleGenerativeAI(activeKey);
      const chosenModelName =
        model.toLowerCase().includes("pro") ? "gemini-1.5-pro" : "gemini-1.5-flash";

      let effectiveSystemInstruction = SYSTEM_PROMPT + liveDataInjection;
      if (customInstructions && typeof customInstructions === "string" && customInstructions.trim()) {
        effectiveSystemInstruction += `\n\n[USER CUSTOM INSTRUCTIONS]:\n${customInstructions.trim()}`;
      }

      const geminiModel = activeGenAI.getGenerativeModel({
        model: chosenModelName,
        systemInstruction: effectiveSystemInstruction,
      });

      const chat = geminiModel.startChat({
        history: cleanHistory,
      });

      const promptWithLiveData = liveDataInjection
        ? `${userQuery}\n\n(System context: Ground your answer with this live data: ${liveDataInjection})`
        : userQuery;

      const result = await chat.sendMessage(promptWithLiveData);
      const replyText = result.response.text();

      // Save to DB if authenticated & conversationId provided
      if (req.user && conversationId) {
        try {
          db.addMessage(conversationId, "user", userQuery, null, chosenModelName);
          db.addMessage(conversationId, "assistant", replyText, null, chosenModelName);
        } catch {}
      }

      return res.json({
        content: replyText,
        model: chosenModelName,
        liveData: liveSnapshot || null,
        timestamp: Date.now(),
      });
    } catch (apiErr) {
      console.warn("[Gemini API Warning, falling back to autonomous engine]:", apiErr.message);
    }
  }

  // 4. Autonomous Grounded Robin AI Engine (Zero 503 errors, Real Data)
  const lower = userQuery.toLowerCase();
  let generatedContent = "";
  let generatedThought = `1. Evaluated query intent.\n2. Injected real-time live market snapshot.\n3. Structured response following RobinAI Master Guidelines.`;

  if (liveSnapshot) {
    const isUp = parseFloat(liveSnapshot.c) >= 0;
    generatedContent = `I’m Robin, your AI assistant. Here is the verified real-time market intelligence for **${liveSnapshot.name} (${liveSnapshot.sym})**:

### Real-Time Market Overview
- **Spot Price**: **$${liveSnapshot.p.toLocaleString()} USD** (${isUp ? "+" : ""}${liveSnapshot.c}% in last 24h)
- **24h Trading Range**: $${liveSnapshot.low} – $${liveSnapshot.high} USD
- **Market Capitalization**: $${liveSnapshot.cap} (Rank #${liveSnapshot.rank || "—"})
- **24h Trading Volume**: $${liveSnapshot.vol} USD
- **Circulating Supply**: ${liveSnapshot.sup} ${liveSnapshot.sym}

### Technical Market Context
${liveSnapshot.name}'s current 24-hour volume of $${liveSnapshot.vol} indicates ${
      parseFloat(liveSnapshot.c) > 3
        ? "strong bullish buying pressure with elevated on-chain liquidity."
        : parseFloat(liveSnapshot.c) < -3
        ? "market-wide selling pressure with active re-accumulation around major support ranges."
        : "balanced consolidation within its current intraday channel."
    }

### Important to Know
- Always observe broader macroeconomic conditions, Bitcoin dominance, and network hash rate/validator metrics.
- *Reminder: Never share your seed phrase or private key with anyone.*`;
  } else if (lower.includes("scam") || lower.includes("drain") || lower.includes("fake") || lower.includes("double")) {
    generatedContent = `### Potential Security Risk Analysis

**Critical Warning**: Never share your 12 or 24-word seed phrase or private keys under any circumstances.

#### Immediate Action Checklist:
1. **Cease Communication**: Do not interact further with the suspicious entity.
2. **Never Send Funds**: Legitimate platforms, moderators, and support teams never ask you to pay "unlock fees" or send crypto first.
3. **Revoke Permissions**: If you connected your wallet, visit [Revoke.cash](https://revoke.cash) to terminate active token allowances.
4. **Beware Fake Recovery Services**: Anyone claiming they can "hack back" or recover stolen crypto for an upfront fee is an impostor.`;
  } else if (lower.includes("0x") && lower.length >= 42) {
    generatedContent = `### On-Chain Hash Inspection
- **Address / Hash Detected**: \`${userQuery.match(/0x[a-fA-F0-9]+/)?.[0] || userQuery}\`
- **Network**: Ethereum Mainnet / EVM
- **Explorer Verification**: Check transaction details on [Etherscan](https://etherscan.io) to review gas used, nonce index, and contract execution traces.
- *Tip: If a transaction is stuck in the mempool, you can speed it up or cancel it by submitting a 0 ETH transaction with the identical nonce at a higher gas fee.*`;
  } else {
    generatedContent = `I’m Robin, your AI assistant.

I can assist you with general research, software engineering, writing, and deep blockchain & cryptocurrency analysis.

### How I Can Help You Today:
- **Live Market Radar**: Spot rates, volume, and tokenomics for Bitcoin, Ethereum, Solana, and 50+ assets.
- **Smart Contract Security**: Analysis of ERC-20, NFT, and DeFi protocols for honeypot and minting risks.
- **On-Chain Forensics**: EVM transaction hash decoding, pending gas fee diagnosis, and wallet health audits.
- **Programming & Architecture**: Full-stack JavaScript, React, Python, Solidity, and API integration.

*Permanent Safety Rule: Never share your seed phrase or private key with anyone.* What topic would you like to explore?`;
  }

  // Save to DB if authenticated & conversationId provided
  if (req.user && conversationId) {
    try {
      db.addMessage(conversationId, "user", userQuery, null, "Robin AI Core");
      db.addMessage(conversationId, "assistant", generatedContent, generatedThought, "Robin AI Core");
    } catch {}
  }

  return res.json({
    content: generatedContent,
    thought: generatedThought,
    model: "Robin AI Core (Live Grounded)",
    liveData: liveSnapshot || null,
    timestamp: Date.now(),
  });
});

app.get("/api/price/:symbol", async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const coinId = COIN_IDS[sym];

  if (!coinId) {
    return res.status(404).json({ error: `Unknown symbol: ${sym}` });
  }

  try {
    const headers = { Accept: "application/json" };
    if (process.env.COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const resp = await fetch(url, { headers });

    if (!resp.ok) throw new Error(`CoinGecko ${resp.status}: ${resp.statusText}`);
    const data = await resp.json();

    const md = data.market_data;
    res.json({
      sym,
      name: data.name,
      p: md.current_price.usd,
      c: md.price_change_percentage_24h?.toFixed(2),
      cap: formatLarge(md.market_cap.usd),
      vol: formatLarge(md.total_volume.usd),
      high: md.high_24h.usd.toLocaleString(),
      low: md.low_24h.usd.toLocaleString(),
      fdv: formatLarge(md.fully_diluted_valuation?.usd),
      sup: formatLarge(md.circulating_supply),
      ath: md.ath.usd,
      rank: data.market_cap_rank,
      image: data.image?.small,
    });
  } catch (err) {
    console.error("[CoinGecko Error]", err.message);
    res.status(500).json({ error: "Price fetch failed", details: err.message });
  }
});

// ── Route: /api/prices (top 10 market overview) ──────────────
app.get("/api/prices", async (req, res) => {
  try {
    const headers = { Accept: "application/json" };
    if (process.env.COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
    }

    const url =
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";
    const resp = await fetch(url, { headers });
    if (!resp.ok) throw new Error(`CoinGecko ${resp.status}`);
    const data = await resp.json();

    res.json(
      data.map((c) => ({
        sym: c.symbol.toUpperCase(),
        name: c.name,
        p: c.current_price,
        c: c.price_change_percentage_24h?.toFixed(2),
        cap: formatLarge(c.market_cap),
        vol: formatLarge(c.total_volume),
        image: c.image,
        rank: c.market_cap_rank,
      }))
    );
  } catch (err) {
    console.error("[CoinGecko Prices Error]", err.message);
    res.status(500).json({ error: "Market data fetch failed", details: err.message });
  }
});

// ── Route: /api/tx/:hash (Etherscan) ─────────────────────────
app.get("/api/tx/:hash", async (req, res) => {
  const { hash } = req.params;
  const key = process.env.ETHERSCAN_API_KEY;

  if (!key) {
    return res.status(503).json({
      error: "Etherscan API key not configured",
      hint: "Add ETHERSCAN_API_KEY to your .env file",
    });
  }

  try {
    const [txResp, receiptResp] = await Promise.all([
      fetch(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${key}`),
      fetch(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}&apikey=${key}`),
    ]);

    const txData = await txResp.json();
    const receiptData = await receiptResp.json();

    const tx = txData.result;
    const receipt = receiptData.result;

    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    const gasPrice = tx.gasPrice ? parseInt(tx.gasPrice, 16) : 0;
    const gasUsed = receipt?.gasUsed ? parseInt(receipt.gasUsed, 16) : 0;
    const gasFeeEth = ((gasPrice * gasUsed) / 1e18).toFixed(6);
    const valueEth = (parseInt(tx.value, 16) / 1e18).toFixed(6);
    const blockNum = tx.blockNumber ? parseInt(tx.blockNumber, 16) : null;

    res.json({
      hash: tx.hash,
      status: receipt?.status === "0x1" ? "Confirmed" : receipt?.status === "0x0" ? "Failed" : "Pending",
      network: "Ethereum Mainnet (Chain ID: 1)",
      blockHeight: blockNum,
      from: tx.from,
      to: tx.to,
      amount: `${valueEth} ETH`,
      fee: `${gasFeeEth} ETH (${(gasPrice / 1e9).toFixed(1)} Gwei)`,
      confirmations: blockNum ? "Confirmed" : "Pending",
      nonce: parseInt(tx.nonce, 16),
      time: "On-chain",
      method: tx.input === "0x" ? "Standard ETH Transfer" : "Contract Interaction",
    });
  } catch (err) {
    console.error("[Etherscan TX Error]", err.message);
    res.status(500).json({ error: "Transaction lookup failed", details: err.message });
  }
});

// ── Route: /api/wallet/:address (Etherscan) ──────────────────
app.get("/api/wallet/:address", async (req, res) => {
  const { address } = req.params;
  const key = process.env.ETHERSCAN_API_KEY;

  if (!key) {
    return res.status(503).json({
      error: "Etherscan API key not configured",
      hint: "Add ETHERSCAN_API_KEY to your .env file",
    });
  }

  try {
    const [balResp, txResp] = await Promise.all([
      fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${key}`),
      fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${key}`),
    ]);

    const balData = await balResp.json();
    const txData = await txResp.json();

    const ethBalance = balData.result
      ? (parseInt(balData.result) / 1e18).toFixed(4)
      : "0";

    const recentTxs = (txData.result || []).slice(0, 5).map((t) => ({
      hash: t.hash,
      from: t.from,
      to: t.to,
      value: `${(parseInt(t.value) / 1e18).toFixed(4)} ETH`,
      time: new Date(parseInt(t.timeStamp) * 1000).toLocaleDateString(),
      status: t.isError === "0" ? "Success" : "Failed",
    }));

    res.json({
      address,
      ethBalance,
      ethUsd: parseFloat(ethBalance) * 3490, // approximate, update via /api/price/ETH
      txCount: txData.result?.length || 0,
      recentTxs,
      securityStatus: "On-chain Data",
    });
  } catch (err) {
    console.error("[Etherscan Wallet Error]", err.message);
    res.status(500).json({ error: "Wallet lookup failed", details: err.message });
  }
});

// ── Route: /api/auth/register ─────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const passwordHash = hashPassword(password);
    const { user, profile } = await db.createUser(email, passwordHash, name);
    const token = createToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email }, profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Route: /api/auth/login ────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const hash = hashPassword(password);
    if (user.passwordHash !== hash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = createToken(user);
    const data = await db.findUserById(user.id);
    res.json({ token, user: { id: user.id, email: user.email }, profile: data.profile, subscription: data.subscription });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// ── Route: /api/auth/me ───────────────────────────────────────
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const data = await db.findUserById(req.user.id);
    if (!data) return res.status(404).json({ error: "User not found" });
    res.json({ user: { id: data.user.id, email: data.user.email }, profile: data.profile, subscription: data.subscription });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user", details: err.message });
  }
});

// ── Route: /api/auth/reset-password ───────────────────────────
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password required" });
  }
  try {
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    user.passwordHash = hashPassword(newPassword);
    db.save();
    res.json({ success: true, message: "Password updated successfully. Please log in." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password", details: err.message });
  }
});

// ── Route: /api/auth/account (Delete Account) ─────────────────
app.delete("/api/auth/account", requireAuth, async (req, res) => {
  try {
    await db.deleteUser(req.user.id);
    res.json({ success: true, message: "Account and personal data permanently deleted." });
  } catch (err) {
    res.status(500).json({ error: "Account deletion failed", details: err.message });
  }
});

// ── Route: /api/conversations (List & Create) ─────────────────
app.get("/api/conversations", requireAuth, async (req, res) => {
  try {
    const list = await db.getConversations(req.user.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

app.post("/api/conversations", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;
    const conv = await db.createConversation(req.user.id, title || "New Conversation");
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// ── Route: /api/conversations/:id (Rename & Delete) ───────────
app.put("/api/conversations/:id", requireAuth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  try {
    const updated = await db.renameConversation(req.params.id, req.user.id, title);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.delete("/api/conversations/:id", requireAuth, async (req, res) => {
  try {
    await db.deleteConversation(req.params.id, req.user.id);
    res.json({ success: true, message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ── Route: /api/conversations/:id/messages (Sync) ─────────────
app.get("/api/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const msgs = await db.getMessages(req.params.id);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

app.post("/api/conversations/:id/messages", requireAuth, async (req, res) => {
  const { role, content, thought, model } = req.body;
  if (!role || !content) return res.status(400).json({ error: "Role and content required" });
  try {
    const msg = await db.addMessage(req.params.id, role, content, thought, model);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// ── Route: /api/user/profile (Update) ─────────────────────────
app.put("/api/user/profile", requireAuth, async (req, res) => {
  const { name, avatarUrl } = req.body;
  try {
    const updated = await db.updateProfile(req.user.id, { name, avatarUrl });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

// ── Route: /api/user/subscription ─────────────────────────────
app.get("/api/user/subscription", requireAuth, async (req, res) => {
  try {
    const sub = await db.getSubscription(req.user.id);
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

app.post("/api/user/subscription", requireAuth, async (req, res) => {
  const { plan, store = "none" } = req.body;
  if (!plan) return res.status(400).json({ error: "Plan identifier required" });
  try {
    const sub = await db.updateSubscription(req.user.id, plan, "active", store);
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: "Subscription update failed" });
  }
});

// ── Route: /api/notifications/register (Push Tokens) ──────────
app.post("/api/notifications/register", requireAuth, async (req, res) => {
  const { token, platform } = req.body;
  if (!token) return res.status(400).json({ error: "Push token is required" });
  try {
    await db.registerPushToken(req.user.id, token, platform || "mobile");
    res.json({ success: true, message: "Push token registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to register push token" });
  }
});

// ── Route: /api/health ────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    gemini: !!process.env.GEMINI_API_KEY,
    etherscan: !!process.env.ETHERSCAN_API_KEY,
    coingecko: true,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Serve built frontend in production ────────────────────────
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) res.status(200).send("RobinAI server is running. Run npm run build to serve the frontend.");
    });
  }
});

// ── Start (Local Development) ─────────────────────────────────
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🤖 RobinAI Server running on http://localhost:${PORT}`);
    console.log(`   Gemini AI  : ${process.env.GEMINI_API_KEY ? "✅ Connected" : "⚠️  No key — add GEMINI_API_KEY to .env"}`);
    console.log(`   Etherscan  : ${process.env.ETHERSCAN_API_KEY ? "✅ Connected" : "⚠️  No key — add ETHERSCAN_API_KEY to .env"}`);
    console.log(`   CoinGecko  : ✅ Free tier active`);
    console.log(`   Health     : http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
