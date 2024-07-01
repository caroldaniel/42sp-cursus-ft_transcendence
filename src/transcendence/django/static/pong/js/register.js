/**
 * Handles the password confirmation warnings.
**/

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const returnToRegisterButton = document.getElementById('returnToRegister');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const passwordMatchWarning = document.getElementById('password-match-warning');
    
    const registerModalElement = document.getElementById('registerModal');
    
    if (!registerModalElement) {
        console.error('Error: #registerModal not found');
        return;
    }

    const registerModal = new bootstrap.Modal(registerModalElement);

    const registerModalResponseElement = document.getElementById('registerModalResponse');
    
    if (!registerModalResponseElement) {
        console.error('Error: #registerModalResponse not found');
        return;
    }

    const registerModalResponse = new bootstrap.Modal(registerModalResponseElement);

    passwordInput.addEventListener('input', () => {
        if (confirmPasswordInput === '' || passwordInput.value === '') {
            passwordMatchWarning.textContent = '';
            document.getElementById('register-button').disabled = true;
        } else if (passwordInput.value === confirmPasswordInput.value) {
            passwordMatchWarning.textContent = 'Passwords match';
            passwordMatchWarning.style.color = 'green';
            document.getElementById('register-button').disabled = false;
        } else {
            passwordMatchWarning.textContent = 'Passwords do not match';
            passwordMatchWarning.style.color = 'red';
            document.getElementById('register-button').disabled = true;
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput === '' || passwordInput.value === '') {
            passwordMatchWarning.textContent = '';
            document.getElementById('register-button').disabled = true;
        } else if (passwordInput.value === confirmPasswordInput.value) {
            passwordMatchWarning.textContent = 'Passwords match';
            passwordMatchWarning.style.color = 'green';
            document.getElementById('register-button').disabled = false;
        } else {
            passwordMatchWarning.textContent = 'Passwords do not match';
            passwordMatchWarning.style.color = 'red';
            document.getElementById('register-button').disabled = true;
        }
    });

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(registerForm);
        fetch(registerForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('registerModalResponseLabel').textContent = 'Error';
                document.getElementById('registerModalResponseContent').textContent = data.error;
                registerModal.hide(); // Hide registerModal
                registerModalResponse.show(); // Show registerModalResponse
                returnToRegisterButton.style.display = 'block'; // Ensure returnToRegister button is visible
            } else if (data.success) {
                document.getElementById('registerModalResponseLabel').textContent = 'Success';
                document.getElementById('registerModalResponseContent').textContent = 'User registered successfully';
                registerModal.hide(); // Hide registerModal
                registerModalResponse.show(); // Show registerModalResponse
                returnToRegisterButton.style.display = 'none'; // Hide returnToRegister button
            } else {
                console.error('Unexpected response:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('registerModalResponseLabel').textContent = 'Error';
            document.getElementById('registerModalResponseContent').textContent = 'An unexpected error occurred.';
            registerModal.hide(); // Hide registerModal
            registerModalResponse.show(); // Show registerModalResponse
            returnToRegisterButton.style.display = 'block'; // Ensure returnToRegister button is visible
        });
    });

    
    // Clear modal content when closed to prevent stale messages
    registerModalResponse.addEventListener('hidden.bs.modal', function () {
        document.getElementById('registerModalResponseContent').textContent = '';
    });

    // Close the register modal when the response modal is closed
    registerModalResponse.addEventListener('hidden.bs.modal', function () {
        registerModal.show(); // Show registerModal again
    });

});
