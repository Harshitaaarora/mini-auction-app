# Mini Auction App (BVCOE Assignment)

Full-stack mini real-time auction platform.

## Tech
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.IO
- **DB**: PostgreSQL (Supabase-compatible) via Sequelize
- **Redis**: Upstash (with dev fallback to in-memory)
- **Email**: SendGrid (with dev fallback to console)
- **PDF**: PDFKit
- **Scheduler**: node-cron
- **Deploy**: Single Dockerfile (Render.com friendly)

## Quick Start (Local)

### 1) Backend env
Copy `server/.env.example` to `server/.env` and fill values:
```
PORT=8080
JWT_SECRET=dev-secret

# PostgreSQL / Supabase URL (example local)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/auctiondb

# Upstash (optional for local dev)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# SendGrid (optional for local dev)
SENDGRID_API_KEY=
MAIL_FROM=no-reply@example.com
```

> Dev fallbacks: if Upstash or SendGrid vars are empty, the app will use
> in-memory store (for highest bid) and console logs for emails.

### 2) Install & run
```bash
# In one terminal (backend)
cd server
npm i
npm run migrate
npm run dev

# In another terminal (frontend)
cd client
npm i
npm run dev
```
- Backend dev: http://localhost:8080
- Frontend dev: http://localhost:5173

### 3) Build frontend & serve from backend
```bash
cd client && npm run build
# Copy build into server/public or rely on Docker build (does this automatically)
```

## Docker (single container)
```bash
# From project root
docker build -t mini-auction-app .
docker run -p 8080:8080 --env-file server/.env mini-auction-app
# Open http://localhost:8080
```

## Default Flow
1. Register/Login (no email verification for demo).
2. Create Auction (seller).
3. Open auction page to join the live room. Place bids while live.
4. After auction ends (auto), seller can Accept/Reject/Counter.
5. On Accept, confirmation emails + invoice (dev: logged to console).

## Notes
- Cold-start warming can be done via cron-job.org pinging `/health`.
- Replace env values with Supabase & Upstash & SendGrid for production.


## Push to GitHub (copy/paste)

```bash
# unzip and cd into project folder (adjust path if needed)
unzip mini-auction-app.zip
cd mini-auction-app

# create a new repo on GitHub first (empty), then:
git init
git add .
git commit -m "Initial commit: Mini Auction App"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

> After pushing, enable GitHub Actions if you add a workflow later. For now, the app is ready to deploy locally or via Docker.
