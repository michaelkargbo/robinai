// PM2 Ecosystem Configuration for RobinAI
// Usage:
//   pm2 start ecosystem.config.cjs          → Start production server
//   pm2 restart robinai                     → Restart
//   pm2 logs robinai                        → View live logs
//   pm2 save && pm2 startup                 → Auto-start on system boot

module.exports = {
  apps: [
    {
      name: "robinai",
      script: "server.js",
      interpreter: "node",
      watch: false,             // Set to true to auto-restart on file changes
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      // Auto-restart config
      autorestart: true,
      max_restarts: 20,
      restart_delay: 3000,      // 3s between restarts
      min_uptime: "10s",
      // Logging
      out_file: "./logs/robinai-out.log",
      error_file: "./logs/robinai-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
