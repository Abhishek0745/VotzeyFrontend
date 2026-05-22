document.addEventListener("DOMContentLoaded", () => {
  loadCandidates();
});

// Load all candidates
function loadCandidates() {
  fetch("http://localhost:9091/api/candidate")
    .then((res) => res.json())
    .then((data) => {
      let candidatesContainer = document.getElementById("candidatesContainer");
      candidatesContainer.innerHTML = "";
      data.forEach((candidate) => {
        candidatesContainer.innerHTML += `
                    <tr>
                        <td>${candidate.id}</td>
                        <td>${candidate.name}</td>
                        <td>${candidate.party}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editCandidate(${candidate.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCandidate(${candidate.id})">Delete</button>
                        </td>
                    </tr>
                `;
      });
    })
    .catch(() => showToast("Error loading candidates.", "error"));
}

// Add candidate
document
  .getElementById("candidateForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();
    const candidateData = {
      name: document.getElementById("candidateName").value,
      party: document.getElementById("party").value,
    };

    fetch("http://localhost:9091/api/candidate/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidateData),
    })
      .then(() => {
        showToast("Candidate added successfully!", "success");
        document.getElementById("candidateForm").reset();
        loadCandidates();
      })
      .catch(() => showToast("Failed to add candidate.", "error"));
  });

// Search candidate by ID
function searchCandidate() {
  let candidateId = prompt("Enter Candidate ID:");
  if (!candidateId) return;

  fetch(`http://localhost:9091/api/candidate/${candidateId}`)
    .then((res) => res.json())
    .then((candidate) => {
      Swal.fire({
        title: "Candidate Details",
        html: `<strong>ID:</strong> ${candidate.id} <br>
                       <strong>Name:</strong> ${candidate.name} <br>
                       <strong>Party:</strong> ${candidate.party}`,
        icon: "info",
      });
    })
    .catch(() => showToast("Candidate not found.", "error"));
}

// Update candidate details
// function updateCandidate(id) {
// 	let newName = prompt("Enter new candidate name:");
// 	let newParty = prompt("Enter new party name:");

// 	if (!newName || !newParty) return;

// 	fetch(`http://localhost:8080/api/candidates/${id}`, {
// 		method: "PUT",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ name: newName, party: newParty }),
// 	})
// 		.then(() => {
// 			showToast("Candidate updated successfully!", "success");
// 			loadCandidates();
// 		})
// 		.catch(() => showToast("Failed to update candidate.", "error"));
// }
function editCandidate(candidateId) {
  Swal.fire({
    title: "Edit Candidate Details",
    html: `<input type="text" id="newName" class="swal2-input" placeholder="Enter new name">
             <input type="text" id="newParty" class="swal2-input" placeholder="Enter new party">`,
    showCancelButton: true,
    confirmButtonText: "Update",
    preConfirm: () => {
      let newName = document.getElementById("newName").value;
      let newParty = document.getElementById("newParty").value;

      if (!newName || !newParty) {
        Swal.showValidationMessage("Both fields are required!");
        return false;
      }

      return { newName, newParty };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      updateCandidate(candidateId, result.value.newName, result.value.newParty);
    }
  });
}

// Function to send updated candidate details to backend
function updateCandidate(candidateId, newName, newParty) {
  fetch(`http://localhost:9091/api/candidate/update/${candidateId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, party: newParty }),
  })
    .then(() => {
      showToast("Candidate updated successfully!", "success");
      loadCandidates();
    })
    .catch(() => showToast("Failed to update candidate.", "error"));
}
// Delete candidate
function deleteCandidate(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This candidate will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d9534f",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:9091/api/candidate/delete/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          showToast("Candidate deleted!", "success");
          loadCandidates();
        })
        .catch(() => showToast("Failed to delete candidate.", "error"));
    }
  });
}

// Show toast notification
function showToast(message, type = "info") {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}
