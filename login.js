document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Email and password are required.");
            return;
        }

        try {
            const response = await fetch("login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || "Login failed");
                return;
            }

            // Success
            window.location.href = "index.html";

        } catch (error) {
            alert("Network error. Please try again.");
            console.error(error);
        }
    });
});
