let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    setupNewContactForm();
    loadAssignableUsers();
    loadCurrentUser();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

async function loadAssignableUsers() {
    const select = document.getElementById("assigned-to");
    if (!select) return;

    // show loading placeholder
    select.innerHTML = '<option disabled selected>Loading users...</option>';

    try {
        const response = await fetch("users.php");
        if (response.ok) {
            const users = await response.json();
            select.innerHTML = '';

            // optional Unassigned choice
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = 'Unassigned';
            select.appendChild(emptyOpt);

            users.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.firstname} ${u.lastname}`;
                select.appendChild(opt);
            });
            return;
        }
        console.warn('users.php returned', response.status);
    } catch (err) {
        console.warn('Error fetching users:', err);
    }

    // Fallback: try to add current user only
    try {
        const r2 = await fetch('dashboard.php');
        if (r2.ok) {
            const me = await r2.json();
            select.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = me.user_id;
            opt.textContent = `${me.firstname} ${me.lastname} (you)`;
            select.appendChild(opt);
            return;
        }
    } catch (err) {
        // ignore
    }

    // final fallback
    select.innerHTML = '<option disabled>No users available</option>';
}

async function loadCurrentUser() {
    try {
        const response = await fetch('dashboard.php');
        if (response.ok) {
            currentUser = await response.json();
            // Optionally show creator on the form if an element exists
            const createdByLabel = document.getElementById('createdByLabel');
            if (createdByLabel && currentUser) {
                createdByLabel.textContent = `Creating as: ${currentUser.firstname} ${currentUser.lastname}`;
            }
        }
    } catch (err) {
        console.warn('Could not load current user:', err);
    }
} 

async function checkSession() {
    try {
        const response = await fetch("dashboard.php");
        if (!response.ok) {
            window.location.href = "login.html";
        }
    } catch (error) {
        window.location.href = "login.html";
    }
}

function setupNewContactForm() {
    const form = document.querySelector(".new-contact-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await submitNewContact(form);
    });
}

async function submitNewContact(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // capture form values
    const contactData = {
        title: document.getElementById("title").value,
        firstname: document.getElementById("first-name").value.trim(),
        lastname: document.getElementById("last-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        telephone: document.getElementById("telephone").value.trim(),
        company: document.getElementById("company").value.trim(),
        type: document.getElementById("type").value,
        assigned_to: document.getElementById("assigned-to").value,
        created_by: currentUser ? currentUser.user_id : null
    };

    // client-side validation
    if (!contactData.firstname || !contactData.lastname || !contactData.email) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        submitBtn.textContent = "Saving...";
        submitBtn.disabled = true;

        const response = await fetch("add_contact.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contactData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Contact created successfully!");
            window.location.href = "index.html";
        } else {
            alert(result.error || "Failed to create contact.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("A network error occurred.");
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