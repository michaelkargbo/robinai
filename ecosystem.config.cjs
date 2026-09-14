// PM2 Ecosystem Configuration for RobinAI
// ============================================================
// Usage:
//   npm run pm2:start          → Start with ecosystem config
//   pm2 restart robinai        → Restart
//   pm2 logs robinai           → View live logs
//   pm2 save && pm2 startup    → Auto-start on system boot
// ============================================================

module.exports = {
  apps: [
    {
      name: "robinai",
      script: "server.js",
      interpreter: "node",

      // Clustering — use "cluster" + max CPUs for multi-core production
      instances: 1,          // Change to "max" to use all CPU cores
      exec_mode: "fork",     // Change to "cluster" if instances > 1

      watch: false,          // Never watch in production (restart on deploy instead)

      // Environment — do NOT hardcode PORT here; read it from the system/.env
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 4000,
      },

      // Auto-restart policy
      autorestart: true,
      max_restarts: 20,
      restart_delay: 3000,   // 3 seconds between restarts
      min_uptime: "10s",
      max_memory_restart: "512M", // Restart if memory exceeds 512MB

      // Logging
      out_file: "./logs/robinai-out.log",
      error_file: "./logs/robinai-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,    // 5 seconds to gracefully shut down
      listen_timeout: 8000,  // 8 seconds to start listening
    },
  ],
};
