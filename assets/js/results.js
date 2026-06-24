// ✅ MODIFIED FILE: Full analytics - winner card, progress bars, Chart.js pie chart
document.addEventListener('DOMContentLoaded', () => {
  loadLiveResults();
});

function loadLiveResults() {
  fetch(`${API}/api/candidate`)
    .then(res => res.json())
    .then(data => renderLiveResults(data))
    .catch(() => showToast('Failed to load results', 'error'));
}

function renderLiveResults(candidates) {
  const container = document.getElementById('liveResultsContainer');
  if (!candidates || !candidates.length) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-bar-chart"></i><p>No data available yet</p></div>`;
    return;
  }

  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const total = sorted.reduce((s, c) => s + c.voteCount, 0);

  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];

  container.innerHTML = sorted.map((c, i) => {
    const pct = total > 0 ? ((c.voteCount / total) * 100).toFixed(1) : 0;
    const color = colors[i % colors.length];
    return `
      <div class="result-row">
        <div class="result-row-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:28px;height:28px;border-radius:50%;background:${color}20;color:${color};display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700">${i+1}</div>
            <div>
              <div class="result-candidate-name">${c.name}</div>
              <div style="font-size:0.78rem;color:var(--text-muted)">${c.party}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;font-size:1rem">${c.voteCount}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${pct}%</div>
          </div>
        </div>
        <div class="vote-bar" style="height:6px">
          <div class="vote-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Update pie chart
  renderPieChart(sorted, total, colors);
}

let pieChart = null;
function renderPieChart(candidates, total, colors) {
  const canvas = document.getElementById('resultsChart');
  if (!canvas || !window.Chart) return;

  const labels = candidates.map(c => c.name);
  const values = candidates.map(c => c.voteCount);
  const bgColors = colors.slice(0, candidates.length).map(c => c + 'cc');

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderColor: '#0a0e1a',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${ctx.raw} votes (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// Declare election result (Admin)
document.getElementById('searchResultForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Declaring...';

  const electionName = document.getElementById('electionName').value.trim();

  fetch(`${API}/api/election-result/declare`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ electionName })
  })
  .then(res => {
    if (!res.ok) return res.json().then(e => { throw new Error(e.message || 'Failed to declare'); });
    return res.json();
  })
  .then(data => renderWinnerCard(data))
  .catch(err => showToast(err.message, 'error'))
  .finally(() => { btn.disabled = false; btn.textContent = 'Declare Result'; });
});

function renderWinnerCard(data) {
  const container = document.getElementById('winnerContainer');
  container.innerHTML = `
    <div class="winner-card">
      <div class="winner-trophy">🏆</div>
      <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.5rem">${data.electionName}</div>
      <div class="winner-name">${data.winnerName}</div>
      <div class="winner-party"><i class="bi bi-flag"></i> ${data.winnerParty}</div>
      <div class="winner-stats">
        <div class="winner-stat">
          <div class="winner-stat-num">${data.winnerVotes}</div>
          <div class="winner-stat-label">Votes Won</div>
        </div>
        <div class="winner-stat">
          <div class="winner-stat-num">${data.votePercentage}%</div>
          <div class="winner-stat-label">Vote Share</div>
        </div>
        <div class="winner-stat">
          <div class="winner-stat-num">+${data.winningMargin}</div>
          <div class="winner-stat-label">Margin</div>
        </div>
        <div class="winner-stat">
          <div class="winner-stat-num">${data.totalVotes}</div>
          <div class="winner-stat-label">Total Votes</div>
        </div>
      </div>
    </div>
  `;
}