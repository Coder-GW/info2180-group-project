document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.users-table')) {
        initUsersList();
    }
    
    if (document.querySelector('.new-user-form-group')) {
        initNewUserForm();
    }
});

function initUsersList() {
    // Load list of users
    loadUsersList();
    
   const addUserBtn = document.querySelector('.add-contact-button');
    if (!addUserBtn) return;

    addUserBtn.textContent = '+ Add New User';
    addUserBtn.addEventListener('click', () => {
        window.location.href = 'new-user.html';
        });
    }

async function loadUsersList() {
    try {
        const tableBody = document.querySelector('.users-table tbody');
        if (!tableBody) return;
        
        // loading state
        tableBody.innerHTML = '<tr><td colspan="4">Loading users...</td></tr>';
        
        // Fetch users from backend
        const data = await window.App.ajaxRequest('api/users.php?list=all');
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Check for users
        if (!data.users || data.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
            return;
        }
        
        // Populate table
        data.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.firstname} ${user.lastname}</td>
                <td>${user.email}</td>
                <td><span class="user-role ${user.role}">${user.role}</span></td>
                <td>${window.App.formatDate(user.created_at)}</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        const tableBody = document.querySelector('.users-table tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4">Error loading users. Please try again.</td></tr>';
        }
    }
}

function initNewUserForm() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitNewUserForm(this);
    });

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
    }
}

function validatePasswordStrength() {
    const password = this.value;
    const strengthIndicator = document.getElementById('password-strength') || createPasswordStrengthIndicator();
    
    // requirements for password
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasCapital = /[A-Z]/.test(password);
    const hasMinLength = password.length >= 8;
    
    // strength
    let strength = 0;
    let message = '';
    
    if (hasNumber) strength++;
    if (hasLetter) strength++;
    if (hasCapital) strength++;
    if (hasMinLength) strength++;
    
    switch(strength) {
        case 0:
        case 1:
            message = 'Very Weak';
            strengthIndicator.className = 'password is very-weak';
            break;
        case 2:
            message = 'Weak';
            strengthIndicator.className = 'password is weak';
            break;
        case 3:
            message = 'Medium';
            strengthIndicator.className = 'password is medium strength';
            break;
        case 4:
            message = 'Strong';
            strengthIndicator.className = 'password is strong';
            break;
    }
    
    // Show missing requirements
    const requirements = [];
    if (!hasNumber) requirements.push('at least one number');
    if (!hasLetter) requirements.push('at least one letter');
    if (!hasCapital) requirements.push('at least one capital letter');
    if (!hasMinLength) requirements.push('at least 8 characters');
    
    if (requirements.length > 0) {
        message += ` (Missing: ${requirements.join(', ')})`;
    }
    
    strengthIndicator.textContent = message;
}

function createPasswordStrengthIndicator() {
    const passwordInput = document.getElementById('password');
    const indicator = document.createElement('div');
    indicator.id = 'password-strength';
    indicator.className = 'password-strength';
    
    passwordInput.parentNode.insertBefore(indicator, passwordInput.nextSibling);
    
    return indicator;
}

async function submitNewUserForm(form) {
    try {
        // Get form data
        const formData = {
            firstname: form.querySelector('#first-name').value,
            lastname: form.querySelector('#last-name').value,
            email: form.querySelector('#email').value,
            password: form.querySelector('#password').value,
            role: form.querySelector('#role').value
        };
        
        // Validation
        if (!formData.firstname || !formData.lastname || !formData.email || !formData.password) {
            window.App.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            window.App.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Password validation 
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            window.App.showNotification('Password must have at least 8 characters, one number, one letter, and one capital letter', 'error');
            return;
        }
        
        // loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        // Submit AJAX
        const response = await window.App.ajaxRequest('api/create-user.php', 'POST', formData);
        
        if (response.success) {
            window.App.showNotification('User created successfully!', 'success');
            
            // go to users list
            setTimeout(() => {
                window.location.href = 'users.html';
            }, 1500);
            
        } else {
            throw new Error(response.message || 'Failed to create user');
        }
        
    } catch (error) {
        console.error('Error creating user:', error);
        window.App.showNotification(`Error: ${error.message}`, 'error');
        
        // Reset button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Save';
            submitBtn.disabled = false;
        }
    }
}