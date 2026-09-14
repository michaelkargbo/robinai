// ============================================================
// RobinAI — Standalone Database Schema Migration / Test Script
// Usage: node db/init.js
// ============================================================

import "dotenv/config";
import { PostgresDatabase } from "./postgres.js";

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

async function run() {
  console.log("⚡ Checking PostgreSQL connection...");

  if (!dbUrl) {
    console.warn("⚠️  No DATABASE_URL or POSTGRES_URL found in environment variables.");
    console.warn("   To use PostgreSQL, set DATABASE_URL in your .env file or Vercel dashboard.");
    console.log("   Example: DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require\n");
    process.exit(0);
  }

  try {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    console.log(`Connecting to: ${maskedUrl}`);
    const db = new PostgresDatabase(dbUrl);
    await db.init();
    console.log("✅ PostgreSQL schema successfully initialized and verified!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database initialization error:", err.message);
    process.exit(1);
  }
}

run();
