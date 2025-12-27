document.addEventListener('DOMContentLoaded', function() {
    //  run on dashboard 
    if (!document.querySelector('.contacts-table')) return;
    
    initDashboard();
});

function initDashboard() {
    // Load contacts 
    loadContacts();
    
    // filter buttons
    const filterButtons = document.querySelectorAll('.filter-tab');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.textContent.trim();
            loadContacts(filterType);
            
            // Update active state (optional)
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Setup "Add New Contact" button
    const addContactBtn = document.querySelector('.add-contact-button');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', function() {
            window.location.href = 'new-contact.html';
        });
    } 
}

async function loadContacts(filter = 'All') {
    const tableBody = document.querySelector('.contacts-table tbody');
    if (!tableBody) return;

    try {
        // loading state
        tableBody.innerHTML =
            '<tr><td colspan="5">Loading contacts...</td></tr>';

        let url = 'api/contacts.php';
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

        // Fetch contacts
        const data = await window.App.ajaxRequest(url);

        // Clear table
        tableBody.innerHTML = '';

        // No contacts
        if (!data.contacts || data.contacts.length === 0) {
            tableBody.innerHTML =
                '<tr><td colspan="5">No contacts found</td></tr>';
            return;
        }

        // table
        data.contacts.forEach(contact => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${contact.title || ''} ${contact.firstname} ${contact.lastname}</td>
                <td>${contact.email}</td>
                <td>${contact.company}</td>
                <td>
                    <span class="contact-type ${contact.type
                        .toLowerCase()
                        .replace(/\s+/g, '-')}">
                        ${contact.type}
                    </span>
                </td>
                <td>
                    <a href="contact-details.html?id=${contact.id}" class="view-link">
                        View
                    </a>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Error loading contacts. Please try again.</td></tr>';
    }
}