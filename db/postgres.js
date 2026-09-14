// ============================================================
// RobinAI — Production PostgreSQL Database Adapter
// Connects to PostgreSQL (Supabase, Neon, Vercel Postgres, AWS RDS)
// Automatically initializes tables matching schema.sql on startup
// ============================================================

import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

export class PostgresDatabase {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.isInitialized = false;

    // Use SSL for hosted PostgreSQL providers (Supabase, Neon, AWS RDS, Vercel)
    const isLocalhost =
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1");

    this.pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]", err.message);
    });
  }

  // Auto-initialize tables matching db/schema.sql
  async init() {
    if (this.isInitialized) return;

    const schemaQueries = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user',
        account_type VARCHAR(20) DEFAULT 'free',
        queries_used INTEGER DEFAULT 0,
        queries_limit INTEGER DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        thought TEXT,
        model VARCHAR(50) DEFAULT 'Robin Auto',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);

      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(20) DEFAULT 'free',
        status VARCHAR(20) DEFAULT 'active',
        store VARCHAR(20) DEFAULT 'none',
        transaction_id VARCHAR(255),
        current_period_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS push_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        platform VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.pool.query(schemaQueries);
      this.isInitialized = true;
      console.log("[PostgreSQL] Tables verified and ready.");
    } catch (err) {
      console.error("[PostgreSQL Init Error]", err.message);
      throw err;
    }
  }

  // ── Authentication & Users ──────────────────────────────────
  async createUser(email, passwordHash, name = "Robin User") {
    await this.init();
    const cleanEmail = email.toLowerCase().trim();

    const existing = await this.pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
      [cleanEmail]
    );
    if (existing.rows.length > 0) {
      throw new Error("Email already registered");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email, created_at as "createdAt"`,
        [cleanEmail, passwordHash]
      );
      const user = userRes.rows[0];

      const profileRes = await client.query(
        `INSERT INTO profiles (user_id, name, account_type, role)
         VALUES ($1, $2, 'free', 'user')
         RETURNING user_id as "userId", name, avatar_url as "avatarUrl", account_type as "accountType", role, created_at as "createdAt"`,
        [user.id, name || "Robin User"]
      );
      const profile = profileRes.rows[0];

      await client.query(
        `INSERT INTO subscriptions (user_id, plan, status, store)
         VALUES ($1, 'free', 'active', 'none')
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );

      await client.query("COMMIT");
      return { user, profile };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email) {
    await this.init();
    const cleanEmail = email.toLowerCase().trim();
    const res = await this.pool.query(
      `SELECT id, email, password_hash as "passwordHash", created_at as "createdAt"
       FROM users
       WHERE LOWER(email) = $1 LIMIT 1`,
      [cleanEmail]
    );
    return res.rows[0] || null;
  }

  async findUserById(id) {
    await this.init();
    const userRes = await this.pool.query(
      `SELECT id, email, created_at as "createdAt" FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (userRes.rows.length === 0) return null;

    const profileRes = await this.pool.query(
      `SELECT user_id as "userId", name, avatar_url as "avatarUrl", account_type as "accountType", role, created_at as "createdAt"
       FROM profiles WHERE user_id = $1 LIMIT 1`,
      [id]
    );

    const subRes = await this.pool.query(
      `SELECT plan, status, store, current_period_end as "currentPeriodEnd"
       FROM subscriptions WHERE user_id = $1 LIMIT 1`,
      [id]
    );

    return {
      user: userRes.rows[0],
      profile: profileRes.rows[0] || { userId: id, name: "Robin User", accountType: "free" },
      subscription: subRes.rows[0] || { plan: "free", status: "active" },
    };
  }

  async updateProfile(userId, { name, avatarUrl }) {
    await this.init();
    const res = await this.pool.query(
      `INSERT INTO profiles (user_id, name, avatar_url, updated_at)
       VALUES ($1, COALESCE($2, 'Robin User'), $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE
       SET name = COALESCE($2, profiles.name),
           avatar_url = COALESCE($3, profiles.avatar_url),
           updated_at = CURRENT_TIMESTAMP
       RETURNING user_id as "userId", name, avatar_url as "avatarUrl", account_type as "accountType", role`,
      [userId, name, avatarUrl]
    );
    return res.rows[0];
  }

  async deleteUser(userId) {
    await this.init();
    await this.pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return true;
  }

  // ── Conversations ──────────────────────────────────────────
  async getConversations(userId) {
    await this.init();
    const res = await this.pool.query(
      `SELECT id, user_id as "userId", title, is_archived as "isArchived",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM conversations
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async createConversation(userId, title = "New Conversation") {
    await this.init();
    const res = await this.pool.query(
      `INSERT INTO conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING id, user_id as "userId", title, created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, title]
    );
    return res.rows[0];
  }

  async renameConversation(convId, userId, newTitle) {
    await this.init();
    const res = await this.pool.query(
      `UPDATE conversations
       SET title = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id as "userId", title, updated_at as "updatedAt"`,
      [newTitle, convId, userId]
    );
    if (res.rows.length === 0) throw new Error("Conversation not found");
    return res.rows[0];
  }

  async deleteConversation(convId, userId) {
    await this.init();
    await this.pool.query(
      "DELETE FROM conversations WHERE id = $1 AND user_id = $2",
      [convId, userId]
    );
    return true;
  }

  // ── Messages ────────────────────────────────────────────────
  async getMessages(convId) {
    await this.init();
    const res = await this.pool.query(
      `SELECT id, conversation_id as "conversationId", role, content, thought, model,
              created_at as "createdAt"
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [convId]
    );
    return res.rows;
  }

  async addMessage(convId, role, content, thought = null, model = "Robin Auto") {
    await this.init();
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const msgRes = await client.query(
        `INSERT INTO messages (conversation_id, role, content, thought, model)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, conversation_id as "conversationId", role, content, thought, model, created_at as "createdAt"`,
        [convId, role, content, thought, model]
      );
      const msg = msgRes.rows[0];

      // Update conversation updatedAt timestamp and auto-title on first user message
      await client.query(
        `UPDATE conversations
         SET updated_at = CURRENT_TIMESTAMP,
             title = CASE
               WHEN title = 'New Conversation' AND $1 = 'user'
               THEN SUBSTRING($2 FROM 1 FOR 36)
               ELSE title
             END
         WHERE id = $3`,
        [role, content, convId]
      );

      await client.query("COMMIT");
      return msg;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── Subscriptions ───────────────────────────────────────────
  async getSubscription(userId) {
    await this.init();
    const res = await this.pool.query(
      `SELECT plan, status, store, current_period_end as "currentPeriodEnd"
       FROM subscriptions WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    return res.rows[0] || { plan: "free", status: "active" };
  }

  async updateSubscription(userId, plan, status = "active", store = "none") {
    await this.init();
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const subRes = await client.query(
        `INSERT INTO subscriptions (user_id, plan, status, store, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE
         SET plan = $2, status = $3, store = $4, updated_at = CURRENT_TIMESTAMP
         RETURNING plan, status, store, updated_at as "updatedAt"`,
        [userId, plan, status, store]
      );

      const accountType = plan.startsWith("pro") ? "pro" : "free";
      await client.query(
        `UPDATE profiles SET account_type = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
        [accountType, userId]
      );

      await client.query("COMMIT");
      return subRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── Push Tokens ─────────────────────────────────────────────
  async registerPushToken(userId, token, platform) {
    await this.init();
    await this.pool.query(
      `INSERT INTO push_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE
       SET user_id = $1, platform = $3`,
      [userId, token, platform]
    );
    return true;
  }

  // No-op for save to match local store interface
  save() {}
}

export default PostgresDatabase;
