document.addEventListener('DOMContentLoaded', function() {
    // Initialize 
    initLogout();
    checkUserSession();
    initAJAXDefaults();
});

// Check for logged in user
function checkUserSession() {
    const currentPage = window.location.pathname;
    const loginPage = 'login.html';

}

function initAJAXDefaults() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        window.csrfToken = csrfToken.getAttribute('content');
    }
}

// Logout 
function initLogout() {
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Send logout request via AJAX
            fetch('logout.php', {
                method: 'POST',
                credentials: 'same-origin'
            })
            .then(response => {
                // Clear any stored session data
                sessionStorage.clear();
                localStorage.clear();
                
                // Redirect to login
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                window.location.href = 'login.html';
            });
        });
    });
}

// Utility function for AJAX requests
async function ajaxRequest(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'same-origin' 
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('AJAX request failed:', error);
        showNotification('Error: ' + error.message, 'error');
        throw error;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        font-weight: bold;
    `;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Remove
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// display date 
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

window.App = {
    ajaxRequest,
    showNotification,
    formatDate
};