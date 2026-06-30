document.addEventListener('DOMContentLoaded', () => {
  loadCandidates();
  loadVotingStats();
  loadVotes();

  const voteForm = document.getElementById('voteForm');
  if (voteForm) {
    voteForm.addEventListener('submit', castVote);
  }
});

// Load Candidates Dropdown
function loadCandidates() {

  const select = document.getElementById('candidateSelect');
  if (!select) return;

  select.innerHTML =
    `<option value="">Loading Candidates...</option>`;

  fetch(`${API}/api/candidate`)
    .then(res => res.json())
    .then(candidates => {

      if (!candidates.length) {
        select.innerHTML =
          `<option value="">No Candidates Found</option>`;
        return;
      }

      select.innerHTML =
        `<option value="">Select Candidate</option>`;

      candidates.forEach(candidate => {

        select.innerHTML += `
          <option value="${candidate.id}">
            ${candidate.name} (${candidate.party})
          </option>
        `;

      });

    })
    .catch(() => {

      select.innerHTML =
        `<option value="">Failed To Load Candidates</option>`;

      showToast('Failed to load candidates', 'error');

    });
}

// Cast Vote
function castVote(e) {

  e.preventDefault();

  const candidateId =
    document.getElementById('candidateSelect').value;

  if (!candidateId) {
    showToast('Please select a candidate', 'error');
    return;
  }

  const btn =
    document.querySelector('#voteForm button[type="submit"]');

  btn.disabled = true;
  btn.innerHTML = 'Casting Vote...';

  fetch(`${API}/api/votes/cast`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      candidateId: parseInt(candidateId)
    })
  })
    .then(async res => {

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Vote failed'
        );
      }

      return data;
    })
    .then(() => {

      showToast(
        'Vote Cast Successfully!',
        'success'
      );

      document.getElementById('voteForm').reset();

      loadCandidates();
      loadVotes();
      loadVotingStats();

    })
    .catch(err => {

      showToast(
        err.message || 'Vote Failed',
        'error'
      );

    })
    .finally(() => {

      btn.disabled = false;
      btn.innerHTML =
        '<i class="bi bi-box-arrow-in-right"></i> Cast Vote';

    });
}

// Stats
function loadVotingStats() {
  // Fetch candidates
  fetch(`${API}/api/candidate`)
    .then(res => res.json())
    .then(candidates => {
      const totalCandidates = candidates.length;
      const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

      const totalCandidatesEl = document.getElementById('totalCandidates');
      const totalVotesEl = document.getElementById('totalVotes');

      if (totalCandidatesEl) totalCandidatesEl.textContent = totalCandidates;
      if (totalVotesEl) totalVotesEl.textContent = totalVotes;
    })
    .catch(() => {});

  // ✅ FIX — separate fetch, totalVotersEl declared INSIDE this block
 fetch(`${API}/api/voters/count`, {
    headers: authHeaders()
})
.then(res => res.json())
.then(data => {
    const totalVotersEl = document.getElementById("totalVoters");
    if (totalVotersEl) {
        totalVotersEl.textContent = data.total;
    }
})
.catch(() => {});
}
// Load Vote Records (Admin Only)
function loadVotes() {

  const user = getUser();

  const table =
    document.getElementById('votesTable');

  if (!table) return;

  if (!user || user.role !== 'ADMIN') {

    table.innerHTML = `
      <tr>
        <td colspan="2"
            class="text-center">
          Vote records visible only to Admin
        </td>
      </tr>
    `;

    return;
  }

  fetch(`${API}/api/votes`, {
    headers: authHeaders()
  })
    .then(res => res.json())
    .then(votes => {

      if (!votes.length) {

        table.innerHTML = `
          <tr>
            <td colspan="2"
                class="text-center">
              No votes cast yet
            </td>
          </tr>
        `;

        return;
      }

      table.innerHTML = votes.map(vote => `
        <tr>
          <td>${vote.voterId}</td>
          <td>${vote.candidateId}</td>
        </tr>
      `).join('');

    })
    .catch(() => {

      table.innerHTML = `
        <tr>
          <td colspan="2"
              class="text-center text-danger">
            Failed to load votes
          </td>
        </tr>
      `;

    });
}