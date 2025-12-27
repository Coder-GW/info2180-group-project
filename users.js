document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    loadUsers();
    setupAddUserButton();
    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

async function checkSession() {
    try {
        const response = await fetch("dashboard.php");
        const data = await response.json();
        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }
        const userName = document.getElementById("userName");
        if (userName) {
            userName.textContent = `${data.firstname} ${data.lastname}`;
        }
    } catch (error) {
        window.location.href = "login.html";
    }
}

function setupAddUserButton() {
    const addUserBtn = document.querySelector(".add-user-button");
    if (addUserBtn) {
        addUserBtn.addEventListener("click", () => {
            window.location.href = "add_user.html";
        });
    }
}

async function loadUsers() {
    const tbody = document.getElementById("usersList");
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Loading users...</td></tr>';
        
        const response = await fetch("users.php");
        const users = await response.json();
        
        if (!response.ok) {
            alert("Failed to load users");
            return;
        }
        
        tbody.innerHTML = "";
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">No users found</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement("tr");
            
            const date = new Date(user.created_at);
            const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
            
            row.innerHTML = `
                <td>${user.firstname} ${user.lastname}</td>
                <td>${user.email}</td>
                <td><span class="user-role ${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${formattedDate}</td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #e74c3c;">Error loading users. Please try again.</td></tr>';
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