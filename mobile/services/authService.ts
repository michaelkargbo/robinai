import * as SecureStore from "expo-secure-store";
import { getApiBaseUrl } from "./api";

const TOKEN_KEY = "robinai_auth_token";
const USER_KEY = "robinai_user_data";

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  accountType: "free" | "pro";
  role?: string;
  queriesUsed?: number;
  queriesLimit?: number;
}

export interface Subscription {
  plan: string;
  status: string;
  store?: string;
  currentPeriodEnd?: string | null;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private profile: Profile | null = null;

  async init(): Promise<{ user: User | null; profile: Profile | null; token: string | null }> {
    try {
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      if (userStr) {
        const parsed = JSON.parse(userStr);
        this.user = parsed.user;
        this.profile = parsed.profile;
      }

      if (this.token) {
        // Validate with backend in background
        this.fetchCurrentProfile().catch(() => {});
      }
    } catch (e) {
      console.warn("[AuthService] SecureStore init error:", e);
    }
    return { user: this.user, profile: this.profile, token: this.token };
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  getProfile(): Profile | null {
    return this.profile;
  }

  async register(email: string, password: string, name: string) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    await this.setSession(data.token, data.user, data.profile);
    return data;
  }

  async login(email: string, password: string) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid credentials");

    await this.setSession(data.token, data.user, data.profile);
    return data;
  }

  async fetchCurrentProfile() {
    if (!this.token) return null;
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      this.user = data.user;
      this.profile = data.profile;
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify({ user: this.user, profile: this.profile }));
      return data;
    }
    return null;
  }

  async resetPassword(email: string, newPassword: string) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reset password");
    return data;
  }

  async updateProfile(name: string, avatarUrl?: string) {
    if (!this.token) throw new Error("Not logged in");
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ name, avatarUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Profile update failed");
    this.profile = data;
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify({ user: this.user, profile: this.profile }));
    return data;
  }

  async deleteAccount() {
    if (!this.token) return;
    const baseUrl = getApiBaseUrl();
    await fetch(`${baseUrl}/api/auth/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.token}` },
    });
    await this.logout();
  }

  async logout() {
    this.token = null;
    this.user = null;
    this.profile = null;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {}
  }

  private async setSession(token: string, user: User, profile: Profile) {
    this.token = token;
    this.user = user;
    this.profile = profile;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify({ user, profile }));
    } catch (e) {
      console.warn("[AuthService] SecureStore save warning:", e);
    }
  }
}

export const authService = new AuthService();
export default authService;
