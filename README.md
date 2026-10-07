# Research ERP

A full-stack ERP system for managing research projects, tasks, candidates (workers), GitHub integration, and code execution — built with React/Vite + Node.js/Express + Supabase.

---

## Architecture

```
INTERNET
    │
    ▼
Vercel / Netlify        ← React frontend (static build)
    │ VITE_API_URL
    ▼
Render.com              ← Node.js/Express backend
    │ SUPABASE_SERVICE_ROLE_KEY
    ▼
Supabase Cloud          ← PostgreSQL + Auth + Storage
```

---

## Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/Yokesh5321/Research-ERP.git
cd ERP
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (from Supabase Dashboard → Project Settings → API)
- Set `SUPABASE_URL` (same as VITE_SUPABASE_URL)
- **Set `SUPABASE_SERVICE_ROLE_KEY`** (from Supabase Dashboard → Project Settings → API → **service_role** secret key)
- Leave `VITE_API_URL` empty for local development

### 3. Set Up Database
1. Go to [Supabase Dashboard](https://app.supabase.com) → your project → SQL Editor
2. Click **New Query**
3. Open `supabase/01_clean_database.sql` and paste its entire contents
4. Click **Run**

> ⚠️ This drops and recreates all ERP tables. Only run on a fresh database or when you want a clean reset.

### 4. Run Development Servers
```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend:  http://localhost:5000

---

## Login Credentials (after running SQL script)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@researcherp.org` | `Admin@123456` |
| Admin | `yokeshkumar5321@gmail.com` | `Admin@123456` |
| Worker | `priya.sharma@researcherp.org` | `Worker@123456` |

---

## Production Deployment

### Step 1: Deploy Backend to Render.com

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/backend/server.js`
   - **Environment:** Node
5. Add Environment Variables in Render dashboard:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://nsunkgfvlgxvdjxfioth.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your service_role key>
   FRONTEND_URL=https://your-frontend.vercel.app
   GITHUB_WEBHOOK_SECRET=<your webhook secret>
   ```
6. Deploy → copy the Render URL (e.g. `https://research-erp-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Framework: **Vite**
3. Build Settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://nsunkgfvlgxvdjxfioth.supabase.co
   VITE_SUPABASE_ANON_KEY=<your anon key>
   VITE_API_URL=https://research-erp-backend.onrender.com
   ```
5. Deploy → copy the Vercel URL

### Step 3: Update Backend CORS
Go to Render dashboard → your backend service → Environment → update:
```
FRONTEND_URL=https://your-actual-frontend.vercel.app
```
Restart the service.

### Step 4: Configure GitHub Webhook (for automatic code execution)
1. Go to your GitHub repository → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://your-backend.onrender.com/api/github/webhook`
3. **Content type:** `application/json`
4. **Secret:** same value as `GITHUB_WEBHOOK_SECRET` in your backend env
5. **Events:** Select "Just the push event"

---

## Creating New Users

**Via API** (recommended):
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newworker@example.com","password":"Password@123","name":"New Worker","role":"worker"}'
```

**Via Supabase Dashboard:**  
Authentication → Users → Add User → set email + password  
Then update the profile role in Table Editor → profiles table.

---

## Cross-Device Checklist

- [ ] Website opens from another device via HTTPS URL
- [ ] Frontend does NOT call localhost in production
- [ ] Backend has a public HTTPS URL (Render)
- [ ] CORS allows only your frontend domain
- [ ] Supabase anon key is in frontend; service_role key is ONLY on backend
- [ ] Admin login → role = 'admin' → Admin Dashboard
- [ ] Worker login → role = 'worker' → Candidate Portal
- [ ] Projects persist after refresh
- [ ] Projects visible on another device after login
- [ ] GitHub webhook uses deployed backend URL (not localhost)
