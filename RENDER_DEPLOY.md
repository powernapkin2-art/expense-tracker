# Deploy Expense Tracker to Render.com

Follow these steps to get your expense tracker live on Render (free tier).

## What's already done

- Repo pushed to GitHub → https://github.com/powernapkin2-art/expense-tracker.git
- Deployment files committed:
  - `Procfile` → `web: node server.js`
  - `Dockerfile` → container image (node:20-alpine)
  - `README.md` → full instructions
  - `.gitignore` → hides `node_modules/`, `data.json`, `.env`

---

## Step-by-step setup

### 1. Open Render Dashboard

Go to https://dashboard.render.com/

### 2. Create a new Web Service

1. Click **New +** → **Web Service**
2. Under **Connect Repository**, select **GitHub**
3. Authorize Render to access your GitHub account if prompted
4. Find and select the repo **`powernapkin2-art/expense-tracker`**

**Key settings** (Render auto-detects from `package.json` and `Procfile`, but verify):

| Setting | Value |
|---|---|
| **Build Command** | `npm ci` |
| **Start Command** | `node server.js` |
| **Region** | Oregon (or closest to your users) |
| **Branch** | `master` |
| **Auto-deploy** | ✅ Enabled (optional) |

> Note: Render's free tier spins the service down after 15 min of inactivity. The first request after that may take ~30 seconds to wake up. For a production app, consider the Starter plan (~$7/month).

### 3. Deploy

1. Scroll down and click **Deploy**
2. Wait for the build to finish (npm install + deploy)
3. When done, you'll get a live URL like:
   ```
   https://expense-tracker-xxxx.onrender.com
   ```

### 4. Verify it's working

Open the URL. You should see the Expense Tracker UI.

Test the API:
- `GET https://<your-app>.onrender.com/api/balance`
  → returns `{ spent, remaining, weeksLeft, expenses, ... }`
- Add an expense via the web UI or POST to `/api/expenses`

---

## Environment variables (optional)

You can add custom vars under **Settings → Environment** if needed:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Render sets this automatically, usually no need to change |

> ⚠️ **Important:** `data.json` is created inside the container at runtime. Render's free tier uses an **ephemeral filesystem** — files written to the disk are NOT saved across deploys/restarts. Your expenses will be lost if the service is idle and spins down, or if you redeploy.
>
> For persistence, either:
> - Use a paid Render plan with persistent disks, or
> - Hook up an external database (e.g., MongoDB, PostgreSQL via a Render DB, or use a free tier service like Neon/MongoDB Atlas) and store expenses there.

---

## Troubleshooting

**App keeps restarting / stuck on "Initializing"**
- Check the **Logs** tab in Render. Look for the `node server.js` startup line.

**Build fails**
- Ensure `package.json` has valid `dependencies` (express 5.x is already declared).
- Render runs `npm ci` — make sure `package-lock.json` is present (it is).

**Expenses vanish after a deploy or idle**
- This is the ephemeral filesystem behavior. Switch to a persistent storage solution.

**Cannot connect to API from frontend**
- The frontend calls `/api/*` which is relative to the same domain. If you later host the frontend separately (e.g., on Vercel/Netlify), you'll need to proxy the API or use CORS.

---

## Next steps

Once deployed, you can:
- Share the Render URL with anyone
- Set up a custom domain (Render supports this for free on web services)
- Add auto-deploy on push (Render does this automatically when you connect the repo)
- Scale up if you want persistent storage + better uptime
