/**
 * Handles the error models for the login form submission.
**/

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorModalElement = document.getElementById('errorModal');
    
    if (!errorModalElement) {
        console.error('Error: #errorModal not found');
        return;
    }

    const errorModal = new bootstrap.Modal(errorModalElement);

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(loginForm);

        fetch(loginForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                console.log('Error:', data.error);
                document.getElementById('errorMessage').textContent = data.error;
                errorModal.show();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('errorMessage').textContent = 'An unexpected error occurred. Please try again.';
            errorModal.show();
        });
    });
});