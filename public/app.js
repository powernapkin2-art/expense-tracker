let expenses = [];

async function api(url, options) {
  const res = await fetch(url, options);
  return res.json();
}

async function loadExpenses() {
  const data = await api('/api/balance');
  document.getElementById('remaining').textContent = data.remaining.toFixed(2) + ' EUR';
  const weeks = data.weeksLeft.toFixed(1);
  document.getElementById('weeksLeft').textContent = weeks + ' weeks of allowance left';
  document.getElementById('progressPct').textContent = Math.round(data.spentPercent) + '%';
  const bar = document.getElementById('progressBar');
  bar.style.width = Math.min(data.spentPercent, 100) + '%';
  const list = document.getElementById('expenseList');
  expenses = data.expenses;
  if (expenses.length === 0) {
    list.innerHTML = '<li class="empty-msg">No expenses yet. Add your first one!</li>';
    document.getElementById('emptyMsg').style.display = 'block';
    return;
  }
  document.getElementById('emptyMsg').style.display = 'none';
  list.innerHTML = '';
  for (const e of expenses) {
    const li = document.createElement('li');
    li.className = 'expense-item';
    const typeLabel = e.type === 'one-time' ? 'One-time' : e.type === 'subscription' ? 'Subscription' : 'Recurring';
    li.innerHTML = `
      <div class="expense-info">
        <span class="cat">${e.category}</span>
        <span class="expense-type">${typeLabel}</span>
      </div>
      <div class="expense-amount">-${Number(e.amount).toFixed(2)} EUR</div>
    `;
    list.appendChild(li);
  }
}

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const type = document.getElementById('type').value;
  if (isNaN(amount) || amount <= 0) return;
  await api('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, category, type })
  });
  document.getElementById('amount').value = '';
  loadExpenses();
});

loadExpenses();
</script>