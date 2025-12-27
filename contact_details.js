document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    
    // 1. Get contact ID from URL (e.g., contact-details.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('id');

    if (!contactId) {
        alert("No contact ID provided.");
        window.location.href = "index.html";
        return;
    }

    // 2. Load the data
    loadContactDetails(contactId);
    setupActionButtons(contactId);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
});

async function loadContactDetails(id) {
    try {
        const response = await fetch(`get_contact.php?id=${id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to load contact");

            // Populate header
        document.getElementById("contactFullName").textContent = `${data.contact.title} ${data.contact.firstname} ${data.contact.lastname}`;
        document.getElementById("contactName").textContent = data.contact.firstname;
        
        document.getElementById("contactCreatedMeta").textContent = `Created on ${data.contact.created_at} by ${data.contact.creator_name}`;
        document.getElementById("contactUpdatedMeta").textContent = `Updated on ${data.contact.updated_at}`;

        // Populate details
        document.getElementById("contactEmail").textContent = data.contact.email || '';
        document.getElementById("contactCompany").textContent = data.contact.company || '';
        document.getElementById("contactTelephone").textContent = data.contact.telephone || '';
        document.getElementById("contactAssigned").textContent = data.contact.assigned_name || 'Unassigned';

        // Update Button labels based on type (support both legacy and UI types)
        const switchBtn = document.querySelector(".btn-switch-lead");
        const isLead = data.contact.type === "Lead" || data.contact.type === "Sales Lead";
        switchBtn.textContent = isLead ? "↔ Switch to Customer" : "↔ Switch to Sales Lead";

        // Populate Notes
        const notesList = document.querySelector(".notes-list");
        notesList.innerHTML = data.notes.map(note => `
            <div class="note-item">
                <strong>${note.author_name}</strong>
                <p>${note.comment}</p>
                <span class="note-date">${note.created_at}</span>
            </div>
        `).join('') || '<p>No notes yet.</p>';

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function setupActionButtons(id) {
    // Add Note logic - post the note and append to the list without reloading
    const addNoteBtn = document.getElementById("addNoteBtn");
    addNoteBtn.addEventListener("click", async () => {
        const textarea = document.getElementById("noteTextarea");
        const text = textarea.value.trim();
        if (!text) return;

        addNoteBtn.disabled = true;
        const originalText = addNoteBtn.textContent;
        addNoteBtn.textContent = "Adding...";

        try {
            const response = await fetch("add_note.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact_id: id, comment: text })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to add note');
            }

            const note = result.note;
            // Insert into DOM (prepend to top)
            const notesList = document.getElementById("notesList");
            if (notesList) {
                // Remove placeholder "No notes yet." if present
                if (notesList.textContent.trim() === 'No notes yet.') notesList.innerHTML = '';

                const noteItem = document.createElement('div');
                noteItem.className = 'note-item';

                const strong = document.createElement('strong');
                strong.textContent = note.author_name || 'Unknown';

                const p = document.createElement('p');
                p.textContent = note.comment || '';

                const span = document.createElement('span');
                span.className = 'note-date';
                span.textContent = note.created_at || '';

                noteItem.appendChild(strong);
                noteItem.appendChild(p);
                noteItem.appendChild(span);

                // Prepend
                notesList.insertAdjacentElement('afterbegin', noteItem);

                // Clear textarea
                textarea.value = '';
            }
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            addNoteBtn.disabled = false;
            addNoteBtn.textContent = originalText;
        }
    });

    // Assign to me logic
    document.querySelector(".btn-assign").addEventListener("click", () => updateContact(id, { action: 'assign' }));
    
    // Switch type logic
    document.querySelector(".btn-switch-lead").addEventListener("click", () => updateContact(id, { action: 'switch' }));
}

async function updateContact(id, payload) {
    payload.id = id;
    const response = await fetch("update_contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (response.ok) loadContactDetails(id);
}

// Re-use checkSession and logout from your dashboard.js logic
async function checkSession() {
    try {
        const response = await fetch("dashboard.php");
        if (!response.ok) {
            window.location.href = "login.html";
            return;
        }
        const data = await response.json();
        if (data.role !== 'admin') {
            document.querySelectorAll('.menu-item a[href="users.html"]').forEach(a => {
                const item = a.closest('.menu-item');
                if (item) item.style.display = 'none';
            });
        }
    } catch (err) {
        window.location.href = "login.html";
    }
}

async function logout() {
    await fetch("logout.php", { method: "POST" });
    window.location.href = "login.html";
}