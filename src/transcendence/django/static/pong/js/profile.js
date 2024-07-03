function setupProfile() {
  return ;
}

/**
 * Show edit modal
 * @param {string} field - Field to edit
 */
function showEditModal(field) {
// Get modal Element
const modal = document.getElementById('editModal');

// Check if modal exists
if (!modal) {
    console.error('Edit Modal not found');
    return;
}

// Get modal instance for future use
const modalInstance = new bootstrap.Modal(modal);

// Get form elements
const title = document.getElementById('editModalLabel');
const editInputContainer = document.getElementById('editInputContainer');

let newLabel = '';

// Add hidden input for field
const hiddenFieldInput = `<input type="hidden" name="field" value="${field}">`;

if (field === 'avatar') {
    title.textContent = 'Change your avatar';
    editInputContainer.innerHTML = `
    ${hiddenFieldInput}
    <label for="editInput" class="form-label">Upload New Avatar</label>
    <input type="file" class="form-control" id="editInput" name="new_value" accept="image/*" required>
    `;
}
else {
    switch (field) {
    case 'display_name':
        title.textContent = 'Edit Display Name';
        newLabel = 'New Display Name';
        break;
    case 'first_name':
        title.textContent = 'Edit First Name';
        newLabel = 'New First Name';
        break;
    case 'last_name':
        title.textContent = 'Edit Last Name';
        newLabel = 'New Last Name';
        break;
    case 'email':
        title.textContent = 'Edit Email';
        newLabel = 'New Email';
        break;
    case 'password':
        title.textContent = 'Edit Password';
        newLabel = 'New Password';
        break;
    default:
        title.textContent = 'Edit';
        newLabel = 'New Value';
    }

    editInputContainer.innerHTML = `
    ${hiddenFieldInput}
    <label for="editInput" class="form-label">${newLabel}</label>
    <input type="text" class="form-control" id="editInput" name="new_value" required>
    `;
}

// Show modal
modalInstance.show();
}

/**
 * Popover for username info
 */
document.addEventListener('DOMContentLoaded', function () {
var popoverTrigger = document.getElementById('username-info');
var popoverContent = 'You cannot edit the username.';

// Create a new Popover instance
var popover = new bootstrap.Popover(popoverTrigger, {
    content: popoverContent,
    trigger: 'hover',  // Adjust trigger behavior if needed
    placement: 'top'   // Adjust placement if needed
});
});