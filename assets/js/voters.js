// ✅ MODIFIED FILE: Voter list now ADMIN only. Registration moved to login.html
document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();

  // ✅ NEW: Stats cards load karo sabke liye (ADMIN aur VOTER dono)
  loadVoterStats();

  if (!user || user.role !== 'ADMIN') {
    document.getElementById('votersSection').innerHTML = `
      <div class="card-glass text-center py-5">
        <i class="bi bi-shield-lock" style="font-size:2rem;color:var(--text-muted)"></i>
        <p style="color:var(--text-muted);margin-top:1rem">Admin access required to view voters</p>
      </div>
    `;
    return;
  }
  loadVoters();
});

// ✅ NEW: Stats cards (TOTAL VOTERS / VOTED / PENDING) ke liye separate function
function loadVoterStats() {
  fetch(`${API}/api/voters/count`, { headers: authHeaders() })
    .then(res => res.json())
    .then(data => {
      document.getElementById('totalVoters').textContent = data.total;
      document.getElementById('votedCount').textContent = data.voted;
      document.getElementById('pendingCount').textContent = data.pending;
    })
    .catch(() => {});
}

function loadVoters() {
  const container = document.getElementById('votersContainer');
  container.innerHTML = `<tr><td colspan="5" class="text-center py-4" style="color:var(--text-muted)">Loading...</td></tr>`;

  fetch(`${API}/api/voters`, { headers: authHeaders() })
    .then(res => {
      if (res.status === 403) throw new Error('Access denied');
      return res.json();
    })
    .then(data => {

      if (data.length === 0) {
        container.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-people"></i><p>No voters registered yet</p></div></td></tr>`;
        return;
      }
      container.innerHTML = data.map(voter => `
        <tr>
          <td style="font-size:0.8rem;color:var(--text-muted)">#${voter.id}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:32px;height:32px;border-radius:50%;background:rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:var(--accent)">
                ${voter.name.charAt(0).toUpperCase()}
              </div>
              <span style="font-weight:500">${voter.name}</span>
            </div>
          </td>
          <td style="color:var(--text-secondary)">${voter.email}</td>
          <td>
            ${voter.hasVoted
              ? '<span class="badge-voted"><i class="bi bi-check-circle-fill me-1"></i>Voted</span>'
              : '<span class="badge-pending">Pending</span>'}
          </td>
          <td>
            <button class="btn-danger-sm" onclick="deleteVoter(${voter.id}, '${voter.name}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    })
    .catch(err => {
      container.innerHTML = `<tr><td colspan="5" class="text-center" style="color:#ef4444">${err.message}</td></tr>`;
    });
}

function deleteVoter(id, name) {
  Swal.fire({
    title: `Delete ${name}?`,
    text: 'This will permanently remove the voter and their vote.',
    icon: 'warning',
    background: '#111827',
    color: '#f1f5f9',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Delete'
  }).then(result => {
    if (!result.isConfirmed) return;
    fetch(`${API}/api/voters/delete/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    .then(res => { if (!res.ok) throw new Error(); })
    .then(() => { showToast('Voter deleted', 'success'); loadVoters(); })
    .catch(() => showToast('Failed to delete voter', 'error'));
  });
}