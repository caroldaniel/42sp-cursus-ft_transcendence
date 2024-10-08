function setupProfile() {
  var languageDropdown = document.getElementById('languageDropdown');
  var languageCode = languageDropdown.getAttribute('data-language');

  switch (languageCode) {
    case 'en':
      createPopover('username-info', 'Your username is your unique identifier. It cannot be changed.');
      createPopover('password-info', 'You are logged in with 42 Intranet. You cannot change your password.');
      break;
    case 'fr':
      createPopover('username-info', 'Votre nom d\'utilisateur est votre identifiant unique. Il ne peut pas être modifié.');
      createPopover('password-info', 'Vous êtes connecté avec 42 Intranet. Vous ne pouvez pas changer votre mot de passe.');
      break;
    case 'es':
      createPopover('username-info', 'Tu nombre de usuario es tu identificador único. No se puede cambiar.');
      createPopover('password-info', 'Estás conectado con 42 Intranet. No puedes cambiar tu contraseña.');
      break;
    case 'pt':
      createPopover('username-info', 'Seu nome de usuário é seu identificador exclusivo. Não pode ser alterado.');
      createPopover('password-info', 'Você está conectado com 42 Intranet. Você não pode alterar sua senha.');
      break;
    default:
      console.warn('Unsupported language code:', languageCode);
  }

  // Initialize Bootstrap modals
  const editModalElement = document.getElementById('editModal');
  const editModalResponseElement = document.getElementById('editModalResponse');

  if (!editModalElement) {
    console.error('Error: #editModal not found');
    return;
  }
  const editModal = new bootstrap.Modal(editModalElement);

  if (!editModalResponseElement) {
    console.error('Error: #editModalResponse not found');
    return;
  }
  const editModalResponse = new bootstrap.Modal(editModalResponseElement);

  // Event listener for edit form submission
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', function (event) {
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      const formData = new FormData(editForm);

      event.preventDefault();
    
      fetch('/profile/edit/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        handleFormResponse(data);
      })
      .catch(error => {
        handleError(error);
      });
    });
  }

  // Event listener for edit modal response
  editModalResponseElement.addEventListener('hidden.bs.modal', () => {
    fetchUserData()
      .then(user => {
        updateNavbar(user);
      })
      .catch(error => console.error('Error updating navbar:', error));
    showSection("/profile/");
  });

  // Function to handle form response
  function handleFormResponse(data) {
    if (data.error) {
      document.getElementById('editModalResponseLabel').textContent = 'Error';
      document.getElementById('editModalResponseContent').textContent = data.error;
      editModalElement.style.display = 'none';
      editModalElement.offsetHeight;
      editModal.hide();
      editModalResponse.show();
    } else if (data.success) {
      document.getElementById('editModalResponseLabel').textContent = 'Success';
      document.getElementById('editModalResponseContent').textContent = data.success;
      editModalElement.style.display = 'none';
      editModalElement.offsetHeight;
      editModal.hide();
      editModalResponse.show();
    } else {
      console.error('Unexpected response:', data);
    }
  }

  // Function to handle errors
  function handleError(error) {
    document.getElementById('editModalResponseLabel').textContent = 'Error';
    document.getElementById('editModalResponseContent').textContent = 'An unexpected error occurred.';
    editModalElement.style.display = 'none';
    editModalElement.offsetHeight;
    editModal.hide();
    editModalResponse.show();
  }

  // Function to fetch user data
  async function fetchUserData() {
    try {
      const response = await fetch('/users/me/');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }


  // Function to update navbar
  function updateNavbar(user) {
    const avatarElement = document.querySelector('#profileButton .avatar');
    if (avatarElement) {
      avatarElement.src = `${user.avatar}`;
    }

    const displayNameElement = document.querySelector('#profileButton span');
    if (displayNameElement) {
      displayNameElement.textContent = user.display_name;
    }
  }

  // Ensure that the backdrop is removed when the modal is hidden
  editModalElement.addEventListener('hidden.bs.modal', function () {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  });

  // Clear modal content when closed to prevent stale messages
  editModalResponseElement.addEventListener('hidden.bs.modal', function () {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  });

  // Clear modal content when closed to prevent stale messages
  editModalResponseElement.addEventListener('hidden.bs.modal', function () {
    document.getElementById('editModalResponseContent').textContent = '';
  });
}

// Function to load templates from an external HTML file
/**
 * Loads templates from the specified URL.
 * @param {string} url - The URL of the templates to load.
 * @returns {Promise<HTMLDivElement>} - A promise that resolves to a div element containing the loaded templates.
 */
async function loadTemplates(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const text = await response.text();
  const templateContainer = document.createElement('div');
  templateContainer.innerHTML = text;
  return templateContainer;
}

/**
 * Show edit modal
 * @param {string} field - Field to edit
 */
async function showEditModal(field) {
  // Load templates if not already loaded
  if (!window.templates) {
    window.templates = await loadTemplates('/profile/edit/templates/');
  }

  // Get modal element
  const modal = document.getElementById('editModal');

  // Check if modal exists
  if (!modal) {
    console.error('Edit Modal not found');
    return;
  }

  // Get modal instance for future use
  const modalInstance = new bootstrap.Modal(modal);

  // Get form elements
  const editInputContainer = document.getElementById('editInputContainer');

  // Get the templates container
  const templatesContainer = document.getElementById('formTemplates');

  // Define a function to get the template content
  function getTemplate(templateId) {
    const template = window.templates.querySelector(`#${templateId}`);
    return template ? template.innerHTML : '';
  }

  // Clear the existing content in the editInputContainer
  editInputContainer.innerHTML = '';

  // Update modal content based on the field
  let templateId;
  switch (field) {
    case 'avatar':
      templateId = 'avatarTemplate';
      break;
    case 'password':
      templateId = 'passwordTemplate';
      break;
    case 'display_name':
      templateId = 'displayNameTemplate';
      break;
    case 'first_name':
      templateId = 'firstNameTemplate';
      break;
    case 'last_name':
      templateId = 'lastNameTemplate';
      break;
    case 'email':
      templateId = 'emailTemplate';
      break;
    default:
      templateId = '';  // No template for unknown field
  }

  // Insert the template content into the modal
  editInputContainer.innerHTML = getTemplate(templateId);

  if (field === 'avatar') {
    const newAvatarField = document.getElementById('editInputAvatar');

    if (newAvatarField) {
      newAvatarField.addEventListener('change', checkAvatarSubmition);
    }
  }

  if (field === 'password') {
    const newPasswordField = document.getElementById('editInputNewPassword');
    const confirmNewPasswordField = document.getElementById('editInputConfirmNewPassword');

    if (newPasswordField && confirmNewPasswordField) {
      newPasswordField.addEventListener('input', checkPasswordMatch);
      confirmNewPasswordField.addEventListener('input', checkPasswordMatch);
    }
  }

  if (field === 'display_name') {
    const displayNameField = document.getElementById('editInputDisplayName');

    if (displayNameField) {
      displayNameField.addEventListener('input', () => checkFieldRequirements(displayNameField));
    }
  }

  if (field === 'first_name') {
    const firstNameField = document.getElementById('editInputFirstName');

    if (firstNameField) {
      firstNameField.addEventListener('input', () => checkFieldRequirements(firstNameField));
    }
  }

  if (field === 'last_name') {
    const lastNameField = document.getElementById('editInputLastName');

    if (lastNameField) {
      lastNameField.addEventListener('input', () => checkFieldRequirements(lastNameField));
    }
  }

  if (field === 'email') {
    const emailField = document.getElementById('editInputEmail');

    if (emailField) {
      emailField.addEventListener('input', () => checkFieldRequirements(emailField));
    }
  }

  // Show the modal
  modalInstance.show();
}

/**
 * Check if the new password and confirm new password fields match
 */
function checkPasswordMatch() {
  const newPassword = document.getElementById('editInputNewPassword').value;
  const confirmNewPassword = document.getElementById('editInputConfirmNewPassword').value;
  const passwordWarning = document.getElementById('passwordEditMatchWarning');
  const submitButton = document.getElementById('editInputButton');

  if (newPassword === '' || confirmNewPassword === '') {
    passwordWarning.textContent = '';
    submitButton.disabled = true;
  } else if (newPassword === confirmNewPassword) {
    passwordWarning.textContent = 'Passwords match';
    passwordWarning.style.color = 'green';
    submitButton.disabled = false;
  } else {
    passwordWarning.textContent = 'Passwords do not match';
    passwordWarning.style.color = 'red';
    submitButton.disabled = true;
  }
}

/**
 * Check if input of type file has had any value to it
 */
function checkAvatarSubmition() {
  const avatarInput = document.getElementById('editInputAvatar');
  const submitButton = document.getElementById('editInputButton');

  if (avatarInput.files.length > 0) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

/**
 * Check if fields have minimum or maximum requirements
 */
function checkFieldRequirements(field_element) {
  const submitButton = document.getElementById('editInputButton');

  if (field_element) {
    if (field_element.value.length < 3 || field_element.value.length > 50) {
      submitButton.disabled = true;
    } else {
      submitButton.disabled = false;
    }
  }
}

/**
 * Popover for username info
 */
function createPopover(id, content) {
  var popoverTrigger = document.getElementById(id);
  if (!popoverTrigger) {
    return;
  }

  var popoverContent = content;

  // Create a new Popover instance
  var popover = new bootstrap.Popover(popoverTrigger, {
    content: popoverContent,
    trigger: 'hover',  // Adjust trigger behavior if needed
    placement: 'top'   // Adjust placement if needed
  });

  return popover;
}


/**
 * Renew Game Token
 */
async function renewGameToken() {
  // Get the renew token form
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const response = await fetch('/renew-game-token/', {
        method: "POST",
        headers: {
            "X-CSRFToken": csrfToken
        },
    });
    if (!response.ok) {
        throw new Error('Failed to renew game token');
    }
    const data = await response.json();
    showSection('/profile/');
  }
  catch (error) {
    console.error('Error renewing game token:', error.message);
  }
}

/**
 * Event Listeners when DOM is loaded
 */

// Add event listeners to the password fields when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const newAvatarField = document.getElementById('editInputAvatar');
  const newPasswordField = document.getElementById('editInputNewPassword');
  const confirmNewPasswordField = document.getElementById('editInputConfirmNewPassword');
  const displayNameField = document.getElementById('editInputDisplayName');
  const firstNameField = document.getElementById('editInputFirstName');
  const lastNameField = document.getElementById('editInputLastName');
  const emailField = document.getElementById('editInputEmail');

  if (newAvatarField) {
    newAvatarField.addEventListener('change', () => checkAvatarSubmition);
  }

  if (newPasswordField && confirmNewPasswordField) {
    newPasswordField.addEventListener('input', checkPasswordMatch);
    confirmNewPasswordField.addEventListener('input', checkPasswordMatch);
  }

  if (displayNameField) {
    displayNameField.addEventListener('input', () => checkFieldRequirements(displayNameField));
  }

  if (firstNameField) {
    firstNameField.addEventListener('input', () => checkFieldRequirements(firstNameField));
  }

  if (lastNameField) {
    lastNameField.addEventListener('input', () => checkFieldRequirements(lastNameField));
  }

  if (emailField) {
    emailField.addEventListener('input', () => checkFieldRequirements(emailField));
  }
});