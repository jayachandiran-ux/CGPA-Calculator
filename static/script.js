let subjectCount = 0;
const grades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];

/* ── Theme ── */
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  const btn = document.getElementById('themeToggle');
  btn.innerHTML = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function toggleTheme() {
  const isDark = !document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme(isDark);
}

// Restore saved theme on load
(function () {
  const saved = localStorage.getItem('theme');
  applyTheme(saved === 'dark');
})();

/* ── Subject rows ── */
function addSubject() {
  subjectCount++;
  const container = document.getElementById('subjects');

  const row = document.createElement('div');
  row.className = 'subject-row';
  row.id = 'row-' + subjectCount;

  row.innerHTML = `
    <label>Subject ${subjectCount}</label>
    <select>
      <option value="">-- Grade --</option>
      ${grades.map(g => `<option value="${g}">${g}</option>`).join('')}
    </select>
    <input type="number" placeholder="Credits" min="1" max="10" />
    <button class="remove-btn" onclick="removeSubject('row-${subjectCount}')" title="Remove">✕</button>
  `;

  container.appendChild(row);
}

function removeSubject(id) {
  const row = document.getElementById(id);
  if (row) row.remove();
}

/* ── Calculate (calls Flask backend) ── */
async function calculate() {
  const rows     = document.querySelectorAll('.subject-row');
  const resultEl = document.getElementById('result');

  if (rows.length === 0) {
    showError('Please add at least one subject.');
    return;
  }

  // Collect grade + credit from each row
  const subjects = Array.from(rows).map(row => ({
    grade:  row.querySelector('select').value,
    credit: row.querySelector('input').value
  }));

  try {
    const res  = await fetch('/calculate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subjects })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
      return;
    }

    resultEl.className = 'result success';
    resultEl.innerHTML = `
      <div>Your CGPA</div>
      <div class="big">${data.cgpa.toFixed(2)}</div>
      <div style="margin-top:8px;font-size:1rem">
        Percentage: <strong>${data.percentage.toFixed(2)}%</strong>
      </div>
      <div class="meta">Total Credits: ${data.credits} &nbsp;|&nbsp; ${data.message}</div>
    `;

  } catch (err) {
    showError('Could not connect to server. Make sure Flask is running.');
  }
}

function showError(msg) {
  const resultEl = document.getElementById('result');
  resultEl.className = 'result error';
  resultEl.innerHTML = `⚠️ ${msg}`;
}

/* ── Reset ── */
function resetAll() {
  document.getElementById('subjects').innerHTML = '';
  const resultEl = document.getElementById('result');
  resultEl.className = 'result';
  resultEl.innerHTML = '';
  subjectCount = 0;
}

// Default 3 rows on page load
addSubject();
addSubject();
addSubject();
