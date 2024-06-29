/**
 * Handles the password confirmation warnings.
**/

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerModel = new bootstrap.Modal(document.getElementById('registerModel'));
    const registerModelResponse = new bootstrap.Modal(document.getElementById('registerModelResponse'));
    const returnToRegisterButton = document.getElementById('returnToRegister');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const passwordMatchWarning = document.getElementById('password-match-warning');

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
                document.getElementById('registerModelResponseLabel').textContent = 'Error';
                document.getElementById('registerModelResponseContent').textContent = data.error;
                registerModel.hide(); // Hide registerModel
                registerModelResponse.show(); // Show registerModelResponse
                returnToRegisterButton.style.display = 'block'; // Ensure returnToRegister button is visible
            } else if (data.success) {
                document.getElementById('registerModelResponseLabel').textContent = 'Success';
                document.getElementById('registerModelResponseContent').textContent = 'User registered successfully';
                registerModel.hide(); // Hide registerModel
                registerModelResponse.show(); // Show registerModelResponse
                returnToRegisterButton.style.display = 'none'; // Hide returnToRegister button
            } else {
                console.error('Unexpected response:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('registerModelResponseLabel').textContent = 'Error';
            document.getElementById('registerModelResponseContent').textContent = 'An unexpected error occurred.';
            registerModel.hide(); // Hide registerModel
            registerModelResponse.show(); // Show registerModelResponse
            returnToRegisterButton.style.display = 'block'; // Ensure returnToRegister button is visible
        });
    });

    // Clear modal content when closed to prevent stale messages
    registerModelResponse.addEventListener('hidden.bs.modal', function () {
        document.getElementById('registerModelResponseContent').textContent = '';
    });

    // Close the register modal when the response modal is closed
    registerModelResponse.addEventListener('hidden.bs.modal', function () {
        registerModel.show(); // Show registerModel again
    });

});
