document.addEventListener("DOMContentLoaded", () => {
    protectAdminPage();
    loadAdminInfo();
    loadDashboardStats();
});

/* ==========================
   ADMIN PROTECTION
========================== */

function protectAdminPage() {

    const user = getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.role !== "ADMIN") {
        Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "Admin access required"
        }).then(() => {
            window.location.href = "voting.html";
        });

        return;
    }
}

/* ==========================
   ADMIN INFO
========================== */

function loadAdminInfo() {

    const user = getUser();

    if (!user) return;

    const adminName = document.getElementById("adminName");
    const adminRole = document.getElementById("adminRole");

    if (adminName) {
        adminName.textContent = user.name || "Administrator";
    }

    if (adminRole) {
        adminRole.textContent = user.role;
    }
}

/* ==========================
   DASHBOARD STATS
========================== */

async function loadDashboardStats() {

    try {

        const [
            votersRes,
            candidatesRes,
            votesRes,
            resultsRes
        ] = await Promise.all([

            fetch(`${API}/api/voters`, {
                headers: authHeaders()
            }),

            fetch(`${API}/api/candidate`, {
                headers: authHeaders()
            }),

            fetch(`${API}/api/votes`, {
                headers: authHeaders()
            }),

            fetch(`${API}/api/election-result`, {
                headers: authHeaders()
            })
        ]);

        const voters = votersRes.ok
            ? await votersRes.json()
            : [];

        const candidates = candidatesRes.ok
            ? await candidatesRes.json()
            : [];

        const votes = votesRes.ok
            ? await votesRes.json()
            : [];

        const results = resultsRes.ok
            ? await resultsRes.json()
            : [];

        updateDashboardCards(
            voters,
            candidates,
            votes,
            results
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load dashboard",
            "error"
        );
    }
}

/* ==========================
   UPDATE CARDS
========================== */

function updateDashboardCards(
    voters,
    candidates,
    votes,
    results
) {

    const totalVoters =
        document.getElementById("totalVoters");

    const totalCandidates =
        document.getElementById("totalCandidates");

    const totalVotes =
        document.getElementById("totalVotes");

    const totalResults =
        document.getElementById("totalResults");

    if (totalVoters) {
        totalVoters.textContent =
            voters.length;
    }

    if (totalCandidates) {
        totalCandidates.textContent =
            candidates.length;
    }

    if (totalVotes) {
        totalVotes.textContent =
            votes.length;
    }

    if (totalResults) {
        totalResults.textContent =
            results.length;
    }
}

/* ==========================
   LOGOUT
========================== */

function logout() {

    Swal.fire({
        title: "Logout?",
        text: "You will be redirected to login page",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Logout",
        confirmButtonColor: "#ef4444"
    }).then(result => {

        if (!result.isConfirmed)
            return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "login.html";
    });
}