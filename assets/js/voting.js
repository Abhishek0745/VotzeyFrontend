document.addEventListener("DOMContentLoaded", () => {
	loadCandidates();
	loadVotes();
});

// Load candidates for voting
function loadCandidates() {
	fetch("http://localhost:9091/api/candidate")
		.then((res) => res.json())
		.then((data) => {
			let candidateSelect = document.getElementById("candidateSelect");
			candidateSelect.innerHTML =
				'<option value="">Select a Candidate</option>';
			data.forEach((candidate) => {
				let option = document.createElement("option");
				option.value = candidate.id;
				option.textContent = `${candidate.name} (${candidate.party})`;
		   		candidateSelect.appendChild(option);
			});
		})
		.catch(() => showAlert("Error", "Failed to load candidates.", "error"));
}

// Load votes
function loadVotes() {
	fetch("http://localhost:9091/api/votes")
		.then((res) => res.json())
		.then((data) => {
			let votesTable = document.getElementById("votesTable");
			votesTable.innerHTML = "";
			data.forEach((vote) => {
				votesTable.innerHTML += `<tr>
                    <td>${vote.voterId}</td>
                    <td>${vote.candidateId}</td>
                </tr>`;
			});
		})
		.catch(() => showAlert("Error", "Failed to load votes.", "error"));
}

// Cast vote
document
	.getElementById("voteForm")
	?.addEventListener("submit", function (event) {
		event.preventDefault();

		const voteData = {
			voterId: document.getElementById("voterId").value,
			candidateId: document.getElementById("candidateSelect").value,
		};

		if (!voteData.voterId || !voteData.candidateId) {
			showAlert(
				"Warning",
				"Please enter your Voter ID and select a candidate.",
				"warning"
			);
			return;
		}

		fetch("http://localhost:9091/api/votes/cast", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(voteData),
		})
			.then((response) => {
				if (!response.ok) {
					return response.json().then((err) => {
						throw new Error(err.messageString || "Something went wrong!"); // Extract message properly
					});
				} else {
					return response.json();
				}
			})
			.then((obj) => {
				showAlert("Success", obj.message, "success");
				document.getElementById("voteForm").reset();
				loadVotes();
			})
			.catch((error) => {
				showAlert("Error", error.message, "error");
			});
	});
