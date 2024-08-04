/**
 * Handles the password confirmation warnings.
**/

document.addEventListener('DOMContentLoaded', function() {
    var languageDropdown = document.getElementById('languageDropdown');
        var languageCode = languageDropdown.getAttribute('data-language');

        // Translation dictionaries
        const translations = {
            en: {
                passwordCriteria: 'Password does not meet the criteria.',
                passwordsDoNotMatch: 'Passwords do not match.',
                passwordsMatch: 'Passwords match.',
                registerError: 'An unexpected error occurred.',
                error: 'Error',
                success: 'Success'
            },
            pt: {
                passwordCriteria: 'A senha não atende aos critérios.',
                passwordsDoNotMatch: 'As senhas não coincidem.',
                passwordsMatch: 'As senhas coincidem.',
                registerError: 'Ocorreu um erro inesperado.',
                error: 'Erro',
                success: 'Sucesso',
            },
            es: {
                passwordCriteria: 'La contraseña no cumple con los criterios.',
                passwordsDoNotMatch: 'Las contraseñas no coinciden.',
                passwordsMatch: 'Las contraseñas coinciden.',
                registerError: 'Ocurrió un error inesperado.',
                error: 'Error',
                success: 'Éxito'
            },
            fr: {
                passwordCriteria: 'Le mot de passe ne répond pas aux critères.',
                passwordsDoNotMatch: 'Les mots de passe ne correspondent pas.',
                passwordsMatch: 'Les mots de passe correspondent.',
                registerError: 'Une erreur inattendue est survenue.',
                error: 'Erreur',
                success: 'Succès',
            }
        };

        const currentTranslations = translations[languageCode] || translations['en'];

        // Initialize popovers
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

        const registerForm = document.getElementById('registerForm');
        const returnToRegisterButton = document.getElementById('returnToRegister');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');
        const passwordMatchWarning = document.getElementById('passwordMatchWarning');
        const registerModalElement = document.getElementById('registerModal');
        const passwordPolicy = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})');

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

        function validatePassword() {
            if (!passwordPolicy.test(passwordInput.value)) {
                passwordMatchWarning.textContent = currentTranslations.passwordCriteria;
                passwordMatchWarning.style.color = 'red';
                return false;
            } else {
                passwordMatchWarning.textContent = '';
            }
            return true;
        }

        function validatePasswordConfirmation() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                passwordMatchWarning.textContent = currentTranslations.passwordsDoNotMatch;
                passwordMatchWarning.style.color = 'red';
                return false;
            } else if (passwordInput.value && confirmPasswordInput.value) {
                passwordMatchWarning.textContent = currentTranslations.passwordsMatch;
                passwordMatchWarning.style.color = 'green';
            }
            return true;
        }

        passwordInput.addEventListener('input', () => {
            validatePassword();
            validatePasswordConfirmation();
            document.getElementById('registerButton').disabled = !validatePassword() || !validatePasswordConfirmation();
        });

        confirmPasswordInput.addEventListener('input', () => {
            validatePasswordConfirmation();
            document.getElementById('registerButton').disabled = !validatePassword() || !validatePasswordConfirmation();
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
                document.getElementById('registerModalResponseLabel').textContent = currentTranslations.error;
                document.getElementById('registerModalResponseContent').textContent = data.error;
                registerModal.hide(); // Hide registerModal
                registerModalResponse.show(); // Show registerModalResponse
                returnToRegisterButton.style.display = 'block'; // Ensure returnToRegister button is visible
            } else if (data.success) {
                document.getElementById('registerModalResponseLabel').textContent = currentTranslations.success;
                document.getElementById('registerModalResponseContent').textContent = data.success;
                registerModal.hide(); // Hide registerModal
                registerModalResponse.show(); // Show registerModalResponse
                returnToRegisterButton.style.display = 'none'; // Hide returnToRegister button
            } else {
                console.error('Unexpected response:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('registerModalResponseLabel').textContent = currentTranslations.error;
            document.getElementById('registerModalResponseContent').textContent = currentTranslations.registerError;
            registerModal.hide(); // Hide registerModal
            registerModalResponse.show(); // Show registerModalResponse
            returnToRegisterButton.style.display = 'block'; // Ensure returnToRegister button is visible
        });
    });

});
