document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    setupNewUserForm();
    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

async function checkSession() {
    try {
        const response = await fetch("dashboard.php");
        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }
        const data = await response.json();
        const userName = document.getElementById("userName");
        if (userName) {
            userName.textContent = `${data.firstname} ${data.lastname}`;
        }
        if (data.role !== 'admin') {
            document.querySelectorAll('.menu-item a[href="users.html"]').forEach(a => {
                const item = a.closest('.menu-item');
                if (item) item.style.display = 'none';
            });
        }
    } catch (error) {
        window.location.href = "login.html";
    }
}

function setupNewUserForm() {
    const form = document.querySelector("form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await submitNewUser(form);
    });
    
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener("input", validatePassword);
    }
}

function validatePassword() {
    const password = this.value;
    
    let indicator = document.getElementById("password-strength");
    if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "password-strength";
        indicator.style.cssText = "margin-top: 5px; font-size: 12px; padding: 5px; border-radius: 4px;";
        this.parentNode.insertBefore(indicator, this.nextSibling);
    }
    
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    let strength = 0;
    if (hasLength) strength++;
    if (hasUpper) strength++;
    if (hasLower) strength++;
    if (hasNumber) strength++;
    
    let message = "";
    let bgColor = "";
    
    if (strength <= 1) {
        message = "Very Weak";
        bgColor = "#fee";
        indicator.style.color = "#c00";
    } else if (strength === 2) {
        message = "Weak";
        bgColor = "#fec";
        indicator.style.color = "#840";
    } else if (strength === 3) {
        message = "Medium";
        bgColor = "#ffc";
        indicator.style.color = "#660";
    } else {
        message = "Strong";
        bgColor = "#efe";
        indicator.style.color = "#060";
    }
    
    const missing = [];
    if (!hasLength) missing.push("8 characters");
    if (!hasUpper) missing.push("uppercase");
    if (!hasLower) missing.push("lowercase");
    if (!hasNumber) missing.push("number");
    
    if (missing.length > 0) {
        message += " (Need: " + missing.join(", ") + ")";
    }
    
    indicator.textContent = message;
    indicator.style.backgroundColor = bgColor;
}

async function submitNewUser(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        const firstname = document.getElementById("first-name").value.trim();
        const lastname = document.getElementById("last-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;
        
        if (!firstname || !lastname || !email || !password) {
            alert("Please fill in all fields");
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }
        
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
            alert("Password must be at least 8 characters with uppercase, lowercase, and number");
            return;
        }
        
        submitBtn.textContent = "Saving...";
        submitBtn.disabled = true;
        
        const response = await fetch("add_user.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password,
                role: role
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert(result.error || "Failed to create user");
            return;
        }
        
        alert("User created successfully!");
        window.location.href = "users.html";
        
    } catch (error) {
        console.error(error);
        alert("Network error. Please try again.");
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function logout() {
    try {
        await fetch("logout.php", { method: "POST" });
        window.location.href = "login.html";
    } catch (error) {
        alert("Logout failed");
    }
}