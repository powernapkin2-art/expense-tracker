const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const FRONTEND_DIR = path.join(__dirname, 'public');

// Default data
function getDefaultData() {
  return { expenses: [], weeklyAllowance: 200, totalBudget: 1000 };
}

// Load or create data file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return data;
    }
  } catch (err) {
    console.log('Using default data (file corrupt or missing)');
  }
  const defaultData = getDefaultData();
  saveData(defaultData);
  return defaultData;
}

// Save data to file
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const data = loadData();

// Compute balance stats
function computeStats() {
  const spent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, data.totalBudget - spent);
  const weeksLeft = Math.floor(remaining / data.weeklyAllowance);
  const spentPercent = data.expenses.length > 0 ? (spent / data.totalBudget) * 100 : 0;
  return { spent, remaining, weeksLeft, spentPercent };
}

const server = http.createServer((req, res) => {
  // API routes
  if (req.url === '/api/balance' && req.method === 'GET') {
    const stats = computeStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...stats, expenses: data.expenses, weeklyAllowance: data.weeklyAllowance, totalBudget: data.totalBudget }));
    return;
  }

  if (req.url === '/api/expenses' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { amount, category, type } = JSON.parse(body);
        if (!amount || isNaN(amount) || amount <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid amount' }));
          return;
        }
        const expense = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          amount: parseFloat(amount),
          category,
          type,
          date: new Date().toISOString()
        };
        data.expenses.push(expense);
        saveData(data);
        const stats = computeStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ...stats, expenses: data.expenses }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Static file serving
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';

  const filePathFull = path.join(FRONTEND_DIR, filePath);

  fs.readFile(filePathFull, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('Expense Tracker running on http://localhost:' + PORT);
});
