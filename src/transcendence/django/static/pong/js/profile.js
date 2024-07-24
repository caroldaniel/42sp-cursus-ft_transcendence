function setupProfile() {
  createPopover('username-info', 'Your username is your unique identifier. It cannot be changed.')
  createPopover('password-info', 'You are logged in with 42 Intranet. You cannot change your password.')
  editProfile();
  return;
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

  // Add event listeners for password fields if the field is 'password'
  if (field === 'password') {
    const newPasswordField = document.getElementById('editInputNewPassword');
    const confirmNewPasswordField = document.getElementById('editInputConfirmNewPassword');

    if (newPasswordField && confirmNewPasswordField) {
      newPasswordField.addEventListener('input', checkPasswordMatch);
      confirmNewPasswordField.addEventListener('input', checkPasswordMatch);
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
  const newPasswordField = document.getElementById('editInputNewPassword');
  const confirmNewPasswordField = document.getElementById('editInputConfirmNewPassword');

  if (newPasswordField && confirmNewPasswordField) {
    newPasswordField.addEventListener('input', checkPasswordMatch);
    confirmNewPasswordField.addEventListener('input', checkPasswordMatch);
  }
});