document.getElementById("loginForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        try {

            const response = await fetch(
                `${API}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            const data = await response.json();

            saveAuth(data);

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                timer: 1500,
                showConfirmButton: false
            });

           setTimeout(() => {

            if (data.role === "ADMIN") {
             window.location.href = "admin.html";
            } else {
            window.location.href = "index.html";
            }

            }, 1500);

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message
            });

        }
    });