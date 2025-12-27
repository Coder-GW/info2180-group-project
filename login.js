document.addEventListener('DOMContentLoaded', function() {
    // run login page
    if (!document.querySelector('.login-form-group')) return;
    
    initLogin();
});

function initLogin() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Change form submission to AJAX
    form.addEventListener('submit', submitLoginForm);
}

async function submitLoginForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Log In';

    try {
        // Get form data
        const formData = {
            username: form.querySelector('#username')?.value.trim(),
            password: form.querySelector('#password')?.value
        };

        // validation
        if (!formData.username || !formData.password) {
            window.App.showNotification(
                'Please enter both username and password',
                'error'
            );
            return;
        }

        // loading state
        if (submitBtn) {
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
        }

        // Submit AJAX
        const response = await fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: formData.username,
                password: formData.password
            }),
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Login failed');
        }

        window.App.showNotification('Login successful!', 'success');

        // Store session data 
        if (data.user) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        // go to dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        window.App.showNotification(
            `Login failed: ${error.message}`,
            'error'
        );
    } finally {
        // Reset button
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}