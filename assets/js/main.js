document.addEventListener("DOMContentLoaded", () => {
	setupNavbar();
});

// Highlight active navbar link
function setupNavbar() {
	let currentPage = window.location.pathname.split("/").pop();
	let navLinks = document.querySelectorAll(".nav-link");

	navLinks.forEach((link) => {
		if (link.getAttribute("href") === currentPage) {
			link.classList.add("active");
		} else {
			link.classList.remove("active");
		}
	});
}

// Generic API function for GET requests
function fetchData(url, callback) {
	fetch(url)
		.then((res) => res.json())
		.then((data) => callback(data))
		.catch((error) => console.error("Error fetching data:", error));
}
// Function to show a SweetAlert notification
function showAlert(title, message, type = "info") {
	Swal.fire({
		title: title,
		text: message,
		icon: type,
		confirmButtonColor: "#d9534f",
	});
}
