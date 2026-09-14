import { Platform } from "react-native";

// Default API Base URL:
// In dev, iOS simulator can use localhost, Android emulator uses 10.0.2.2.
// Alternatively reads from EXPO_PUBLIC_API_URL or defaults to 4000.
let customBaseUrl: string | null = null;

export function setCustomApiUrl(url: string) {
  customBaseUrl = url.trim().replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
  if (customBaseUrl) return customBaseUrl;
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:4000";
    }
    return "http://localhost:4000";
  }
  return "https://robinai.digital";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  thought?: string;
  suggestedFollowUps?: string[];
  isSecurityAlert?: boolean;
}

export interface MarketItem {
  sym: string;
  name: string;
  p: number;
  c: number;
  cap: string;
  vol: string;
}

// Fallback market data if backend isn't immediately reachable
export const FALLBACK_MARKETS: MarketItem[] = [
  { sym: "BTC", name: "Bitcoin", p: 67840.5, c: 3.24, cap: "1.34T", vol: "34.8B" },
  { sym: "ETH", name: "Ethereum", p: 3490.2, c: -0.85, cap: "419.6B", vol: "18.2B" },
  { sym: "SOL", name: "Solana", p: 154.6, c: 6.72, cap: "72.1B", vol: "5.4B" },
  { sym: "BNB", name: "BNB", p: 588.4, c: 1.15, cap: "89.2B", vol: "1.1B" },
  { sym: "XRP", name: "XRP", p: 0.582, c: 2.10, cap: "32.8B", vol: "1.4B" },
  { sym: "ADA", name: "Cardano", p: 0.384, c: -1.45, cap: "13.7B", vol: "320M" },
  { sym: "AVAX", name: "Avalanche", p: 28.75, c: 4.80, cap: "11.4B", vol: "480M" },
  { sym: "LINK", name: "Chainlink", p: 12.85, c: 3.40, cap: "7.8B", vol: "290M" },
  { sym: "SUI", name: "Sui", p: 1.84, c: 8.90, cap: "5.1B", vol: "620M" },
  { sym: "NEAR", name: "NEAR Protocol", p: 4.65, c: -0.40, cap: "5.5B", vol: "210M" },
];

/**
 * Send chat message to RobinAI Backend
 */
export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[] = [],
  model = "gemini-1.5-flash"
): Promise<{ content: string; thought?: string; follow?: string[] }> {
  const baseUrl = getApiBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, model }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.content,
      thought: data.thought,
      follow: [
        "Explain in more technical depth",
        "Give me a concrete example",
        "What are the security precautions?",
        "Show related on-chain concepts",
      ],
    };
  } catch (err: any) {
    console.warn("[RobinAI Mobile API Warning]", err.message);

    // Provide intelligent offline response adhering to Robin persona
    const lower = message.toLowerCase();
    let simulatedContent = "";
    let followUps = ["What is Bitcoin?", "How do hardware wallets work?", "Security Checklist"];

    if (lower.includes("scam") || lower.includes("drainer") || lower.includes("double")) {
      simulatedContent = `### Potential Security Threat Detected\n\n**Warning**: Never share your seed phrase or private key with anyone.\n\n1. Stop communicating with the suspected sender immediately.\n2. Do not send any funds or sign unknown transactions.\n3. Disconnect your wallet and check allowances on Revoke.cash.\n4. Remember: No legitimate platform or support team will ever ask for your secret recovery phrase.`;
      followUps = ["How to revoke malicious permissions", "Recognizing fake giveaways", "Hardware wallet safety"];
    } else if (lower.includes("transaction") || lower.includes("0x")) {
      simulatedContent = `### Transaction Analysis\n\nTo check your transaction on-chain:\n1. Identify the blockchain network (e.g. Ethereum, Arbitrum, Solana).\n2. Look up the transaction hash on a public block explorer like Etherscan.\n3. Check if the status is **Pending**, **Confirmed**, or **Failed/Reverted**.\n\n*Reminder: Always verify network gas fees before submitting.*`;
      followUps = ["Why is my transaction pending?", "How to speed up transactions with gas", "Wrong network recovery"];
    } else {
      simulatedContent = `I’m Robin, your AI assistant.\n\nI can help you with general problem-solving, programming, research, as well as crypto concepts, wallet security, and blockchain analysis.\n\n*(Note: Running in offline/demo mode. To connect live Gemini AI, launch your backend with \`node server.js\` and ensure your API URL is reachable at ${baseUrl}.)*`;
    }

    return {
      content: simulatedContent,
      thought: "1. Network connection to backend timed out.\n2. Engaging Robin AI local fallback heuristics.\n3. Enforcing Robin's core security rules & formatting.",
      follow: followUps,
    };
  }
}

/**
 * Fetch spot crypto price
 */
export async function fetchCryptoPrice(symbol: string): Promise<any> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/price/${symbol.toUpperCase()}`);
    if (!res.ok) throw new Error("Price API error");
    return await res.json();
  } catch (err) {
    const found = FALLBACK_MARKETS.find(
      (m) => m.sym.toLowerCase() === symbol.toLowerCase()
    );
    return found || null;
  }
}
