import { getApiBaseUrl, FALLBACK_MARKETS, MarketItem } from "./api";

export interface TransactionDetail {
  hash: string;
  status: string;
  network: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  confirmations: string;
  method: string;
}

export interface WalletDetail {
  address: string;
  ethBalance: string;
  ethUsd: number;
  txCount: number;
  securityStatus: string;
  recentTxs: {
    hash: string;
    from: string;
    to: string;
    value: string;
    time: string;
    status: string;
  }[];
}

class IntelligenceService {
  async getMarketOverview(): Promise<MarketItem[]> {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/prices`);
      if (!res.ok) throw new Error("Markets API failed");
      const list = await res.json();
      return list.map((item: any) => ({
        sym: item.symbol?.toUpperCase(),
        name: item.name,
        p: item.current_price,
        c: parseFloat(item.price_change_percentage_24h?.toFixed(2) || "0"),
        cap: `${(item.market_cap / 1e9).toFixed(2)}B`,
        vol: `${(item.total_volume / 1e9).toFixed(2)}B`,
      }));
    } catch {
      return FALLBACK_MARKETS;
    }
  }

  async getCoinDetail(symbol: string) {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/price/${symbol.toUpperCase()}`);
      if (!res.ok) throw new Error("Price API error");
      return await res.json();
    } catch {
      return FALLBACK_MARKETS.find((m) => m.sym.toLowerCase() === symbol.toLowerCase()) || null;
    }
  }

  async getTransaction(hash: string): Promise<TransactionDetail | null> {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/tx/${hash}`);
      if (!res.ok) throw new Error("Transaction lookup failed");
      return await res.json();
    } catch {
      return null;
    }
  }

  async getWallet(address: string): Promise<WalletDetail | null> {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/wallet/${address}`);
      if (!res.ok) throw new Error("Wallet lookup failed");
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const intelligenceService = new IntelligenceService();
export default intelligenceService;
