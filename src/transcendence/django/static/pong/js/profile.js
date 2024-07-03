function setupProfile() {
  createPopover('username-info', 'You cannot edit the username.')
  return;
}

/**
 * Show edit modal
 * @param {string} field - Field to edit
 */
function showEditModal(field) {
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
    const template = templatesContainer.querySelector(`#${templateId}`);
    return template ? template.innerHTML : '';
  }

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

  // Show the modal
  modalInstance.show();
}


/**
 * Popover for username info
 */
function createPopover(id, content) {
  var popoverTrigger = document.getElementById(id);
  var popoverContent = content;

  // Create a new Popover instance
  var popover = new bootstrap.Popover(popoverTrigger, {
    content: popoverContent,
    trigger: 'hover',  // Adjust trigger behavior if needed
    placement: 'top'   // Adjust placement if needed
  });

  return popover;
}