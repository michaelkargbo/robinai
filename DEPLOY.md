# RobinAI — Production Deployment & Domain Setup Guide

> **Official Domain**: `robinai.digital` (or your custom domain)  
> **Architecture**: Full-Stack Node.js (Express 4 + ES Modules) + React 18 (Vite) + Local/Persistent JSON Data Store

---

## Table of Contents
1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Option A: Deploy to Railway (Recommended)](#3-option-a-deploy-to-railway-recommended)
4. [Option B: Deploy to Render](#4-option-b-deploy-to-render)
5. [Option C: Deploy to a VPS (Ubuntu / Debian) with PM2 & Nginx](#5-option-c-deploy-to-a-vps-ubuntu--debian-with-pm2--nginx)
6. [Option D: Deploying to Vercel](#6-option-d-deploying-to-vercel)
7. [Custom Domain & DNS Setup](#7-custom-domain--dns-setup)
8. [SSL / HTTPS Configuration](#8-ssl--https-configuration)
9. [Verifying Your Deployment](#9-verifying-your-deployment)
10. [Troubleshooting & Maintenance](#10-troubleshooting--maintenance)

---

## 1. Pre-Deployment Checklist

Before deploying, ensure you have:
- [ ] A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] (Optional) An Etherscan API key for live Ethereum transaction and wallet data
- [ ] (Optional) A CoinGecko API key (the free tier works without a key via public rate limits)
- [ ] Your custom domain name purchased (e.g. at Namecheap, GoDaddy, Porkbun, Cloudflare, etc.)
- [ ] A randomly generated 64-character secret for `JWT_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

## 2. Environment Variables Reference

Configure these in your production host dashboard or `.env` file:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `4000` | Port Express listens on. Hostings like Railway/Render set this automatically. |
| `NODE_ENV` | Yes | `production` | Enables production optimizations, secure cookies, and logging. |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key for AI reasoning, chat, and smart contract analysis. |
| `JWT_SECRET` | **Yes** | — | Secret string for signing auth tokens. Must be strong and kept private. |
| `ALLOWED_ORIGINS` | Recommended | `https://robinai.digital,http://localhost:3000` | Comma-separated list of allowed CORS origins. |
| `DATA_DIR` | Optional | `./data` | Directory for persistent storage (`users.json`, etc.). On VPS or persistent volumes, point here. |
| `ETHERSCAN_API_KEY` | Optional | — | Required for live Ethereum transaction & address lookups. |
| `COINGECKO_API_KEY` | Optional | — | Optional Pro/Demo API key for higher CoinGecko rate limits. |

---

## 3. Option A: Deploy to Railway (Recommended)

Railway runs Node.js natively with persistent disk support and automatic SSL.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Production release"
   git push origin main
   ```
2. **Create a project in Railway**:
   - Go to [railway.com](https://railway.com/) and click **New Project** → **Deploy from GitHub repo**.
   - Select your `robinai` repository.
3. **Configure Environment Variables**:
   - In Railway dashboard, go to the **Variables** tab.
   - Add:
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = `your_gemini_api_key`
     - `JWT_SECRET` = `your_secure_jwt_secret`
     - `ALLOWED_ORIGINS` = `https://robinai.digital,https://your-railway-domain.up.railway.app`
4. **Add Persistent Storage (Optional but recommended)**:
   - In Railway service settings, click **Add Volume** mounted at `/app/data`.
   - Set the environment variable `DATA_DIR=/app/data`.
5. **Build & Deploy**:
   - Railway reads `railway.json` automatically:
     - Build command: `npm run build`
     - Start command: `node server.js`
     - Health check: `/api/health`
6. **Connect Custom Domain**:
   - In **Settings** → **Networking** → **Custom Domains**, add `robinai.digital` and `www.robinai.digital`.
   - Follow the CNAME record instructions provided by Railway.

---

## 4. Option B: Deploy to Render

1. Create a **New Web Service** connected to your repository on [render.com](https://render.com).
2. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables (`GEMINI_API_KEY`, `JWT_SECRET`, `NODE_ENV=production`, `ALLOWED_ORIGINS`).
4. In **Settings** → **Custom Domains**, add `robinai.digital`.

---

## 5. Option C: Deploy to a VPS (Ubuntu / Debian) with PM2 & Nginx

For full control, highest performance, and lowest cost.

### 5.1 Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS & Git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx

# Install PM2 process manager globally
sudo npm install -g pm2
```

### 5.2 Clone and Build RobinAI
```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> robinai
cd robinai
sudo chown -R $USER:$USER /var/www/robinai

# Install dependencies and build frontend
npm install --production=false
npm run build

# Create persistent data and log directories
mkdir -p data logs
```

### 5.3 Configure Environment
```bash
cp .env.example .env
nano .env
# Fill in GEMINI_API_KEY, JWT_SECRET, NODE_ENV=production, ALLOWED_ORIGINS=https://robinai.digital
```

### 5.4 Start with PM2
```bash
# Start RobinAI using the included ecosystem configuration
pm2 start ecosystem.config.cjs --env production

# Ensure PM2 restarts automatically on server reboot
pm2 save
pm2 startup
```

### 5.5 Configure Nginx Reverse Proxy
```bash
# Copy the included nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/robinai

# Edit server_name with your actual domain
sudo nano /etc/nginx/sites-available/robinai

# Enable the site
sudo ln -s /etc/nginx/sites-available/robinai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 5.6 Provision SSL with Let's Encrypt
```bash
sudo certbot --nginx -d robinai.digital -d www.robinai.digital
```

---

## 6. Option D: Deploying to Vercel

RobinAI includes `vercel.json` and `api/index.js` for Vercel deployment:
- **Frontend**: Serves the Vite single page app from `dist/` with edge caching.
- **Backend API**: Routes `/api/*` to the serverless function in `api/index.js`.
- *Note*: On Vercel, the local JSON database writes to `/tmp` and resets between cold starts. For persistent databases on Vercel, connect a hosted PostgreSQL or Supabase database.

---

## 7. Custom Domain & DNS Setup

To point your custom domain (e.g. `robinai.digital`) to your server:

### When using a VPS (DigitalOcean / Hetzner / AWS EC2 / Linode):
Create the following DNS records in your domain registrar or Cloudflare:

| Type | Name | Content / Value | TTL |
|---|---|---|---|
| **A** | `@` | `YOUR_SERVER_IP_ADDRESS` | Auto / 300 |
| **A** (or **CNAME**) | `www` | `YOUR_SERVER_IP_ADDRESS` (or `@`) | Auto / 300 |

### When using Railway / Render:
| Type | Name | Content / Value | TTL |
|---|---|---|---|
| **CNAME** | `@` (or ALIAS / ANAME) | Provided in Railway/Render dashboard | Auto |
| **CNAME** | `www` | Provided in Railway/Render dashboard | Auto |

### Cloudflare Recommendation
If managing DNS through Cloudflare:
- Set encryption mode to **Full (Strict)** under SSL/TLS settings.
- Proxy status (`Orange Cloud`) can be enabled for DDoS protection and global CDN caching.

---

## 8. Verifying Your Deployment

Run these sanity checks once deployed:

1. **Check Health Endpoint**:
   ```bash
   curl -i https://robinai.digital/api/health
   ```
   *Expected Response:*
   ```json
   {
     "status": "healthy",
     "service": "RobinAI API",
     "timestamp": "...",
     "uptime": 12.34
   }
   ```

2. **Verify Security Headers**:
   ```bash
   curl -I https://robinai.digital
   ```
   Confirm presence of `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security`.

3. **Verify API Live Data**:
   ```bash
   curl https://robinai.digital/api/prices
   ```

4. **Verify Gzip Compression**:
   ```bash
   curl -H "Accept-Encoding: gzip" -I https://robinai.digital
   ```
   Should return `Content-Encoding: gzip`.

---

## 9. Troubleshooting & Maintenance

### PM2 Commands (VPS)
```bash
pm2 status             # Check process status
pm2 logs robinai       # Stream live backend logs
pm2 reload robinai     # Zero-downtime reload
pm2 restart robinai    # Full restart
```

### View Application Logs
- Express access and error logs are stored in `./logs/`.
- Daily access log: `logs/access.log`
- System errors: `logs/error.log`

### SSL Certificate Auto-Renewal
Let's Encrypt certificates renew automatically. Test renewal with:
```bash
sudo certbot renew --dry-run
```
