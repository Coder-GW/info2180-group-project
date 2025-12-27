document.addEventListener('DOMContentLoaded', () => {
    const isContactDetailsPage = document.querySelector('.contact-header-card');
    const isNewContactPage =
        document.querySelector('#new-contact-form') ||
        document.querySelector('form[action*="new-contact"]');

    if (isContactDetailsPage) initContactDetails();
    if (isNewContactPage) initNewContactForm();
});

function initContactDetails() {
    // contact ID 
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('id');
    
    if (!contactId) {
        console.error('No contact ID found in URL');
        return;
    }
    
    // Load contact
    loadContactDetails(contactId);
    
    // Setup "Assign to me" button
    const assignBtn = document.querySelector('.btn-assign');
    if (assignBtn) {
        assignBtn.addEventListener('click', function() {
            assignContactToMe(contactId);
        });
    }
    
    const switchBtn = document.querySelector('.btn-switch-lead');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            toggleContactType(contactId, switchBtn);
        });
    }
    
    // Update contact name 
    const contactNameElement = document.querySelector('.contact-name');
    if (contactNameElement && document.getElementById('contactName')) {
        document.getElementById('contactName').textContent = contactNameElement.textContent;
    }
}

async function loadContactDetails(contactId) {
    try {
        // Show loading state
        const contactNameElement = document.querySelector('.contact-name');
        if (contactNameElement) {
            contactNameElement.textContent = 'Loading...';
        }
        
        // Fetch contact details
        const data = await window.App.ajaxRequest(`api/contact.php?id=${contactId}`);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load contact');
        }
        
        const contact = data.contact;
        
        // Update UI with contact details
        updateContactUI(contact);
        
    } catch (error) {
        console.error('Error loading contact details:', error);
        window.App.showNotification('Error loading contact details', 'error');
    }
}

function updateContactUI(contact) {
    // Update name and title
    const contactNameElement = document.querySelector('.contact-name');
    if (contactNameElement) {
        contactNameElement.textContent = `${contact.title} ${contact.firstname} ${contact.lastname}`;
    }
    
    // Update created/updated dates
    const createdDateElement = document.getElementById('contactCreatedDate');
    if (createdDateElement && contact.created_at) {
        createdDateElement.textContent = `Created on ${window.App.formatDate(contact.created_at)} by ${contact.created_by_name || 'Unknown'}`;
    }
    
    const updatedDateElement = document.getElementById('contactUpdatedDate');
    if (updatedDateElement && contact.updated_at) {
        updatedDateElement.textContent = `Updated on ${window.App.formatDate(contact.updated_at)}`;
    }
    
    // Update contact details
    const emailElement = document.querySelector('.contact-detail:nth-child(1) .detail-value');
    if (emailElement) emailElement.textContent = contact.email || 'N/A';
    
    const phoneElement = document.querySelector('.contact-detail:nth-child(2) .detail-value');
    if (phoneElement) phoneElement.textContent = contact.telephone || 'N/A';
    
    const companyElement = document.querySelector('.contact-detail:nth-child(3) .detail-value');
    if (companyElement) companyElement.textContent = contact.company || 'N/A';
    
    const assignedElement = document.querySelector('.contact-detail:nth-child(4) .detail-value');
    if (assignedElement) assignedElement.textContent = contact.assigned_to_name || 'Unassigned';
    
    // Update button text based on type
    const switchBtn = document.querySelector('.btn-switch-lead');
    if (switchBtn) {
        const btnIcon = switchBtn.querySelector('.btn-icon');
        if (contact.type === 'Sales Lead') {
            btnIcon.textContent = '🛟'; // Support icon
            switchBtn.innerHTML = '<span class="btn-icon">🛟</span> Switch to Support';
        } else {
            btnIcon.textContent = '⭐'; // Sales lead icon
            switchBtn.innerHTML = '<span class="btn-icon">⭐</span> Switch to Sales Lead';
        }
    }
}

async function assignContactToMe(contactId) {
    try {
        const response = await window.App.ajaxRequest(
            'api/assign-contact.php',
            'POST',
            { contact_id: contactId }
        );

        if (!response.success) throw new Error(response.message);

        window.App.showNotification('Contact assigned to you!', 'success');
        loadContactDetails(contactId);
    } catch (error) {
        console.error('Error assigning contact:', error);
        window.App.showNotification('Error assigning contact', 'error');
    }
}

async function toggleContactType(contactId, button) {
    try {
        const currentType = button.textContent.includes('Sales Lead') ? 'Support' : 'Sales Lead';
        
        const response = await window.App.ajaxRequest('api/toggle-contact-type.php', 'POST', {
            contact_id: contactId,
            new_type: currentType
        });
        
        if (response.success) {
            const message = currentType === 'Sales Lead' 
                ? 'Contact switched to Sales Lead' 
                : 'Contact switched to Support';
            
            window.App.showNotification(message, 'success');
            
            // Update button 
            const btnIcon = button.querySelector('.btn-icon');
            if (currentType === 'Sales Lead') {
                btnIcon.textContent = '🛟'; // Support icon
                button.innerHTML = '<span class="btn-icon">🛟</span> Switch to Support';
            } else {
                btnIcon.textContent = '⭐'; // Sales lead icon
                button.innerHTML = '<span class="btn-icon">⭐</span> Switch to Sales Lead';
            }
            
            // Reload contact 
            loadContactDetails(contactId);
        } else {
            throw new Error(response.message || 'Failed to toggle contact type');
        }
    } catch (error) {
        console.error('Error toggling contact type:', error);
        window.App.showNotification('Error toggling contact type', 'error');
    }
}


function initNewContactForm() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Load users for "Assigned To" dropdown
    loadUsersForAssignment();
    
    // Setup form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitNewContactForm(this);
    });
}

async function loadUsersForAssignment() {
    try {
        const assignedToSelect = document.getElementById('assigned-to');
        if (!assignedToSelect) return;
        
        // Clear existing options (keep first if needed)
        while (assignedToSelect.options.length > 0) {
            assignedToSelect.remove(0);
        }
        
        // Add loading option
        const loadingOption = document.createElement('option');
        loadingOption.textContent = 'Loading users...';
        loadingOption.disabled = true;
        assignedToSelect.appendChild(loadingOption);
        
        // Fetch users
        const data = await window.App.ajaxRequest('api/users.php');
        
        // Clear loading option
        assignedToSelect.innerHTML = '';
        
        // Add users to dropdown
        if (data.users && data.users.length > 0) {
            data.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.firstname} ${user.lastname}`;
                assignedToSelect.appendChild(option);
            });
        } else {
            const noUsersOption = document.createElement('option');
            noUsersOption.textContent = 'No users available';
            noUsersOption.disabled = true;
            assignedToSelect.appendChild(noUsersOption);
        }
        
    } catch (error) {
        console.error('Error loading users for assignment:', error);
        const assignedToSelect = document.getElementById('assigned-to');
        if (assignedToSelect) {
            assignedToSelect.innerHTML = '';
            const errorOption = document.createElement('option');
            errorOption.textContent = 'Error loading users';
            errorOption.disabled = true;
            assignedToSelect.appendChild(errorOption);
        }
    }
}

async function submitNewContactForm(form) {
    try {
        // Get form data
        const formData = {
            title: form.querySelector('#title').value,
            firstname: form.querySelector('#first-name').value,
            lastname: form.querySelector('#last-name').value,
            email: form.querySelector('#email').value,
            telephone: form.querySelector('#Telephone').value,
            company: form.querySelector('#company').value,
            type: form.querySelector('#type').value,
            assigned_to: form.querySelector('#assigned-to').value
        };
        
        // Basic validation
        if (!formData.firstname || !formData.lastname || !formData.email) {
            window.App.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            window.App.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        // Submit AJAX
        const response = await window.App.ajaxRequest('api/create-contact.php', 'POST', formData);
        
        if (response.success) {
            window.App.showNotification('Contact created successfully!', 'success');
            
            // Redirect to dashboard or contact details
            setTimeout(() => {
                if (response.contact_id) {
                    window.location.href = `contact-details.html?id=${response.contact_id}`;
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
            
        } else {
            throw new Error(response.message || 'Failed to create contact');
        }
        
    } catch (error) {
        console.error('Error creating contact:', error);
        window.App.showNotification(`Error: ${error.message}`, 'error');
        
        // Reset button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Save';
            submitBtn.disabled = false;
        }
    }
}