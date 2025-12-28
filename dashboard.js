document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    loadContacts();

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

        // display user info if elements exist
        const userName = document.getElementById("userName");
        if (userName) {
            userName.textContent = `${data.firstname} ${data.lastname}`;
        }

        // hide Users nav for non-admins
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

async function loadContacts(filter = 'All') {
    const tableBody = document.getElementById("contactsList");
    if (!tableBody) return;
    
    try {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading contacts...</td></tr>';
        
        let url = "contacts.php";
        const params = new URLSearchParams();
        
        switch (filter) {
            case 'Sales Leads':
                params.append('type', 'Sales Lead');
                break;
            case 'Support':
                params.append('type', 'Support');
                break;
            case 'Assigned to Me':
                params.append('assigned_to_me', 'true');
                break;
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        const contacts = await response.json();
        
        if (!response.ok) {
            throw new Error("Failed to load contacts");
        }
        
        // clear table
        tableBody.innerHTML = "";
        
        // Check if empty
        if (!contacts || contacts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">No contacts found</td></tr>';
            return;
        }
        
        // Populate table
        contacts.forEach(contact => {
            const row = document.createElement("tr");
            
            const fullName = [
                contact.title,
                contact.firstname,
                contact.lastname
            ].filter(Boolean).join(' ');
            
            row.innerHTML = `
                <td>${fullName}</td>
                <td>${contact.email || ''}</td>
                <td>${contact.company || ''}</td>
                <td>
                    <span class="contact-type ${(contact.type || '').toLowerCase().replace(/\s+/g, '-')}">
                        ${contact.type || 'N/A'}
                    </span>
                </td>
                <td>
                    <a href="contact_details.html?id=${contact.id}" class="view-link">
                        View
                    </a>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">Error loading contacts. Please try again.</td></tr>';
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
