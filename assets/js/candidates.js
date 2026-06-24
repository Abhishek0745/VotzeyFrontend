// ✅ MODIFIED FILE: Now sends JWT token in headers, uses CandidateRequestDTO
document.addEventListener('DOMContentLoaded', () => {
  loadCandidates();
  showAdminControls();
});

// Show add/edit/delete controls only for ADMIN
function showAdminControls() {
  const user = getUser();
  const adminSection = document.getElementById('adminSection');
  if (adminSection) {
    adminSection.style.display = (user && user.role === 'ADMIN') ? 'block' : 'none';
  }
}

// Load all candidates
function loadCandidates() {
  const container = document.getElementById('candidatesContainer');
 container.innerHTML = `
<div class="col-12 text-center py-5">
    <div style="color:var(--text-muted)">Loading Candidates...</div>
</div>
`;
  fetch(`${API}/api/candidate`)
    .then(res => res.json())
    .then(data => {
      const user = getUser();
      const isAdmin = user && user.role === 'ADMIN';

      if (data.length === 0) {
       container.innerHTML = `
      <div class="col-12">
      <div class="glass p-5 text-center">
        <i class="bi bi-person-slash" style="font-size:2rem"></i>
        <p class="mt-3">No candidates registered yet</p>
      </div>
      </div>`;
return;
      }

      const totalVotes = data.reduce((sum, c) => sum + c.voteCount, 0);
              document.getElementById('candidateCount').textContent = data.length;
                document.getElementById('voteCount').textContent = totalVotes;
             document.getElementById('leadingParty').textContent = data.reduce((top, c) => c.voteCount > top.voteCount ? c : top, data[0]).party;

      container.innerHTML = data.map(c => {
        const pct = totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : 0;
        const avatarBg = stringToColor(c.name);
        const initials = c.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
       return `
<div class="col-lg-4 col-md-6">

    <div class="glass p-4 h-100 candidate-card">

        <div class="d-flex align-items-center gap-3 mb-3">

            <div style="
                width:55px;
                height:55px;
                border-radius:14px;
                background:${avatarBg};
                display:flex;
                align-items:center;
                justify-content:center;
                color:#fff;
                font-weight:700;
            ">
                ${initials}
            </div>

            <div>
                <h5 class="mb-1">${c.name}</h5>

                <span class="badge bg-primary">
                    ${c.party}
                </span>
            </div>

        </div>

        <div class="mb-3">

            <div class="d-flex justify-content-between mb-2">

                <span>${c.voteCount} Votes</span>

                <strong>${pct}%</strong>

            </div>

            <div class="vote-bar">
                <div
                    class="vote-bar-fill"
                    style="width:${pct}%">
                </div>
            </div>

        </div>

        <div class="d-flex justify-content-between align-items-center">

            <small style="color:var(--text-secondary)">
                Candidate #${c.id}
            </small>

            ${
              isAdmin
              ? `
                <div class="d-flex gap-2">

                    <button
                        class="btn-edit-sm"
                        onclick="editCandidate(${c.id}, '${c.name}', '${c.party}')">

                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        class="btn-danger-sm"
                        onclick="deleteCandidate(${c.id}, '${c.name}')">

                        <i class="bi bi-trash"></i>
                    </button>

                </div>
              `
              : ''
            }

        </div>

    </div>

</div>
`;
      }).join('');
    })
    .catch(() => {
      container.innerHTML = `
    <div class="col-12 text-center py-5" style="color:#ef4444">
    Failed to load candidates
    </div>`;
    });
}

// Add candidate
document.getElementById('candidateForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Adding...';

  fetch(`${API}/api/candidate/add`, {
    method: 'POST',
    headers: authHeaders(), // ✅ JWT token sent here
    body: JSON.stringify({
      name: document.getElementById('candidateName').value.trim(),
      party: document.getElementById('party').value.trim()
    })
  })
  .then(res => {
    if (!res.ok) return res.json().then(e => { throw new Error(e.message || 'Failed'); });
    return res.json();
  })
  .then(() => {
    showToast('Candidate added successfully!', 'success');
    this.reset();
    loadCandidates();
  })
  .catch(err => showToast(err.message, 'error'))
  .finally(() => { btn.disabled = false; btn.textContent = 'Add Candidate'; });
});

// Edit candidate
function editCandidate(id, currentName, currentParty) {
  Swal.fire({
    title: 'Edit Candidate',
    background: '#111827',
    color: '#f1f5f9',
    html: `
      <input type="text" id="newName" class="swal2-input" value="${currentName}" placeholder="Candidate name" style="background:#1a2236;color:#f1f5f9;border:1px solid rgba(255,255,255,0.1)">
      <input type="text" id="newParty" class="swal2-input" value="${currentParty}" placeholder="Party name" style="background:#1a2236;color:#f1f5f9;border:1px solid rgba(255,255,255,0.1)">
    `,
    showCancelButton: true,
    confirmButtonText: 'Update',
    confirmButtonColor: '#6366f1',
    preConfirm: () => {
      const name = document.getElementById('newName').value.trim();
      const party = document.getElementById('newParty').value.trim();
      if (!name || !party) { Swal.showValidationMessage('Both fields are required'); return false; }
      return { name, party };
    }
  }).then(result => {
    if (!result.isConfirmed) return;
    fetch(`${API}/api/candidate/update/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(result.value)
    })
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(() => { showToast('Candidate updated!', 'success'); loadCandidates(); })
    .catch(() => showToast('Failed to update candidate', 'error'));
  });
}

// Delete candidate
function deleteCandidate(id, name) {
  Swal.fire({
    title: `Delete ${name}?`,
    text: 'This action cannot be undone.',
    icon: 'warning',
    background: '#111827',
    color: '#f1f5f9',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Delete'
  }).then(result => {
    if (!result.isConfirmed) return;
    fetch(`${API}/api/candidate/delete/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    .then(res => { if (!res.ok) throw new Error(); })
    .then(() => { showToast('Candidate deleted', 'success'); loadCandidates(); })
    .catch(() => showToast('Failed to delete candidate', 'error'));
  });
}

// Generate consistent color from name string
function stringToColor(str) {
  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}