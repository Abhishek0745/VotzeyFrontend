document
	.getElementById("searchResultForm")
	.addEventListener("submit", function (event) {
		event.preventDefault();

		const electionName = document.getElementById("electionName").value;
		const requestData = { electionName: electionName };
		fetch(`http://localhost:9091/api/election-result/declare`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestData),
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);

				let resultHTML = `
                <div class="card text-center shadow-lg p-4" style="width: 400px;">
                    <h4 class="text-danger">${data.electionName}</h4>
                    <p><strong>Total Votes:</strong> ${data.totalVotes}</p>
                    <p><strong>WinnerId:</strong> ${data.winnerId}</p>
					<p><strong>Votes Obtained:</strong> ${data.winnerVotes}</p>
                </div>
            `;
				document.getElementById("resultsContainer").innerHTML = resultHTML;
			})
			.catch((error) => {
				console.log(error);

				showAlert("Error", "Election result not found.", "error");
			});
	});
