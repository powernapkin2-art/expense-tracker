# Expense Tracker

A simple expense tracker with a weekly allowance countdown. Node.js + Express (server-side rendered for the admin UI).

## Features

- Add expenses (amount, category, type: one-time / subscription / recurring)
- Weekly allowance countdown (weeks left based on remaining budget)
- Progress bar showing % of weekly allowance used
- Lightweight: built on Node's built-in `http` module, no framework needed at runtime

## Local Development

```bash
npm install
npm start          # runs on http://localhost:3000
```

## Deployment

### Render (free tier)

1. Push this repo to GitHub.
2. On [ Render Dashboard → New → Web Service ].
3. Connect your repo (`powernapkin2-art/expense-tracker`).
4. Set:
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Region**: Oregon (or closest)
   - **Branch**: `master`
5. Deploy.

### Docker

```bash
docker build -t expense-tracker .
docker run -d -p 3000:3000 --name expense-tracker expense-tracker
```

### Railway

1. Install the Railway CLI: `npm i -g @railway/cli`
2. `railway init` (in this project directory)
3. `railway up`

### GitHub Pages / Static Hosting

This app requires a server for the `/api/*` endpoints; it cannot be served purely from static hosting.
Either keep the Node server running alongside a static host, or use a PaaS that runs Node.

## API

- `GET /api/balance` → `{ spent, remaining, weeksLeft, spentPercent, expenses, weeklyAllowance, totalBudget }`
- `POST /api/expenses` → body `{ amount, category, type }` → returns updated stats

## Data

- `data.json` holds the persisted data (created automatically on first run).
- Override `PORT` env var to change the listen port.
