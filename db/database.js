// ============================================================
// RobinAI — Unified Database Adapter & Store
// Supports local file-backed persistence & PostgreSQL / Supabase
// ============================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = process.env.VERCEL
  ? path.join("/tmp", "robin_store.json")
  : path.join(__dirname, "robin_store.json");

// Initial schema template for local persistence
const initialStore = {
  users: [],
  profiles: {},
  conversations: [],
  messages: {},
  subscriptions: {},
  push_tokens: [],
};

class RobinDatabase {
  constructor() {
    this.data = initialStore;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn("[Database] Using memory store, file save failed:", e.message);
      this.data = initialStore;
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[Database] Failed to write store:", e.message);
    }
  }

  // ── Authentication & Users ──────────────────────────────────
  async createUser(email, passwordHash, name = "Robin User") {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error("Email already registered");

    const id = crypto.randomUUID();
    const user = {
      id,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const profile = {
      userId: id,
      name,
      avatarUrl: null,
      accountType: "free",
      role: "user",
      queriesUsed: 0,
      queriesLimit: 100,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(user);
    this.data.profiles[id] = profile;
    this.data.subscriptions[id] = {
      userId: id,
      plan: "free",
      status: "active",
      store: "none",
      currentPeriodEnd: null,
    };

    this.save();
    return { user, profile };
  }

  async findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const profile = this.data.profiles[id] || {};
    const subscription = this.data.subscriptions[id] || { plan: "free", status: "active" };
    return { user, profile, subscription };
  }

  async updateProfile(userId, { name, avatarUrl }) {
    if (!this.data.profiles[userId]) {
      this.data.profiles[userId] = { userId };
    }
    if (name) this.data.profiles[userId].name = name;
    if (avatarUrl) this.data.profiles[userId].avatarUrl = avatarUrl;
    this.save();
    return this.data.profiles[userId];
  }

  async deleteUser(userId) {
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    delete this.data.profiles[userId];
    delete this.data.subscriptions[userId];
    this.data.conversations = this.data.conversations.filter((c) => c.userId !== userId);
    this.save();
    return true;
  }

  // ── Conversations ──────────────────────────────────────────
  async getConversations(userId) {
    return this.data.conversations
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createConversation(userId, title = "New Conversation") {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const conv = {
      id,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
    };
    this.data.conversations.unshift(conv);
    this.data.messages[id] = [];
    this.save();
    return conv;
  }

  async renameConversation(convId, userId, newTitle) {
    const conv = this.data.conversations.find((c) => c.id === convId && c.userId === userId);
    if (!conv) throw new Error("Conversation not found");
    conv.title = newTitle;
    conv.updatedAt = new Date().toISOString();
    this.save();
    return conv;
  }

  async deleteConversation(convId, userId) {
    this.data.conversations = this.data.conversations.filter(
      (c) => !(c.id === convId && c.userId === userId)
    );
    delete this.data.messages[convId];
    this.save();
    return true;
  }

  // ── Messages ────────────────────────────────────────────────
  async getMessages(convId) {
    return this.data.messages[convId] || [];
  }

  async addMessage(convId, role, content, thought = null, model = "Robin Auto") {
    if (!this.data.messages[convId]) {
      this.data.messages[convId] = [];
    }
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role,
      content,
      thought,
      model,
      createdAt: new Date().toISOString(),
    };
    this.data.messages[convId].push(msg);

    // Update conversation updatedAt timestamp
    const conv = this.data.conversations.find((c) => c.id === convId);
    if (conv) {
      conv.updatedAt = msg.createdAt;
      // Auto-name conversation on first user query if still generic
      if (conv.title === "New Conversation" && role === "user") {
        conv.title = content.slice(0, 36) + (content.length > 36 ? "..." : "");
      }
    }

    this.save();
    return msg;
  }

  // ── Subscriptions ───────────────────────────────────────────
  async getSubscription(userId) {
    return this.data.subscriptions[userId] || { plan: "free", status: "active" };
  }

  async updateSubscription(userId, plan, status = "active", store = "none") {
    this.data.subscriptions[userId] = {
      userId,
      plan,
      status,
      store,
      updatedAt: new Date().toISOString(),
    };
    if (this.data.profiles[userId]) {
      this.data.profiles[userId].accountType = plan.startsWith("pro") ? "pro" : "free";
    }
    this.save();
    return this.data.subscriptions[userId];
  }

  // ── Push Tokens ─────────────────────────────────────────────
  async registerPushToken(userId, token, platform) {
    const existing = this.data.push_tokens.find((p) => p.token === token);
    if (!existing) {
      this.data.push_tokens.push({
        userId,
        token,
        platform,
        createdAt: new Date().toISOString(),
      });
      this.save();
    }
    return true;
  }
}

export const db = new RobinDatabase();
export default db;
