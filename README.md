# Trader Command Center 🚀

A production-ready personal trading dashboard for MEXC Futures. Real-time positions, trading journal with screenshots, and performance analytics — all behind secure single-user authentication.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)

## Features

- **📊 Live Dashboard** — Real-time account balance, positions, orders, and PnL from MEXC Futures
- **📝 Trading Journal** — Log trades with screenshots, reasoning, mistakes, and discipline rating
- **📈 Analytics** — Win rate trends, weekly PnL charts, GitHub-style PnL heatmap, setup performance
- **🌙 Dark/Light Mode** — Premium glassmorphism dark theme with smooth animated toggle
- **🔒 Secure** — Single-user auth, API key isolation, rate limiting

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Auth | NextAuth.js v5 (Credentials) |
| Database | Supabase (Postgres) |
| Image Storage | Supabase Storage |
| Live Data | Python FastAPI WebSocket Bridge → MEXC WebSocket |
| Deployment | Vercel (frontend) + Railway/Render (Python service) |

---

## 🔧 Setup Guide

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A [MEXC](https://www.mexc.com) account with Futures enabled
- A [Supabase](https://supabase.com) project (free tier works)

---

### Step 1: Create MEXC API Key (⚠️ Read Carefully)

1. Log in to MEXC → Go to **API Management** (https://www.mexc.com/ucenter/open-api)
2. Click **Create API Key**
3. Set permissions:
   - ✅ **Read** — Required
   - ✅ **Trade** — Required for order cancellation
   - ❌ **Withdrawal** — **NEVER enable this. Leave it unchecked.**
4. Set **IP Restriction**: Add your server's static IP (your home IP for dev, Vercel/Railway IPs for production)
5. Save the **API Key** and **Secret Key** — you'll need them below

> ⚠️ **SECURITY**: Never share your API key/secret. Never commit them to git. Never enable withdrawal permissions.

---

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → Run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Storage** → Create a new bucket called `trade-screenshots`
   - Set it to **Public**
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

---

### Step 3: Set Environment Variables

Copy the template:
```bash
cp .env.local.example .env.local
```

Fill in all values:
```env
# Auth
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# MEXC
MEXC_API_KEY=your_mexc_api_key
MEXC_API_SECRET=your_mexc_api_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WebSocket Bridge
NEXT_PUBLIC_WS_BRIDGE_URL=ws://localhost:8765
```

---

### Step 4: Run Locally

**Frontend (Next.js):**
```bash
npm install
npm run dev
```
Open http://localhost:3000 → Log in with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`

**Python WebSocket Bridge:**
```bash
cd python-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Copy and fill env vars
cp .env.example .env

python main.py
```
The bridge runs on port 8765.

---

## 🚀 Deployment

### Frontend → Vercel

1. Push your code to GitHub (ensure `.env*` is in `.gitignore`)
2. Import the repo in [Vercel](https://vercel.com)
3. Set **Root Directory** to `trader-command-center` (if not at repo root)
4. Add all environment variables from `.env.local` in Vercel's dashboard
5. Update `NEXTAUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)
6. Update `NEXT_PUBLIC_WS_BRIDGE_URL` to your deployed Python service URL
7. Deploy!

### Python Service → Railway

1. In [Railway](https://railway.app), create a new project
2. Connect your GitHub repo or deploy the `python-service/` directory
3. Set the **Root Directory** to `python-service`
4. Add environment variables:
   - `MEXC_API_KEY`
   - `MEXC_API_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `FRONTEND_URL` = your Vercel URL
   - `PORT` = 8765
5. Railway auto-detects the Dockerfile

### Python Service → Render

1. In [Render](https://render.com), create a new **Web Service**
2. Connect your repo, set Root Directory to `python-service`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add the same environment variables as Railway

---

## 📁 Project Structure

```
trader-command-center/
├── app/                    # Next.js pages (App Router)
│   ├── dashboard/          # Live trading dashboard
│   ├── journal/            # Trading journal
│   ├── analytics/          # Performance analytics
│   ├── login/              # Login page
│   └── api/                # API routes (MEXC proxy, journal CRUD, etc.)
├── components/             # Reusable React components
│   ├── layout/             # Sidebar, ThemeToggle, AppShell
│   ├── dashboard/          # Balance cards, positions table, charts
│   ├── journal/            # Form, card list, screenshot uploader
│   ├── analytics/          # PnL charts, heatmap, stats cards
│   └── ui/                 # AnimatedCounter, Modal, Skeleton, etc.
├── lib/                    # Shared utilities
│   ├── auth.ts             # NextAuth configuration
│   ├── mexc-client.ts      # MEXC REST API client
│   ├── supabase-*.ts       # Supabase clients
│   ├── rate-limiter.ts     # API rate limiting
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Formatting & helper functions
├── python-service/         # FastAPI WebSocket bridge
│   ├── main.py             # Server entry point
│   ├── mexc_ws.py          # MEXC WebSocket client
│   ├── Dockerfile          # Container config
│   └── requirements.txt    # Python dependencies
├── supabase/
│   └── migrations/         # Database schema SQL
└── middleware.ts            # Auth protection for all routes
```

---

## 🔐 Security Checklist

- [ ] MEXC API key has **only Read + Trade** permissions (NO withdrawal)
- [ ] MEXC API key is **IP-restricted** to your server's IP
- [ ] `.env*` files are in `.gitignore` and never committed
- [ ] `ADMIN_PASSWORD` is strong and unique
- [ ] `NEXTAUTH_SECRET` is randomly generated
- [ ] All API routes check authentication via `auth()`
- [ ] Rate limiting is enabled on all MEXC proxy routes
- [ ] Supabase service role key is only used server-side

---

## Environment Variables Reference

| Variable | Service | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | Vercel | Random secret for JWT signing |
| `NEXTAUTH_URL` | Vercel | Full URL of your app |
| `ADMIN_USERNAME` | Vercel | Login username |
| `ADMIN_PASSWORD` | Vercel | Login password |
| `MEXC_API_KEY` | Vercel + Railway | MEXC API key |
| `MEXC_API_SECRET` | Vercel + Railway | MEXC API secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + Railway | Supabase service key |
| `NEXT_PUBLIC_WS_BRIDGE_URL` | Vercel | Python WebSocket bridge URL |
| `FRONTEND_URL` | Railway | Your Vercel URL (for CORS) |

---

## License

Private — personal use only.
