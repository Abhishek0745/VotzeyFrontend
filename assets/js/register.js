document.getElementById("registerForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        try {

            const response = await fetch(
                `${API}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            if (!response.ok) {

                const error = await response.json();

                throw new Error(
                    error.message || "Registration Failed"
                );
            }

            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "Please Login",
                confirmButtonText: "Go To Login"
            }).then(() => {
                window.location.href = "login.html";
            });

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: error.message
            });

        }
    });