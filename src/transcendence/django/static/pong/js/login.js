/**
 * Handles the error models for the login form submission.
**/

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorModalElement = document.getElementById('errorModal');
    const errorMessageElement = document.getElementById('errorMessage');

    if (!errorModalElement) {
        console.error('Error: #errorModal not found');
        return;
    }

    const errorModal = new bootstrap.Modal(errorModalElement);

    function showErrorModal(message) {
        errorMessageElement.textContent = message;
        errorModal.show();
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        const error = urlParams.get('error');
        showErrorModal(error);
    }

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
                showErrorModal(data.error);
            }
        })
        .catch(error => {
            showErrorModal('An unexpected error occurred. Please try again.');
        });
    });
});
