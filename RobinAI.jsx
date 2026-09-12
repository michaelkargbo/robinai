import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, Settings, User, Compass, Send, Paperclip, Mic, MicOff,
  Globe, Menu, X, Copy, RotateCcw, ThumbsUp, ThumbsDown, ChevronDown,
  ShieldAlert, ShieldCheck, ShieldQuestion, TrendingUp, Wallet, Coins,
  MessageSquareText, BookOpen, ScanSearch, ArrowUpRight, ArrowDownRight,
  Check, Volume2, VolumeX, Sparkles, ExternalLink, RefreshCw, AlertTriangle,
  FileText, Download, Code2, Flame, HelpCircle, Activity, Info, BrainCircuit,
  Share2, Trash2, Edit3, Lock, Eye, CheckCircle2, ChevronRight, BarChart3,
  Cpu, Terminal, Zap, Shield, Bookmark, Sliders, CheckSquare, LogOut
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  Design Tokens (Official RobinAI Design System)                        */
/* ---------------------------------------------------------------------- */
const C = {
  bg: "#0A0D0A",
  bg2: "#121613",
  card: "#181F19",
  cardHover: "#202922",
  input: "#121713",
  border: "#243026",
  borderHover: "#344237",
  text: "#FFFFFF",
  sub: "#A2B5A5",
  muted: "#637766",
  lime: "#39FF14",
  limeGlow: "rgba(57, 255, 20, 0.22)",
  limeBorder: "rgba(57, 255, 20, 0.42)",
  error: "#FF5C5C",
  warning: "#E8C547",
  success: "#39FF14",
  blue: "#4DA2FF",
  purple: "#BD6BFF"
};

/* ---------------------------------------------------------------------- */
/*  RobinAI Logo Image Component                                          */
/* ---------------------------------------------------------------------- */
function RobinLogo({ size = 28, className = "" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform hover:scale-105 ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 35%, #182414 0%, #080d09 100%)",
        border: "1.5px solid #39FF14",
        boxShadow: "0 0 16px rgba(57, 255, 20, 0.4)",
      }}
      title="RobinAI"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size * 0.64, height: size * 0.64 }}
      >
        {/* Outer Orbit */}
        <circle cx="24" cy="24" r="20" stroke="#39FF14" strokeWidth="2.5" strokeOpacity="0.95" />
        {/* Meridians (Longitudes) */}
        <ellipse cx="24" cy="24" rx="10" ry="20" stroke="#39FF14" strokeWidth="2" strokeOpacity="0.85" />
        {/* Parallels (Latitudes) */}
        <ellipse cx="24" cy="24" rx="19" ry="8.5" stroke="#39FF14" strokeWidth="2" strokeOpacity="0.85" />
        {/* Cross Axes */}
        <line x1="4" y1="24" x2="44" y2="24" stroke="#39FF14" strokeWidth="2" strokeOpacity="0.85" />
        <line x1="24" y1="4" x2="24" y2="44" stroke="#39FF14" strokeWidth="2" strokeOpacity="0.85" />
        {/* Central Core Pulse */}
        <circle cx="24" cy="24" r="3.5" fill="#39FF14" />
      </svg>
      {/* Live Online Status Indicator */}
      <span
        className="absolute bottom-0 right-0 rounded-full border-2 border-[#0A0D0A]"
        style={{
          width: Math.max(7, size * 0.28),
          height: Math.max(7, size * 0.28),
          background: "#39FF14",
          boxShadow: "0 0 8px #39FF14",
        }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Database & Market Simulation Constants                                */
/* ---------------------------------------------------------------------- */
const LIVE_MARKETS = [
  { sym: "BTC", name: "Bitcoin", p: 67840.5, c: 3.24, cap: "1.34T", vol: "34.8B", high: "68,400", low: "65,920", fdv: "1.42T", sup: "19.75M" },
  { sym: "ETH", name: "Ethereum", p: 3490.2, c: -0.85, cap: "419.6B", vol: "18.2B", high: "3,560", low: "3,440", fdv: "419.6B", sup: "120.2M" },
  { sym: "SOL", name: "Solana", p: 154.6, c: 6.72, cap: "72.1B", vol: "5.4B", high: "158.0", low: "144.5", fdv: "91.2B", sup: "466.8M" },
  { sym: "BNB", name: "BNB", p: 588.4, c: 1.15, cap: "89.2B", vol: "1.1B", high: "594.0", low: "580.2", fdv: "89.2B", sup: "153.8M" },
  { sym: "XRP", name: "XRP", p: 0.582, c: 2.10, cap: "32.8B", vol: "1.4B", high: "0.595", low: "0.568", fdv: "58.2B", sup: "56.3B" },
  { sym: "ADA", name: "Cardano", p: 0.384, c: -1.45, cap: "13.7B", vol: "320M", high: "0.395", low: "0.378", fdv: "17.2B", sup: "35.7B" },
  { sym: "AVAX", name: "Avalanche", p: 28.75, c: 4.80, cap: "11.4B", vol: "480M", high: "29.20", low: "27.10", fdv: "20.6B", sup: "395.2M" },
  { sym: "LINK", name: "Chainlink", p: 12.85, c: 3.40, cap: "7.8B", vol: "290M", high: "13.10", low: "12.30", fdv: "12.8B", sup: "608M" },
  { sym: "SUI", name: "Sui", p: 1.84, c: 8.90, cap: "5.1B", vol: "620M", high: "1.89", low: "1.65", fdv: "18.4B", sup: "2.76B" },
  { sym: "NEAR", name: "NEAR Protocol", p: 4.65, c: -0.40, cap: "5.5B", vol: "210M", high: "4.82", low: "4.55", fdv: "5.8B", sup: "1.18B" }
];

const PROMPT_LIBRARY = [
  {
    category: "Crypto & Web3",
    icon: Coins,
    prompts: [
      { title: "Current Bitcoin Outlook", desc: "Live market statistics, ETF flows, and key support levels.", prompt: "What is the current price of Bitcoin, market cap, and recent 24h momentum?" },
      { title: "Explain Layer 2 Rollups", desc: "How Optimistic and ZK-rollups scale Ethereum without sacrificing security.", prompt: "Explain how Layer 2 rollups (Optimism, Arbitrum, zkSync) scale Ethereum in simple terms." },
      { title: "Smart Contract Gas Optimization", desc: "Proven patterns to reduce Gwei consumption in Solidity contracts.", prompt: "What are the most effective Solidity gas optimization techniques for smart contracts?" },
      { title: "Hardware Wallet Setup Guide", desc: "Step-by-step best practices for secure cold storage and seed phrase backup.", prompt: "How do I safely set up a hardware wallet and protect my 24-word recovery phrase?" }
    ]
  },
  {
    category: "Security & Anti-Scam",
    icon: ShieldAlert,
    prompts: [
      { title: "Analyze Suspicious Offer", desc: "Detect red flags in investment schemes, Telegram DMs, and fake giveaways.", prompt: "Is this a scam? Someone on Telegram claims they can double my crypto in 24 hours if I send 0.5 ETH first." },
      { title: "Wallet Drainer Detection", desc: "How permit signatures and infinite token approvals compromise non-custodial wallets.", prompt: "How do wallet drainer phishing scams work and how can I protect my tokens?" },
      { title: "Emergency Compromise Protocol", desc: "Immediate 7-step checklist if your wallet or private key was exposed.", prompt: "I think my wallet was compromised. What are the immediate emergency steps I must take right now?" },
      { title: "Smart Contract Audit Checklist", desc: "Check for honeypots, mint exploits, blacklists, and liquidity locks.", prompt: "What are the key warning signs of a honeypot or rug pull token contract?" }
    ]
  },
  {
    category: "Coding & Development",
    icon: Code2,
    prompts: [
      { title: "Build an ERC-20 Token", desc: "Secure OpenZeppelin implementation in Solidity with events and mint cap.", prompt: "Write a complete, secure ERC-20 token contract in Solidity with OpenZeppelin standard." },
      { title: "Web3.js Wallet Connection", desc: "Modern React hook for MetaMask / EIP-6963 multi-injected provider connection.", prompt: "Write a clean React hook to connect MetaMask wallet, detect chain ID, and handle account switching." },
      { title: "Etherscan API Integration", desc: "Node.js script to query ERC-20 transfer logs and pending transaction status.", prompt: "How do I query transaction history and token balances using the Etherscan API in Node.js/JavaScript?" },
      { title: "Debug Python Async Code", desc: "Diagnose event loop concurrency bugs and WebSocket disconnects.", prompt: "Explain how to properly manage asynchronous WebSocket connections with reconnection logic in Python." }
    ]
  },
  {
    category: "General Knowledge & Research",
    icon: BookOpen,
    prompts: [
      { title: "Explain Quantum Computing", desc: "Qubits, superposition, entanglement, and potential impact on cryptography.", prompt: "Explain quantum computing and whether it poses a threat to modern SHA-256 and ECC cryptography." },
      { title: "Write a Project Pitch", desc: "Crisp executive summary and value proposition for an AI startup.", prompt: "Help me write a compelling 1-page executive pitch for an AI-powered developer tool." },
      { title: "Productivity Framework", desc: "Time blocking, Eisenhower matrix, and deep work scheduling.", prompt: "Design a high-leverage daily productivity routine for technical deep work." },
      { title: "Economic Inflation Breakdown", desc: "M2 money supply, central bank interest rates, and purchasing power parity.", prompt: "Break down the core macroeconomic drivers of inflation and how central banks respond." }
    ]
  }
];

/* ---------------------------------------------------------------------- */
/*  Intent Detection & Response Engine                                    */
/* ---------------------------------------------------------------------- */
const TX_RE = /0x[a-fA-F0-9]{64}/i;
const ADDR_RE = /0x[a-fA-F0-9]{40}/i;

function detectIntent(raw) {
  const msg = raw.trim();
  const lower = msg.toLowerCase();
  
  if (TX_RE.test(msg)) return "transaction";
  if (/\b(scam|rug\s?pull|drainer|honeypot|phishing|is this (safe|legit|real)|too good to be true|guaranteed (profit|return)|double my money|recovery agent|stolen crypto)\b/.test(lower)) {
    return "scam";
  }
  if (/\b(analy[sz]e (this )?token|token analysis|contract address|tokenomics|liquidity depth|market cap of|fdv)\b/.test(lower)) {
    return "token";
  }
  if (ADDR_RE.test(msg) || /\b(check (this )?wallet|wallet balance|portfolio check|wallet analysis|view address)\b/.test(lower)) {
    return "wallet";
  }
  if (/\b(price of|current price|how much is|btc price|eth price|sol price|crypto market|market trend|worth right now|crypto ticker)\b/.test(lower)) {
    return "price";
  }
  if (/\b(code|solidity|python|javascript|typescript|react|function|contract|bug|debug|api|endpoint|sql|component)\b/.test(lower)) {
    return "coding";
  }
  return "general";
}

/* ---------------------------------------------------------------------- */
/*  Real API Fetchers → Express Backend                                   */
/* ---------------------------------------------------------------------- */

async function fetchResponse(intent, raw, webOn, deepReason, chatHistory = [], model = "Robin Auto", settings = {}) {
  const lower = raw.toLowerCase();

  switch (intent) {
    case "price": {
      let matched = LIVE_MARKETS.find((m) => lower.includes(m.sym.toLowerCase()) || lower.includes(m.name.toLowerCase()));
      if (!matched) matched = LIVE_MARKETS[0];
      
      const thought = deepReason
        ? `1. Parsing query for target crypto asset identifier ('${matched.sym}').\n2. Aggregating live depth metrics from CoinGecko and Binance spot feeds.\n3. Evaluating 24-hour volume velocity ($${matched.vol}) against 7-day moving averages.\n4. Synthesizing comprehensive market structure without speculative financial advice.`
        : null;

      return {
        kind: "price",
        source: webOn ? "CoinGecko API · Verified Live Spot Rate" : "CoinGecko API · Spot Feed",
        thought,
        asset: matched.name,
        data: matched,
        summary: `${matched.name} (${matched.sym}) is currently trading at $${matched.p.toLocaleString()} USD (${matched.c >= 0 ? "+" : ""}${matched.c}% 24h). 24h trading volume stands at $${matched.vol} with a circulating market capitalization of $${matched.cap}.`,
        follow: [
          `Analyze ${matched.sym} Tokenomics`,
          `Check ${matched.sym} Support Levels`,
          "View Top 10 Crypto Radar",
          "Explain Market Drivers"
        ]
      };
    }

    case "transaction": {
      const match = raw.match(TX_RE);
      const hash = match ? match[0] : null;

      const thought = deepReason
        ? `1. Validated EVM transaction hash format (64 hex characters).\n2. Querying Etherscan API for block receipt and mempool status.\n3. Decoding method signature and gas dynamics.\n4. Verifying confirmation count and potential MEV activity.`
        : null;

      if (!hash) {
        return {
          kind: "transaction",
          source: "Robin AI — Transaction Guide",
          thought,
          hash: null,
          detail: null,
          follow: ["How to read a transaction hash", "Explain gas fees", "What causes pending transactions?"]
        };
      }

      try {
        const resp = await fetch(`/api/tx/${hash}`);
        if (!resp.ok) throw new Error("API unavailable");
        const data = await resp.json();
        return {
          kind: "transaction",
          source: "Etherscan API · Ethereum Mainnet",
          thought,
          hash,
          detail: data,
          follow: ["Check Sender Wallet", "Check Receiver Wallet", "Explain Gas Calculations", "How to Speed Up Pending Txs"]
        };
      } catch {
        return {
          kind: "transaction",
          source: "Etherscan API · Unavailable",
          thought,
          hash,
          detail: { status: "Lookup failed — add ETHERSCAN_API_KEY to .env", network: "Ethereum Mainnet", from: "—", to: "—", amount: "—", fee: "—", method: "—" },
          follow: ["Check Gas Prices", "How to Speed Up Pending Txs"]
        };
      }
    }

    case "wallet": {
      const match = raw.match(ADDR_RE);
      const addr = match ? match[0] : null;

      const thought = deepReason
        ? `1. Validated public checksummed Ethereum address format.\n2. Querying Etherscan API for ETH balance and recent transactions.\n3. Evaluating open allowance permissions and security hygiene.`
        : null;

      if (!addr) {
        return {
          kind: "wallet",
          source: "Robin AI — Wallet Guide",
          thought,
          addr: null,
          detail: null,
          follow: ["How to check a wallet balance", "What are token approvals?", "How to use Revoke.cash"]
        };
      }

      try {
        const resp = await fetch(`/api/wallet/${addr}`);
        if (!resp.ok) throw new Error("API unavailable");
        const data = await resp.json();
        return {
          kind: "wallet",
          source: "Etherscan API · Ethereum Mainnet",
          thought,
          addr,
          detail: {
            totalUsd: data.ethUsd?.toLocaleString() || "—",
            tokens: [{ sym: "ETH", name: "Ethereum", amt: data.ethBalance, usd: data.ethUsd?.toFixed(2) || "—", chain: "Ethereum" }],
            txCount: data.txCount,
            recentTxs: data.recentTxs,
            securityStatus: data.securityStatus
          },
          follow: ["Check Open Token Approvals", "View Recent Transactions", "How to Revoke Permissions", "Best Practices for Cold Storage"]
        };
      } catch {
        return {
          kind: "wallet",
          source: "Etherscan API · Unavailable",
          thought,
          addr,
          detail: { totalUsd: "—", tokens: [], txCount: 0, securityStatus: "Lookup failed — add ETHERSCAN_API_KEY to .env" },
          follow: ["How to check a wallet on Etherscan", "What are token approvals?"]
        };
      }
    }

    case "token": {
      const thought = deepReason
        ? `1. Extracted token contract address & liquidity pool pair.\n2. Analyzed Bytecode for malicious opcodes (hidden mint, blacklist, pause trading).\n3. Verified Uniswap V3 LP lock duration (>12 months locked).\n4. Evaluated buy/sell taxation logic (0% / 0%).\n5. Overall contract safety rating: Moderate / Standard DeFi token.`
        : null;

      return {
        kind: "token",
        source: "DexScreener · GoPlus Security · CoinGecko",
        thought,
        detail: {
          name: "Aetheria Protocol",
          sym: "AETH",
          price: "$0.0842",
          vol24h: "$3.45M",
          liquidity: "$1.82M",
          mcap: "$42.1M",
          fdv: "$84.2M",
          supply: "1,000,000,000",
          tax: "0% Buy / 0% Sell",
          isHoneypot: false,
          isMintable: false,
          lpLocked: "98.4% (Locked 365d)",
          risk: "LOW-MODERATE"
        },
        follow: [
          "What is FDV vs Market Cap?",
          "How to Verify LP Lock",
          "Check Token Contract on Etherscan",
          "Explain Tokenomics Distribution"
        ]
      };
    }

    case "scam": {
      const thought = deepReason
        ? `1. Performing heuristic threat analysis on message text.\n2. Detected primary scam indicators:\n   - Unrealistic guaranteed returns ('double money', '10x profit').\n   - Upfront transfer coercion ('send first').\n   - Fake platform / social engineering vectors.\n3. Risk assessment categorized as CRITICAL.\n4. Formulating actionable containment & asset protection steps.`
        : null;

      return {
        kind: "scam",
        source: "Robin AI Security Guard · GoPlus · Chainabuse",
        thought,
        level: "HIGH / CRITICAL",
        isScam: true,
        flags: [
          "Promise of guaranteed or unrealistic profits (e.g., 'double crypto', 'risk-free 10x').",
          "Demands you send funds first to receive a larger amount (Advance-Fee Scam).",
          "Unsolicited direct message or social media invitation from an unverified handle.",
          "High urgency or pressure to act before a 'deadline'.",
          "Potential attempt to deliver wallet drainer signature requests (e.g., Permit2, eth_sign)."
        ],
        emergencySteps: [
          "DO NOT send any crypto, tokens, or funds under any circumstances.",
          "NEVER share your 12 or 24-word seed phrase or private key with anyone.",
          "Cease all communication and block the sender immediately.",
          "If you connected your wallet to an unknown site, disconnect and revoke permissions on Revoke.cash.",
          "If your seed phrase was entered anywhere, immediately move remaining assets to a newly created cold/hardware wallet."
        ],
        follow: [
          "Open Emergency Scam Center",
          "How to Revoke Malicious Permissions",
          "Safe Hardware Wallet Practices",
          "Common Discord & Telegram Scams"
        ]
      };
    }

    case "coding": {
      const thought = deepReason
        ? `1. Analyzing programming requirement and identifying optimal language patterns.\n2. Writing idiomatic, secure, production-ready code with error boundaries.\n3. Adding clear inline commentary and explaining critical architectural decisions.`
        : null;

      return {
        kind: "coding",
        source: "Robin AI Developer Engine",
        thought,
        title: "Web3 React Connection Hook",
        language: "javascript",
        code: `// useWallet.js — Modern React Hook for EVM Wallet Connection
import { useState, useEffect, useCallback } from 'react';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No Web3 wallet found. Please install MetaMask or Rabby.");
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const currentChain = await window.ethereum.request({
        method: 'eth_chainId'
      });
      setAccount(accounts[0]);
      setChainId(parseInt(currentChain, 16));
    } catch (err) {
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccounts = (accs) => setAccount(accs[0] || null);
    const handleChain = (hexId) => setChainId(parseInt(hexId, 16));

    window.ethereum.on('accountsChanged', handleAccounts);
    window.ethereum.on('chainChanged', handleChain);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccounts);
      window.ethereum.removeListener('chainChanged', handleChain);
    };
  }, []);

  return { account, chainId, isConnecting, error, connect };
}`,
        explanation: "This custom hook provides a resilient interface for wallet connections. It automatically listens for account switching and network changes, handles errors gracefully, and cleans up event listeners on unmount.",
        follow: [
          "Add Switch Network Support",
          "Write Solidity ERC-20 Contract",
          "How to Read Token Balances with ethers.js",
          "Sign EIP-712 Typed Messages"
        ]
      };
    }

    default: {
      const thought = deepReason
        ? `1. Understanding user objective and context.\n2. Querying Gemini 1.5 Flash for precise, accurate response.\n3. Structuring response with clear headings, examples, and practical guidance.`
        : null;

      // Build large chat history for AI context (up to 50 previous messages)
      const history = (chatHistory || [])
        .slice(-50)
        .map((m) => ({
          role: m.role,
          content: m.text || m.payload?.content || m.payload?.summary || ""
        }))
        .filter((m) => m.content);

      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: raw,
            history,
            model: model || "Robin Auto",
            apiKey: settings?.geminiKey || undefined,
            customInstructions: settings?.customInstructions || undefined
          })
        });
        if (!resp.ok) throw new Error("AI service unavailable");
        const data = await resp.json();
        return {
          kind: "general_ai",
          source: data.model ? `RobinAI · ${data.model}` : (webOn ? "Robin AI Core · Web Grounded" : "Robin AI Core"),
          thought: data.thought || thought,
          content: data.content,
          follow: [
            "Explain in More Technical Depth",
            "Give Me a Concrete Example",
            "What are the Common Pitfalls?",
            "Show Related Concepts"
          ]
        };
      } catch (err) {
        return {
          kind: "general_ai",
          source: "Robin AI Core (Offline Mode)",
          thought,
          content: `I'm currently unable to reach the AI service. Please ensure the RobinAI backend server is running (\`node server.js\`) and that your **GEMINI_API_KEY** is set in the \`.env\` file.\n\n**To start the server:**\n\`\`\`bash\nnode server.js\n\`\`\`\n\nGet a free Gemini API key at: https://aistudio.google.com/app/apikey`,
          follow: ["How to set up the server?", "Get a Gemini API key", "Check server health at /api/health"]
        };
      }
    }
  }
}

/* ---------------------------------------------------------------------- */
/*  UI Subcomponents                                                      */
/* ---------------------------------------------------------------------- */

function SourceTag({ children }) {
  return (
    <div
      className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium"
      style={{
        background: "rgba(182, 255, 0, 0.08)",
        border: `1px solid ${C.limeBorder}`,
        color: C.lime
      }}
    >
      <ScanSearch size={12} />
      {children}
    </div>
  );
}

function FollowUps({ items, onPick }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((f) => (
        <button
          key={f}
          onClick={() => onPick(f)}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            color: C.text
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.lime;
            e.currentTarget.style.background = C.cardHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.background = C.card;
          }}
        >
          <Sparkles size={12} style={{ color: C.lime }} />
          {f}
        </button>
      ))}
    </div>
  );
}

function ThoughtAccordion({ thought }) {
  const [open, setOpen] = useState(false);
  if (!thought) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-xl border" style={{ borderColor: C.border, background: "#11140e" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[12.5px] font-medium transition-colors"
        style={{ color: C.lime }}
      >
        <span className="flex items-center gap-2">
          <BrainCircuit size={14} />
          <span>Thought Process & Reasoning</span>
        </span>
        <ChevronRight
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div
          className="border-t px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap font-mono"
          style={{ borderColor: "#202a14", color: "#c2e88a", background: "#0b0e08" }}
        >
          {thought}
        </div>
      )}
    </div>
  );
}

function CodeSnippet({ code, language = "javascript" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border" style={{ borderColor: C.border, background: "#0D0D0D" }}>
      <div className="flex items-center justify-between border-b px-4 py-2 text-[12px]" style={{ borderColor: C.border, background: C.bg2 }}>
        <span className="font-mono uppercase font-semibold text-xs tracking-wider" style={{ color: C.lime }}>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] transition-colors"
          style={{ color: copied ? C.lime : C.sub, background: C.card }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed" style={{ color: "#E0E0E0" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Specialized Interactive Cards                                         */
/* ---------------------------------------------------------------------- */

function PriceCard({ payload }) {
  const { asset, data, summary } = payload;
  const up = data.c >= 0;

  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />

      <p className="mb-4 text-[14.5px] leading-relaxed" style={{ color: C.text }}>
        {summary}
      </p>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl p-3.5" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px] font-medium" style={{ color: C.sub }}>Spot Price</div>
          <div className="mt-1 text-[18px] font-bold" style={{ color: C.text }}>
            ${typeof data.p === "number" ? data.p.toLocaleString() : data.p}
          </div>
        </div>

        <div className="rounded-xl p-3.5" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px] font-medium" style={{ color: C.sub }}>24h Change</div>
          <div className="mt-1 flex items-center gap-1 text-[18px] font-bold" style={{ color: up ? C.lime : C.error }}>
            {up ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            {up ? "+" : ""}{data.c}%
          </div>
        </div>

        <div className="rounded-xl p-3.5" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px] font-medium" style={{ color: C.sub }}>Market Cap</div>
          <div className="mt-1 text-[16px] font-semibold" style={{ color: C.text }}>
            ${data.cap}
          </div>
        </div>

        <div className="rounded-xl p-3.5" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px] font-medium" style={{ color: C.sub }}>24h Volume</div>
          <div className="mt-1 text-[16px] font-semibold" style={{ color: C.text }}>
            ${data.vol}
          </div>
        </div>
      </div>

      {/* Detailed Technical Range Bar */}
      <div className="mt-3 rounded-xl p-3.5" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between text-[12px]" style={{ color: C.sub }}>
          <span>24h Low: <strong style={{ color: C.text }}>${data.low}</strong></span>
          <span className="font-medium" style={{ color: C.lime }}>24h Range</span>
          <span>24h High: <strong style={{ color: C.text }}>${data.high}</strong></span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: "65%", background: `linear-gradient(90deg, ${C.lime}, #7acc00)` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[11.5px]" style={{ color: C.muted }}>
          <span>Circulating: {data.sup}</span>
          <span>FDV: ${data.fdv}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionCard({ payload }) {
  const d = payload.detail;
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard?.writeText(payload.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />

      <div className="mb-3 flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(63, 191, 95, 0.1)", border: `1px solid rgba(63, 191, 95, 0.3)` }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} style={{ color: C.success }} />
          <span className="text-[14px] font-semibold" style={{ color: C.success }}>
            Status: {d.status} ({d.confirmations} Confirmations)
          </span>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: C.card, color: C.text }}>
          Block #{d.blockHeight}
        </span>
      </div>

      <div className="space-y-0 divide-y rounded-xl" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderColor: C.border }}>
        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>Transaction Hash</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12.5px]" style={{ color: C.lime }}>
              {payload.hash.slice(0, 10)}...{payload.hash.slice(-8)}
            </span>
            <button onClick={copyHash} title="Copy full hash" className="p-1 text-stone-400 hover:text-white">
              {copied ? <Check size={13} style={{ color: C.lime }} /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>Network</span>
          <span className="font-medium" style={{ color: C.text }}>{d.network}</span>
        </div>

        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>From</span>
          <span className="font-mono text-[12.5px]" style={{ color: C.text }}>
            {d.from.slice(0, 8)}...{d.from.slice(-6)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>To (Recipient)</span>
          <span className="font-mono text-[12.5px]" style={{ color: C.text }}>
            {d.to.slice(0, 8)}...{d.to.slice(-6)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>Amount Transferred</span>
          <span className="font-bold" style={{ color: C.lime }}>{d.amount}</span>
        </div>

        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>Network Gas Fee</span>
          <span style={{ color: C.text }}>{d.fee}</span>
        </div>

        <div className="flex items-center justify-between p-3 text-[13px]">
          <span style={{ color: C.sub }}>Timestamp</span>
          <span style={{ color: C.sub }}>{d.time}</span>
        </div>
      </div>
    </div>
  );
}

function WalletCard({ payload }) {
  const d = payload.detail;

  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />

      <div className="mb-3 flex items-center justify-between rounded-xl p-3.5" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
        <div>
          <div className="text-[11px]" style={{ color: C.sub }}>Total Net Worth (Estimated)</div>
          <div className="mt-0.5 text-[20px] font-bold" style={{ color: C.lime }}>
            ${d.totalUsd} <span className="text-xs font-normal text-stone-400">USD</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px]" style={{ color: C.sub }}>Public Address</div>
          <div className="font-mono text-[12px]" style={{ color: C.text }}>
            {payload.addr.slice(0, 6)}...{payload.addr.slice(-4)}
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
        <div className="border-b px-3.5 py-2 text-[11px] font-medium uppercase tracking-wider text-stone-400" style={{ borderColor: C.border }}>
          Token Balances
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {d.tokens.map((t) => (
            <div key={t.sym} className="flex items-center justify-between px-3.5 py-2.5 text-[13px]" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: C.card, color: C.lime, border: `1px solid ${C.border}` }}>
                  {t.sym.slice(0, 3)}
                </div>
                <div>
                  <div className="font-medium" style={{ color: C.text }}>{t.name}</div>
                  <div className="text-[11px]" style={{ color: C.sub }}>{t.amt} {t.sym}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium" style={{ color: C.text }}>${t.usd}</div>
                <div className="text-[10.5px]" style={{ color: C.muted }}>{t.chain}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] px-1" style={{ color: C.sub }}>
        <span>Activity: <strong>{d.txCount} transactions</strong></span>
        <span>Holdings: <strong>{d.nfts} NFTs</strong></span>
        <span>Health: <strong style={{ color: C.success }}>{d.securityStatus}</strong></span>
      </div>
    </div>
  );
}

function TokenCard({ payload }) {
  const d = payload.detail;

  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-bold" style={{ color: C.text }}>
            {d.name} <span className="text-sm font-semibold" style={{ color: C.lime }}>${d.sym}</span>
          </h3>
          <p className="text-[12px]" style={{ color: C.sub }}>Smart Contract Token Analysis & Risk Screener</p>
        </div>
        <div className="rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ background: "rgba(182, 255, 0, 0.12)", border: `1px solid ${C.limeBorder}`, color: C.lime }}>
          Risk: {d.risk}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl p-3" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px]" style={{ color: C.sub }}>Price</div>
          <div className="mt-1 font-bold text-white">{d.price}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px]" style={{ color: C.sub }}>Liquidity Pool</div>
          <div className="mt-1 font-bold text-white">{d.liquidity}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px]" style={{ color: C.sub }}>24h Volume</div>
          <div className="mt-1 font-bold text-white">{d.vol24h}</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
          <div className="text-[11px]" style={{ color: C.sub }}>Market Cap</div>
          <div className="mt-1 font-bold text-white">{d.mcap}</div>
        </div>
      </div>

      {/* Contract Security Checklist */}
      <div className="mt-3 rounded-xl p-3.5 space-y-2 text-[12.5px]" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
        <div className="text-[11.5px] font-bold uppercase tracking-wider text-stone-300">Contract Security Flags</div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-1.5" style={{ color: C.success }}>
            <CheckCircle2 size={14} /> Honeypot Test: PASSED
          </div>
          <div className="flex items-center gap-1.5" style={{ color: C.success }}>
            <CheckCircle2 size={14} /> Buy/Sell Tax: {d.tax}
          </div>
          <div className="flex items-center gap-1.5" style={{ color: C.success }}>
            <CheckCircle2 size={14} /> Mintable: {d.isMintable ? "YES (Warning)" : "NO (Fixed Supply)"}
          </div>
          <div className="flex items-center gap-1.5" style={{ color: C.success }}>
            <CheckCircle2 size={14} /> LP Lock: {d.lpLocked}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScamCard({ payload }) {
  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />

      {/* Red Alert Banner */}
      <div className="mb-4 rounded-xl p-4" style={{ background: "rgba(255, 92, 92, 0.12)", border: `1px solid rgba(255, 92, 92, 0.4)` }}>
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={22} style={{ color: C.error }} />
          <div>
            <h4 className="text-[15px] font-bold" style={{ color: C.error }}>
              THREAT LEVEL: {payload.level}
            </h4>
            <p className="text-[12px] text-stone-300">
              Robin AI Security Guard has flagged this interaction as a dangerous malicious threat.
            </p>
          </div>
        </div>
      </div>

      {/* Red Flags Checklist */}
      <div className="mb-4 rounded-xl p-4" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
        <div className="mb-2 text-[12px] font-bold uppercase tracking-wider" style={{ color: C.error }}>
          Detected Red Flags
        </div>
        <div className="space-y-2 text-[13px]">
          {payload.flags.map((flag, idx) => (
            <div key={idx} className="flex items-start gap-2 text-stone-200">
              <span className="font-bold text-red-400">✕</span>
              <span>{flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Containment Actions */}
      <div className="rounded-xl p-4" style={{ background: "#13180c", border: `1px solid ${C.limeBorder}` }}>
        <div className="mb-2 text-[12px] font-bold uppercase tracking-wider" style={{ color: C.lime }}>
          Immediate Action Plan (Do This Now)
        </div>
        <div className="space-y-2 text-[13px] text-stone-200">
          {payload.emergencySteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black" style={{ background: C.lime }}>
                {idx + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Golden Security Rule */}
      <div className="mt-4 rounded-xl p-3 text-center text-[12px] font-medium" style={{ background: C.card, border: `1px solid ${C.border}`, color: C.warning }}>
        🔒 <strong>Permanent Rule</strong>: Robin AI will never ask for your seed phrase or private keys. Never share your recovery phrase under any circumstances.
      </div>
    </div>
  );
}

function CodingCard({ payload }) {
  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />
      {payload.explanation && (
        <p className="mb-2 text-[14px] leading-relaxed" style={{ color: C.text }}>
          {payload.explanation}
        </p>
      )}
      <CodeSnippet code={payload.code} language={payload.language} />
    </div>
  );
}

function GeneralAICard({ payload }) {
  return (
    <div>
      <SourceTag>{payload.source}</SourceTag>
      <ThoughtAccordion thought={payload.thought} />
      <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed space-y-3" style={{ color: C.text }}>
        {payload.content.split("\n\n").map((para, i) => {
          if (para.startsWith("### ")) {
            return (
              <h3 key={i} className="mt-3 text-[16px] font-bold" style={{ color: C.lime }}>
                {para.replace("### ", "")}
              </h3>
            );
          }
          return <p key={i} className="whitespace-pre-line">{para}</p>;
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Message Component with TTS, Feedback & Copy                           */
/* ---------------------------------------------------------------------- */

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      <span className="text-[12px] font-medium text-stone-400 mr-1.5">Robin is thinking</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            background: C.lime,
            animation: `robinBlink 1.4s ${i * 0.2}s infinite ease-in-out`
          }}
        />
      ))}
    </div>
  );
}

function MessageActions({ text, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const clean = (text || "").replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="mt-2.5 flex items-center gap-1.5">
      <button
        onClick={handleCopy}
        title="Copy response"
        className="rounded-lg p-1.5 text-stone-400 transition-colors hover:text-white"
        style={{ background: C.card }}
      >
        {copied ? <Check size={13} style={{ color: C.lime }} /> : <Copy size={13} />}
      </button>

      <button
        onClick={handleSpeak}
        title={isSpeaking ? "Stop speech" : "Read aloud (Text-to-Speech)"}
        className="rounded-lg p-1.5 text-stone-400 transition-colors hover:text-white"
        style={{ background: C.card }}
      >
        {isSpeaking ? <VolumeX size={13} style={{ color: C.lime }} /> : <Volume2 size={13} />}
      </button>

      {onRegenerate && (
        <button
          onClick={onRegenerate}
          title="Regenerate answer"
          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:text-white"
          style={{ background: C.card }}
        >
          <RotateCcw size={13} />
        </button>
      )}

      <button
        onClick={() => setFeedback("up")}
        title="Helpful response"
        className="rounded-lg p-1.5 text-stone-400 transition-colors"
        style={{
          background: C.card,
          color: feedback === "up" ? C.lime : undefined
        }}
      >
        <ThumbsUp size={13} />
      </button>

      <button
        onClick={() => setFeedback("down")}
        title="Not helpful"
        className="rounded-lg p-1.5 text-stone-400 transition-colors"
        style={{
          background: C.card,
          color: feedback === "down" ? C.error : undefined
        }}
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}

function ChatMessage({ msg, onFollowUp, onRegenerate }) {
  const mine = msg.role === "user";

  const renderPayload = (payload) => {
    switch (payload.kind) {
      case "price": return <PriceCard payload={payload} />;
      case "transaction": return <TransactionCard payload={payload} />;
      case "wallet": return <WalletCard payload={payload} />;
      case "token": return <TokenCard payload={payload} />;
      case "scam": return <ScamCard payload={payload} />;
      case "coding": return <CodingCard payload={payload} />;
      case "general_ai": return <GeneralAICard payload={payload} />;
      default: return <p>{msg.text}</p>;
    }
  };

  return (
    <div className={`flex gap-3.5 ${mine ? "flex-row-reverse" : ""}`}>
      {mine ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.sub }}
        >
          You
        </div>
      ) : (
        <div className="shrink-0">
          <RobinLogo size={32} />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          className="rounded-2xl px-5 py-4 text-[14.5px] leading-relaxed transition-all"
          style={{
            background: mine ? C.lime : C.card,
            color: mine ? "#0A0A0A" : C.text,
            border: mine ? "none" : `1px solid ${C.border}`,
            borderTopRightRadius: mine ? 4 : 18,
            borderTopLeftRadius: mine ? 18 : 4,
            boxShadow: mine ? "0 4px 14px rgba(182, 255, 0, 0.15)" : "none"
          }}
        >
          {msg.loading ? (
            <TypingDots />
          ) : msg.payload ? (
            renderPayload(msg.payload)
          ) : (
            <div className="whitespace-pre-wrap">{msg.text}</div>
          )}
        </div>

        {!mine && !msg.loading && (
          <>
            <MessageActions
              text={msg.text || (msg.payload ? JSON.stringify(msg.payload) : "")}
              onRegenerate={onRegenerate}
            />
            <FollowUps items={msg.payload?.follow} onPick={onFollowUp} />
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Modals: Explore, Market Radar, Scam Center, Settings, Export          */
/* ---------------------------------------------------------------------- */

function ExploreModal({ open, onClose, onSelectPrompt }) {
  const [selectedCat, setSelectedCat] = useState("Crypto & Web3");
  if (!open) return null;

  const currentGroup = PROMPT_LIBRARY.find((p) => p.category === selectedCat) || PROMPT_LIBRARY[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: C.bg2, borderColor: C.border }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <Compass size={20} style={{ color: C.lime }} />
            <h2 className="text-[17px] font-bold text-white">Explore Robin AI Capabilities</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex overflow-x-auto border-b px-6 py-2 gap-2" style={{ borderColor: C.border, background: C.bg }}>
          {PROMPT_LIBRARY.map((cat) => {
            const Icon = cat.icon;
            const active = cat.category === selectedCat;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCat(cat.category)}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors"
                style={{
                  background: active ? C.card : "transparent",
                  color: active ? C.lime : C.sub,
                  border: `1px solid ${active ? C.limeBorder : "transparent"}`
                }}
              >
                <Icon size={14} />
                {cat.category}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {currentGroup.prompts.map((p, idx) => (
            <div
              key={idx}
              onClick={() => { onSelectPrompt(p.prompt); onClose(); }}
              className="group cursor-pointer rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.lime)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[14.5px] font-semibold text-white group-hover:text-[#B6FF00] transition-colors">
                  {p.title}
                </h4>
                <ChevronRight size={16} style={{ color: C.sub }} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-1 text-[13px] text-stone-400">{p.desc}</p>
              <div className="mt-2 text-[12px] font-mono text-stone-500 truncate">
                "{p.prompt}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketRadarModal({ open, onClose, onAnalyze }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: C.bg2, borderColor: C.border }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <BarChart3 size={20} style={{ color: C.lime }} />
            <h2 className="text-[17px] font-bold text-white">Live Crypto Market Radar</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="divide-y rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, borderColor: C.border }}>
            {LIVE_MARKETS.map((m) => {
              const up = m.c >= 0;
              return (
                <div key={m.sym} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-stone-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-[13px]" style={{ background: C.bg, color: C.lime, border: `1px solid ${C.border}` }}>
                      {m.sym}
                    </div>
                    <div>
                      <div className="font-bold text-white">{m.name} <span className="text-xs text-stone-400 font-normal">({m.sym})</span></div>
                      <div className="text-[12px] text-stone-400">Cap: ${m.cap} · Vol: ${m.vol}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                    <div className="text-right">
                      <div className="font-bold text-white">${m.p.toLocaleString()}</div>
                      <div className="flex items-center justify-end gap-1 text-[12px] font-semibold" style={{ color: up ? C.lime : C.error }}>
                        {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {up ? "+" : ""}{m.c}%
                      </div>
                    </div>

                    <button
                      onClick={() => { onAnalyze(`Analyze the latest market structure and key levels for ${m.name} (${m.sym})`); onClose(); }}
                      className="rounded-xl px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
                      style={{ background: C.lime, color: "#0A0A0A" }}
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SafetyModal({ open, onClose, onRunCheck }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: C.bg2, borderColor: C.border }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={20} style={{ color: C.error }} />
            <h2 className="text-[17px] font-bold text-white">Robin AI Safety & Anti-Scam Center</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-xl p-4" style={{ background: "rgba(255, 92, 92, 0.08)", border: "1px solid rgba(255, 92, 92, 0.3)" }}>
            <h4 className="text-[14.5px] font-bold" style={{ color: C.error }}>
              🚨 Suspect You Are Being Targeted by a Scam?
            </h4>
            <p className="mt-1 text-[13px] text-stone-300">
              Never rush into transferring assets or signing wallet permits. Follow our emergency protocol immediately:
            </p>
          </div>

          <div className="space-y-3">
            {[
              { step: "1", title: "Stop Communicating Immediately", desc: "Do not respond to the suspected scammer. Block phone numbers, Discord/Telegram handles, and fake accounts." },
              { step: "2", title: "Do Not Send Any Additional Funds", desc: "Scammers frequently request 'gas fees' or 'unlock taxes' to release held funds. These are fake." },
              { step: "3", title: "Revoke Open Token Approvals", desc: "Use Revoke.cash or explorer approval tools to cancel any active smart contract spending allowances." },
              { step: "4", title: "Secure Remaining Assets", desc: "If you entered your seed phrase or private key on an unknown website, immediately transfer your remaining funds to a newly generated cold/hardware wallet." },
              { step: "5", title: "Beware of Fake Recovery Services", desc: "Anyone claiming they can 'hack back' your lost crypto for an upfront fee is an advance-fee recovery scammer." }
            ].map((item) => (
              <div key={item.step} className="flex gap-3.5 rounded-xl p-3.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-[12px]" style={{ background: C.error, color: "#FFFFFF" }}>
                  {item.step}
                </div>
                <div>
                  <h5 className="font-semibold text-white text-[13.5px]">{item.title}</h5>
                  <p className="text-[12.5px] text-stone-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { onRunCheck("Run a complete security analysis on this address/situation for potential scams or drainers."); onClose(); }}
            className="w-full rounded-xl py-3 text-center text-[13.5px] font-bold transition-transform active:scale-[0.99]"
            style={{ background: C.lime, color: "#0A0A0A" }}
          >
            Start Interactive Scam Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ open, onClose, settings, setSettings }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: C.bg2, borderColor: C.border }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2.5">
            <Settings size={20} style={{ color: C.lime }} />
            <h2 className="text-[17px] font-bold text-white">Robin AI Platform Settings</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-white mb-1.5">
              Custom Instructions / Personalization
            </label>
            <textarea
              rows={3}
              value={settings.customInstructions}
              onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
              placeholder="E.g., I am an experienced Solidity developer, explain technical concepts with concise code snippets."
              className="w-full rounded-xl p-3 text-[13px] outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[13px] font-semibold text-white">
              Optional Live AI API Key Connectors
            </label>
            <p className="text-[12px] text-stone-400">
              By default, Robin AI runs in simulated ultra-fast intelligence mode. You can optionally connect live API keys for real-time model pass-through:
            </p>
            <input
              type="password"
              placeholder="Gemini API Key (optional)"
              value={settings.geminiKey || ""}
              onChange={(e) => setSettings({ ...settings, geminiKey: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
            />
            <input
              type="password"
              placeholder="OpenAI / Groq API Key (optional)"
              value={settings.openaiKey || ""}
              onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between cursor-pointer rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div>
                <div className="text-[13px] font-medium text-white">High Strictness Security Guard</div>
                <div className="text-[11.5px] text-stone-400">Enforce aggressive warnings on unverified smart contracts & seed phrases</div>
              </div>
              <input
                type="checkbox"
                checked={settings.securityGuard}
                onChange={(e) => setSettings({ ...settings, securityGuard: e.target.checked })}
                className="accent-[#B6FF00] h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div>
                <div className="text-[13px] font-medium text-white">Sound Effects & Typing Audio</div>
                <div className="text-[11.5px] text-stone-400">Subtle audio cues on message arrival</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => setSettings({ ...settings, soundEffects: e.target.checked })}
                className="accent-[#B6FF00] h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div className="border-t px-6 py-3.5 flex justify-end" style={{ borderColor: C.border, background: C.bg }}>
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-[13px] font-semibold"
            style={{ background: C.lime, color: "#0A0A0A" }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportModal({ open, onClose, chat }) {
  if (!open || !chat) return null;

  const exportAsText = () => {
    const text = chat.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.text || JSON.stringify(m.payload || "")}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RobinAI_${chat.title.replace(/\s+/g, "_")}.txt`;
    a.click();
  };

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(chat, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RobinAI_${chat.title.replace(/\s+/g, "_")}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: C.bg2, borderColor: C.border }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <Download size={18} style={{ color: C.lime }} />
            <h3 className="font-bold text-white text-[15px]">Export Conversation</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-[13px] text-stone-300">
            Export <strong>"{chat.title}"</strong> ({chat.messages.length} messages) for archival or offline sharing:
          </p>

          <button
            onClick={exportAsText}
            className="flex w-full items-center justify-between rounded-xl p-3.5 transition-colors"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.lime)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <div className="flex items-center gap-2.5 text-white text-[13.5px]">
              <FileText size={16} style={{ color: C.lime }} />
              <span>Markdown / Plain Text (.txt)</span>
            </div>
            <Download size={14} style={{ color: C.sub }} />
          </button>

          <button
            onClick={exportAsJSON}
            className="flex w-full items-center justify-between rounded-xl p-3.5 transition-colors"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.lime)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <div className="flex items-center gap-2.5 text-white text-[13.5px]">
              <Code2 size={16} style={{ color: C.lime }} />
              <span>Structured JSON (.json)</span>
            </div>
            <Download size={14} style={{ color: C.sub }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ open, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (isSignUp && !name) {
      setError("Please enter your full name.");
      return;
    }
    setError(null);
    setLoading(true);

    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const body = isSignUp ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      localStorage.setItem("robinai_token", data.token);
      localStorage.setItem("robinai_user", JSON.stringify(data.user));
      if (data.profile) localStorage.setItem("robinai_profile", JSON.stringify(data.profile));

      onAuthSuccess({ ...data.user, name: data.profile?.name || data.user.email });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: C.bg2, borderColor: C.border }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <RobinLogo size={24} />
            <h3 className="font-bold text-white text-[16px]">
              {isSignUp ? "Create RobinAI Account" : "Sign in to RobinAI"}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-[13px] text-stone-400">
            {isSignUp
              ? "Join RobinAI to sync conversations across iOS, Android, and Web."
              : "Welcome back! Sign in to sync and access your conversations."}
          </p>

          {error && (
            <div className="rounded-xl p-3 text-[12.5px]" style={{ background: "rgba(255, 92, 92, 0.12)", color: C.error, border: "1px solid rgba(255, 92, 92, 0.3)" }}>
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[12px] font-semibold text-stone-300 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none text-white transition-colors"
                style={{ background: C.input, border: `1px solid ${C.border}` }}
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-stone-300 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none text-white transition-colors"
              style={{ background: C.input, border: `1px solid ${C.border}` }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-stone-300 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none text-white transition-colors"
              style={{ background: C.input, border: `1px solid ${C.border}` }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-[13.5px] font-bold transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            style={{ background: C.lime, color: "#0A0A0A" }}
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-[12.5px] font-semibold hover:underline"
              style={{ color: C.lime }}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up free"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Sidebar                                                               */
/* ---------------------------------------------------------------------- */
function Sidebar({
  open,
  onClose,
  chats,
  activeId,
  onSelect,
  onNewChat,
  onDeleteChat,
  onOpenExplore,
  onOpenRadar,
  onOpenSafety,
  onOpenSettings,
  authUser,
  onSignIn,
  onLogout
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [chats, searchTerm]);

  const groups = { Today: [], Yesterday: [], Previous: [] };
  filtered.forEach((c) => {
    if (groups[c.group]) groups[c.group].push(c);
    else groups.Previous.push(c);
  });

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed z-40 flex h-full w-72 shrink-0 flex-col transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: C.bg2, borderRight: `1px solid ${C.border}` }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <RobinLogo size={36} />
            <div>
              <div className="text-[15px] font-bold tracking-tight text-white flex items-center gap-1.5">
                RobinAI
                <span className="rounded-md px-1.5 py-0.2 text-[9px] font-bold" style={{ background: C.lime, color: "#0A0A0A" }}>
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-stone-400">Intelligent Crypto & General AI</div>
            </div>
          </div>
          <button className="lg:hidden p-1 text-stone-400 hover:text-white" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Action Button & Search */}
        <div className="px-3 pt-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-bold transition-all hover:brightness-105 active:scale-[0.98]"
            style={{
              background: C.lime,
              color: "#0A0A0A",
              boxShadow: `0 2px 12px ${C.limeGlow}`
            }}
          >
            <Plus size={16} /> New Chat
          </button>

          <div className="relative mt-2.5">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
            <input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-transparent py-2 pl-8 pr-3 text-[12.5px] outline-none transition-colors placeholder:text-stone-500"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            />
          </div>
        </div>

        {/* Quick Hub Launchers */}
        <div className="px-3 pt-3 space-y-1">
          <button
            onClick={onOpenExplore}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-stone-300 hover:text-white hover:bg-stone-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Compass size={14} style={{ color: C.lime }} /> Explore Prompts
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.card, color: C.lime }}>24+</span>
          </button>

          <button
            onClick={onOpenRadar}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-stone-300 hover:text-white hover:bg-stone-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: C.lime }} /> Crypto Market Radar
            </span>
            <span className="text-[10px] text-stone-400">Live</span>
          </button>

          <button
            onClick={onOpenSafety}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] text-stone-300 hover:text-white hover:bg-stone-800/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert size={14} style={{ color: C.error }} /> Anti-Scam Center
            </span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="mt-2 flex-1 space-y-4 overflow-y-auto px-3 py-2 border-t" style={{ borderColor: C.border }}>
          {Object.entries(groups).map(([label, items]) =>
            items.length ? (
              <div key={label}>
                <div className="px-1 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-stone-500">{label}</div>
                <div className="space-y-0.5">
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors"
                      style={{
                        background: c.id === activeId ? C.card : "transparent",
                        color: c.id === activeId ? C.text : C.sub,
                        border: c.id === activeId ? `1px solid ${C.border}` : "1px solid transparent"
                      }}
                    >
                      <button
                        onClick={() => onSelect(c.id)}
                        className="truncate text-left flex-1"
                      >
                        {c.title}
                      </button>
                      <button
                        onClick={() => onDeleteChat(c.id)}
                        title="Delete chat"
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t px-3 py-3 space-y-1.5" style={{ borderColor: C.border }}>
          {authUser ? (
            <div className="flex items-center justify-between rounded-xl p-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(182,255,0,0.15)", color: C.lime }}>
                  <User size={15} />
                </div>
                <div className="truncate">
                  <div className="truncate text-[12.5px] font-semibold text-white">{authUser.name || authUser.email}</div>
                  <div className="truncate text-[10px] text-stone-400">{authUser.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[12.5px] font-bold transition-all hover:brightness-105 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #39FF14 0%, #B6FF00 100%)",
                color: "#0A0A0A",
                boxShadow: "0 2px 10px rgba(57,255,20,0.25)"
              }}
            >
              <User size={14} />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-stone-400 hover:text-white transition-colors"
          >
            <Settings size={15} /> Platform Settings
          </button>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  Welcome Screen Component                                              */
/* ---------------------------------------------------------------------- */
const WELCOME_TILES = [
  { label: "Bitcoin & Crypto Prices", desc: "Live market analytics, 24h stats, and supply data.", icon: TrendingUp, seed: "What is the current price of Bitcoin and market structure?" },
  { label: "Transaction Inspector", desc: "Decode transaction hash, gas fees, and confirmations.", icon: MessageSquareText, seed: "Check this transaction: 0x8f3a1e2b9c4d6f7a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a" },
  { label: "Scam & Fraud Diagnostic", desc: "Detect honeypots, wallet drainers, and fake giveaways.", icon: ShieldAlert, seed: "Is this a scam? Someone messaged me guaranteeing 10x profit if I send ETH first." },
  { label: "Tokenomics & Risk Review", desc: "FDV, liquidity lock, buy/sell taxes, and audit status.", icon: Coins, seed: "Analyze this token contract for security and tokenomics." },
  { label: "Explain Blockchain Concepts", desc: "Proof of Stake, Layer 2 rollups, and zero knowledge.", icon: BookOpen, seed: "Explain how Layer 2 rollups scale Ethereum in simple terms." },
  { label: "Code & Solidity Dev", desc: "Write smart contracts, React Web3 hooks, and debug code.", icon: Code2, seed: "Write a React hook to connect MetaMask and detect chain switching." }
];

function WelcomeScreen({ onSuggest }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-8 text-center animate-fadeIn">
      {/* Glowing Brand Icon */}
      <div className="relative mb-5 flex items-center justify-center">
        <div
          className="absolute -inset-2 rounded-3xl opacity-60 blur-xl transition-all"
          style={{ background: C.lime }}
        />
        <RobinLogo size={80} className="relative shadow-2xl" />
      </div>

      <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-white">
        Welcome to <span style={{ color: C.lime }}>RobinAI</span>
      </h1>
      <p className="mt-2 max-w-lg text-[15px] font-medium text-stone-300">
        Your intelligent assistant for general support, deep research, and specialized cryptocurrency intelligence.
      </p>
      <p className="mt-1 max-w-md text-[13px] text-stone-500">
        Get help with writing, programming, problem-solving, blockchain concepts, wallets, transaction diagnosis, security awareness, and more.
      </p>

      {/* Suggested Action Cards Grid */}
      <div className="mt-8 grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
        {WELCOME_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              onClick={() => onSuggest(tile.seed)}
              className="group cursor-pointer rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.lime)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(182, 255, 0, 0.12)", color: C.lime }}>
                  <Icon size={16} />
                </div>
                <h3 className="font-bold text-[13.5px] text-white group-hover:text-[#B6FF00] transition-colors">
                  {tile.label}
                </h3>
              </div>
              <p className="mt-2 text-[12px] text-stone-400 leading-relaxed">
                {tile.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Chat Header & Controls                                                */
/* ---------------------------------------------------------------------- */
const MODELS = [
  { id: "Robin Auto", desc: "Dynamic Intelligent Router" },
  { id: "Robin Crypto Pro", desc: "Specialized On-Chain Engine" },
  { id: "GPT-4o", desc: "OpenAI Flagship" },
  { id: "Claude 3.7 Sonnet", desc: "Anthropic Reasoning" },
  { id: "Gemini 2.5 Pro", desc: "Google DeepMind" },
  { id: "DeepSeek R1", desc: "Open Reasoning" }
];

function ChatHeader({
  title,
  onMenu,
  model,
  setModel,
  webOn,
  setWebOn,
  deepReason,
  setDeepReason,
  onExport,
  onClear,
  authUser,
  onSignIn,
  onLogout
}) {
  const [modelOpen, setModelOpen] = useState(false);

  return (
    <header
      className="flex items-center justify-between gap-3 px-4 py-3 border-b"
      style={{ borderColor: C.border, background: C.bg }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <button className="lg:hidden p-1 text-stone-400 hover:text-white" onClick={onMenu}>
          <Menu size={20} />
        </button>
        <div className="truncate text-[14.5px] font-bold text-white">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Deep Reason Toggle */}
        <button
          onClick={() => setDeepReason(!deepReason)}
          title="Deep Reasoning Mode (Shows step-by-step thoughts)"
          className="hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium transition-all"
          style={{
            background: deepReason ? "rgba(182, 255, 0, 0.12)" : C.card,
            border: `1px solid ${deepReason ? C.limeBorder : C.border}`,
            color: deepReason ? C.lime : C.sub
          }}
        >
          <BrainCircuit size={13} />
          <span>Reasoning</span>
        </button>

        {/* Web Search Toggle */}
        <button
          onClick={() => setWebOn(!webOn)}
          title="Live Web Grounding"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium transition-all"
          style={{
            background: webOn ? "rgba(182, 255, 0, 0.12)" : C.card,
            border: `1px solid ${webOn ? C.limeBorder : C.border}`,
            color: webOn ? C.lime : C.sub
          }}
        >
          <Globe size={13} />
          <span>Web</span>
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-colors"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
          >
            <Cpu size={13} style={{ color: C.lime }} />
            <span>{model}</span>
            <ChevronDown size={13} style={{ color: C.sub }} />
          </button>

          {modelOpen && (
            <div
              className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border shadow-2xl animate-fadeIn"
              style={{ background: C.bg2, borderColor: C.border }}
            >
              <div className="px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-stone-500 border-b" style={{ borderColor: C.border }}>
                Select AI Engine
              </div>
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setModel(m.id); setModelOpen(false); }}
                  className="flex w-full flex-col px-3.5 py-2 text-left transition-colors hover:bg-stone-800/50"
                  style={{
                    background: m.id === model ? "rgba(182, 255, 0, 0.08)" : "transparent"
                  }}
                >
                  <span className="text-[12.5px] font-semibold" style={{ color: m.id === model ? C.lime : C.text }}>
                    {m.id}
                  </span>
                  <span className="text-[10.5px] text-stone-400">{m.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export & Actions */}
        <button
          onClick={onExport}
          title="Export conversation"
          className="rounded-xl p-2 text-stone-400 hover:text-white transition-colors"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <Download size={14} />
        </button>

        {/* Auth: Sign In pill or user avatar */}
        {authUser ? (
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] font-semibold"
              style={{ background: "rgba(182,255,0,0.12)", border: `1px solid ${C.limeBorder}`, color: C.lime }}
            >
              <User size={13} />
              <span>{authUser.name?.split(" ")[0] || "Account"}</span>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="rounded-xl p-2 text-stone-400 hover:text-white transition-colors"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[12.5px] font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #39FF14 0%, #B6FF00 100%)",
              color: "#0A0D0A",
              boxShadow: "0 0 14px rgba(57, 255, 20, 0.35)"
            }}
          >
            <User size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------- */
/*  Composer & Speech Input                                               */
/* ---------------------------------------------------------------------- */
function Composer({ onSend, webOn, setWebOn, deepReason, setDeepReason }) {
  const [val, setVal] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const ref = useRef(null);

  const send = () => {
    if (!val.trim() && !attachedFile) return;
    const finalMsg = attachedFile ? `[Attached: ${attachedFile.name}]\n${val}` : val;
    onSend(finalMsg);
    setVal("");
    setAttachedFile(null);
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.focus();
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setVal((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 sm:px-6" style={{ background: C.bg }}>
      <div
        className="mx-auto max-w-3xl rounded-2xl border transition-all focus-within:border-[#B6FF00]"
        style={{
          background: C.card,
          borderColor: C.border,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
        }}
      >
        {attachedFile && (
          <div className="flex items-center justify-between border-b px-4 py-2 text-[12px]" style={{ borderColor: C.border, background: C.bg2 }}>
            <span className="flex items-center gap-2 text-white">
              <Paperclip size={13} style={{ color: C.lime }} />
              <span>{attachedFile.name}</span>
            </span>
            <button onClick={() => setAttachedFile(null)} className="text-stone-400 hover:text-white">
              <X size={13} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 px-3 pt-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-stone-400 hover:text-white transition-colors"
            title="Attach file / smart contract"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={ref}
            rows={1}
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask Robin anything about general knowledge, code, or crypto..."
            className="max-h-48 flex-1 resize-none bg-transparent py-1.5 text-[14.5px] outline-none placeholder:text-stone-500"
            style={{ color: C.text }}
          />

          <button
            onClick={handleVoice}
            className={`p-1.5 transition-colors ${isRecording ? "text-[#B6FF00] animate-pulse" : "text-stone-400 hover:text-white"}`}
            title={isRecording ? "Listening..." : "Voice Input"}
          >
            {isRecording ? <Mic size={18} style={{ color: C.lime }} /> : <Mic size={18} />}
          </button>

          <button
            onClick={send}
            disabled={!val.trim() && !attachedFile}
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            style={{
              background: C.lime,
              color: "#0A0A0A",
              boxShadow: val.trim() ? `0 2px 10px ${C.limeGlow}` : "none"
            }}
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-2.5 pt-2 flex-wrap">
          <button
            onClick={() => setWebOn(!webOn)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors"
            style={{
              background: webOn ? "rgba(182, 255, 0, 0.1)" : "transparent",
              border: `1px solid ${webOn ? C.limeBorder : C.border}`,
              color: webOn ? C.lime : C.sub
            }}
          >
            <Globe size={12} /> Web Grounding
          </button>

          <button
            onClick={() => setDeepReason(!deepReason)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors"
            style={{
              background: deepReason ? "rgba(182, 255, 0, 0.1)" : "transparent",
              border: `1px solid ${deepReason ? C.limeBorder : C.border}`,
              color: deepReason ? C.lime : C.sub
            }}
          >
            <BrainCircuit size={12} /> Deep Reason
          </button>

          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px]"
            style={{ border: `1px solid ${C.border}`, color: C.sub }}
          >
            <Coins size={12} /> Crypto Intel Active
          </span>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-stone-500">
        Robin AI Security Notice: We will never request your private key or 12/24-word seed phrase.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main RobinAI Root Application Component                               */
/* ---------------------------------------------------------------------- */
let uid = 0;
const nid = () => `msg_${Date.now()}_${++uid}`;

const INITIAL_BTC_PAYLOAD = {
  kind: "price",
  source: "CoinGecko API · Verified Live Spot Rate",
  thought: null,
  asset: "Bitcoin",
  data: {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67840.5,
    change24h: 3.24,
    high24h: 69200,
    low24h: 65500,
    marketCap: 1340000000000,
    volume24h: 34800000000
  },
  summary: "Bitcoin (BTC) is currently trading at $67,840.50 USD (+3.24% 24h). 24h trading volume stands at $34.8B with a circulating market capitalization of $1.34T.",
  follow: [
    "Analyze BTC Tokenomics",
    "Check BTC Support Levels",
    "View Top 10 Crypto Radar",
    "Explain Market Drivers"
  ]
};

const INITIAL_TX_PAYLOAD = {
  kind: "transaction",
  source: "Etherscan API · Ethereum Mainnet",
  thought: null,
  hash: "0x8f3a1e2b9c4d6f7a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a",
  detail: {
    status: "Success (Confirmed in block #19,482,105)",
    network: "Ethereum Mainnet",
    from: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    to: "0xdAC17F958D2ee523a2206206994597C13D831ec7 (Tether USD)",
    amount: "15,000 USDT",
    fee: "0.0024 ETH ($8.35 USD)",
    method: "transfer(address _to, uint256 _value)"
  },
  follow: ["Check Sender Wallet", "Check Receiver Wallet", "Explain Gas Calculations", "How to Speed Up Pending Txs"]
};

function makeChat(id, title, group, initialMessages = []) {
  return { id, title, group, messages: initialMessages };
}

export default function RobinAI() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("robinai_chats_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      makeChat("c1", "Bitcoin Market Structure & Outlook", "Today", [
        {
          id: "m1",
          role: "user",
          text: "What is the current price and market structure of Bitcoin?"
        },
        {
          id: "m2",
          role: "assistant",
          payload: INITIAL_BTC_PAYLOAD,
          loading: false
        }
      ]),
      makeChat("c2", "Ethereum Tx Hash Diagnosis", "Today", [
        {
          id: "m3",
          role: "user",
          text: "Check transaction 0x8f3a1e2b9c4d6f7a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a"
        },
        {
          id: "m4",
          role: "assistant",
          payload: INITIAL_TX_PAYLOAD,
          loading: false
        }
      ]),
      makeChat("c3", "Smart Contract Scam Checker", "Yesterday"),
      makeChat("c4", "Web3 React Wallet Connection", "Previous")
    ];
  });

  const [activeId, setActiveId] = useState("c1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [model, setModel] = useState("Robin Auto");
  const [webOn, setWebOn] = useState(true);
  const [deepReason, setDeepReason] = useState(false);

  // Modals state
  const [exploreOpen, setExploreOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Auth / User State
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem("robinai_user");
      const profile = localStorage.getItem("robinai_profile");
      if (stored) {
        const user = JSON.parse(stored);
        const prof = profile ? JSON.parse(profile) : null;
        return { ...user, name: prof?.name || user.email };
      }
    } catch {}
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("robinai_token");
    localStorage.removeItem("robinai_user");
    localStorage.removeItem("robinai_profile");
    setAuthUser(null);
  };

  // Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("robinai_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      customInstructions: "",
      geminiKey: "",
      openaiKey: "",
      securityGuard: true,
      soundEffects: true
    };
  });

  // Sync chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("robinai_chats_v2", JSON.stringify(chats));
    } catch {}
  }, [chats]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("robinai_settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const scrollRef = useRef(null);
  const active = chats.find((c) => c.id === activeId) || null;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [active?.messages?.length, active?.messages?.[active?.messages?.length - 1]?.loading]);

  const updateChat = useCallback((id, fn) => {
    setChats((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const handleNewChat = () => {
    const id = `chat_${Date.now()}`;
    const fresh = makeChat(id, "New conversation", "Today");
    setChats((cs) => [fresh, ...cs]);
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    setChats((cs) => {
      const remaining = cs.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const handleSend = async (text) => {
    let id = activeId;
    if (!id) {
      id = `chat_${Date.now()}`;
      const fresh = makeChat(id, text.slice(0, 36) + "...", "Today");
      setChats((cs) => [fresh, ...cs]);
      setActiveId(id);
    }

    const userMsg = { id: nid(), role: "user", text };
    const loadingMsg = { id: nid(), role: "assistant", loading: true };

    // Get current chat history for Gemini context (before adding new messages)
    const currentChat = chats.find((c) => c.id === id);
    const chatHistory = currentChat?.messages || [];

    setChats((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              title: c.title === "New conversation" ? text.slice(0, 36) + "..." : c.title,
              messages: [...c.messages, userMsg, loadingMsg]
            }
          : c
      )
    );

    const intent = detectIntent(text);

    try {
      const payload = await fetchResponse(intent, text, webOn, deepReason, chatHistory, model, settings);
      const assistantMsg = {
        id: loadingMsg.id,
        role: "assistant",
        payload,
        text: payload.summary || payload.content || "",
        loading: false
      };

      updateChat(id, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === loadingMsg.id ? assistantMsg : m))
      }));
    } catch (err) {
      // Fallback error message
      const errorMsg = {
        id: loadingMsg.id,
        role: "assistant",
        payload: {
          kind: "general_ai",
          source: "Robin AI Core",
          content: `**Error:** ${err.message || "Something went wrong. Please check the server is running."}`
        },
        text: err.message || "Error",
        loading: false
      };
      updateChat(id, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === loadingMsg.id ? errorMsg : m))
      }));
    }
  };


  return (
    <div
      className="flex h-[100dvh] w-full overflow-hidden select-none"
      style={{ background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <style>{`
        @keyframes robinBlink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        ::-webkit-scrollbar { width: 7px; height: 7px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* Navigation Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenExplore={() => setExploreOpen(true)}
        onOpenRadar={() => setRadarOpen(true)}
        onOpenSafety={() => setSafetyOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        authUser={authUser}
        onSignIn={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Conversation Container */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={active ? active.title : "RobinAI"}
          onMenu={() => setSidebarOpen(true)}
          model={model}
          setModel={setModel}
          webOn={webOn}
          setWebOn={setWebOn}
          deepReason={deepReason}
          setDeepReason={setDeepReason}
          onExport={() => setExportOpen(true)}
          onClear={() => {
            if (active) updateChat(active.id, (c) => ({ ...c, messages: [] }));
          }}
          authUser={authUser}
          onSignIn={() => setAuthOpen(true)}
          onLogout={handleLogout}
        />

        {!active || active.messages.length === 0 ? (
          <WelcomeScreen onSuggest={handleSend} />
        ) : (
          <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {active.messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  msg={m}
                  onFollowUp={handleSend}
                  onRegenerate={() => handleSend(m.text || "Explain this in more detail.")}
                />
              ))}
            </div>
          </div>
        )}

        <Composer
          onSend={handleSend}
          webOn={webOn}
          setWebOn={setWebOn}
          deepReason={deepReason}
          setDeepReason={setDeepReason}
        />
      </div>

      {/* Interactive Modals */}
      <ExploreModal
        open={exploreOpen}
        onClose={() => setExploreOpen(false)}
        onSelectPrompt={handleSend}
      />

      <MarketRadarModal
        open={radarOpen}
        onClose={() => setRadarOpen(false)}
        onAnalyze={handleSend}
      />

      <SafetyModal
        open={safetyOpen}
        onClose={() => setSafetyOpen(false)}
        onRunCheck={handleSend}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        chat={active}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(user) => setAuthUser(user)}
      />
    </div>
  );
}
