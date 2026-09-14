// ============================================================
// RobinAI — Unified Database Adapter & Store
// Supports local file-backed persistence (dev/VPS)
// Production: set DATA_DIR env var or use PostgreSQL adapter
// ============================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { PostgresDatabase } from "./postgres.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if PostgreSQL connection string is configured
const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Determine the data directory in priority order:
// 1. DATA_DIR env var (explicit config for any platform)
// 2. Vercel serverless → /tmp (ephemeral, resets per invocation)
// 3. db/ subdirectory relative to this file (local/VPS default)
function resolveDataDir() {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  if (process.env.VERCEL) {
    return "/tmp";
  }
  // Default: a dedicated data/ directory in the project root
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
      console.warn("[Database] Could not create data/ dir, falling back to /tmp:", e.message);
      return "/tmp";
    }
  }
  return dataDir;
}

const DATA_DIR = resolveDataDir();
const STORE_PATH = path.join(DATA_DIR, "robin_store.json");

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
    this.data = { ...initialStore };
    this._saveDebounce = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        // Merge with initial store so new fields are always present
        this.data = { ...initialStore, ...parsed };
        console.log(`[Database] Store loaded from ${STORE_PATH} (${this.data.users.length} users)`);
      } else {
        console.log(`[Database] New store created at ${STORE_PATH}`);
        this.save();
      }
    } catch (e) {
      console.warn("[Database] Using fresh in-memory store, file read failed:", e.message);
      this.data = { ...initialStore };
    }
  }

  save() {
    // Debounce writes to prevent hammering the disk on rapid operations
    clearTimeout(this._saveDebounce);
    this._saveDebounce = setTimeout(() => {
      try {
        const tmp = STORE_PATH + ".tmp";
        fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), "utf-8");
        fs.renameSync(tmp, STORE_PATH); // Atomic write
      } catch (e) {
        console.error("[Database] Failed to persist store:", e.message);
      }
    }, 200);
  }

  // ── Authentication & Users ──────────────────────────────────
  async createUser(email, passwordHash, name = "Robin User") {
    const existing = this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) throw new Error("Email already registered");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const user = {
      id,
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: now,
    };

    const profile = {
      userId: id,
      name: name || "Robin User",
      avatarUrl: null,
      accountType: "free",
      role: "user",
      queriesUsed: 0,
      queriesLimit: 100,
      createdAt: now,
    };

    this.data.users.push(user);
    this.data.profiles[id] = profile;
    this.data.subscriptions[id] = {
      userId: id,
      plan: "free",
      status: "active",
      store: "none",
      currentPeriodEnd: null,
      createdAt: now,
    };

    this.save();
    return { user, profile };
  }

  async findUserByEmail(email) {
    return (
      this.data.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      ) || null
    );
  }

  async findUserById(id) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const profile = this.data.profiles[id] || {};
    const subscription = this.data.subscriptions[id] || {
      plan: "free",
      status: "active",
    };
    return { user, profile, subscription };
  }

  async updateProfile(userId, { name, avatarUrl }) {
    if (!this.data.profiles[userId]) {
      this.data.profiles[userId] = { userId };
    }
    if (name !== undefined) this.data.profiles[userId].name = name;
    if (avatarUrl !== undefined) this.data.profiles[userId].avatarUrl = avatarUrl;
    this.save();
    return this.data.profiles[userId];
  }

  async deleteUser(userId) {
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    delete this.data.profiles[userId];
    delete this.data.subscriptions[userId];
    // Also delete all conversations and messages for this user
    const userConvIds = this.data.conversations
      .filter((c) => c.userId === userId)
      .map((c) => c.id);
    this.data.conversations = this.data.conversations.filter(
      (c) => c.userId !== userId
    );
    for (const convId of userConvIds) {
      delete this.data.messages[convId];
    }
    this.save();
    return true;
  }

  // ── Conversations ──────────────────────────────────────────
  async getConversations(userId) {
    return this.data.conversations
      .filter((c) => c.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  async createConversation(userId, title = "New Conversation") {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const conv = { id, userId, title, createdAt: now, updatedAt: now };
    this.data.conversations.unshift(conv);
    this.data.messages[id] = [];
    this.save();
    return conv;
  }

  async renameConversation(convId, userId, newTitle) {
    const conv = this.data.conversations.find(
      (c) => c.id === convId && c.userId === userId
    );
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

  // Sync version for internal use
  getMessages(convId) {
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

    // Update conversation's updatedAt and auto-title on first user message
    const conv = this.data.conversations.find((c) => c.id === convId);
    if (conv) {
      conv.updatedAt = msg.createdAt;
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
      this.data.profiles[userId].accountType = plan.startsWith("pro")
        ? "pro"
        : "free";
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

export const db = PG_URL
  ? new PostgresDatabase(PG_URL)
  : new RobinDatabase();

if (PG_URL) {
  console.log("[Database] Initialized with production PostgreSQL engine.");
} else {
  console.log("[Database] Initialized with local file store engine.");
}

export default db;
