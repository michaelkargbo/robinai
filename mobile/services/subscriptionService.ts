import { getApiBaseUrl } from "./api";
import { authService, Subscription } from "./authService";

export interface PlanTier {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
}

export const PLANS: PlanTier[] = [
  {
    id: "free",
    name: "Robin Free",
    price: "$0",
    period: "forever",
    features: [
      "Standard Robin AI Intelligence",
      "50 daily queries",
      "Basic crypto market radar",
      "Community security alerts",
      "Standard response speed",
    ],
  },
  {
    id: "pro_monthly",
    name: "Robin Pro Monthly",
    price: "$19",
    period: "per month",
    badge: "POPULAR",
    features: [
      "Unlimited AI assistant queries",
      "Multi-model routing (Claude 3.7, GPT-4o, Gemini 2.5 Pro)",
      "Real-time smart contract & wallet audit",
      "Deep reasoning thought process mode",
      "Instant push security alerts",
      "Priority response speed & zero queue",
    ],
  },
  {
    id: "pro_yearly",
    name: "Robin Pro Annual",
    price: "$190",
    period: "per year (Save 17%)",
    badge: "BEST VALUE",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Priority developer API access",
      "VIP customer support",
    ],
  },
];

class SubscriptionService {
  async getSubscription(): Promise<Subscription> {
    const token = authService.getToken();
    if (!token) return { plan: "free", status: "active" };

    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/user/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to get subscription");
      return await res.json();
    } catch {
      return { plan: "free", status: "active" };
    }
  }

  async upgradePlan(planId: string, store: "apple" | "google" | "web" = "apple"): Promise<Subscription> {
    const token = authService.getToken();
    if (!token) throw new Error("Please log in to upgrade your subscription");

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/user/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan: planId, store }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Subscription update failed");
    return data;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
