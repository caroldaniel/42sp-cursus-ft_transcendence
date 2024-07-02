function showErrorMessage(message) {
  const toast = document.getElementById("toast");
  const toastBody = document.getElementById("toast-body");
  toastBody.innerHTML = message;
  const toastInstance = bootstrap.Toast.getOrCreateInstance(toast);
  toastInstance.show();
}

function setupProfile() {
  return ;
}

async function updateField(field, newValue, csrfToken) {
  try {
      let response;

      if (field === 'avatar') {
          const avatarFile = document.getElementById(`editInput_${field}`).files[0];
          response = await updateAvatar(avatarFile, csrfToken);
      } else {
          response = await fetch(`/profile/edit/${field}/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken
              },
              body: JSON.stringify({ field, new_value: newValue })
          });

          if (!response.ok) {
              throw new Error(`Failed to update ${field}`);
          }
      }

      const result = await response.json();

      if (result.success) {
          console.log(`Field "${field}" updated successfully`);
          return true;
      } else {
          console.error(`Failed to update ${field}: ${result.message}`);
          return false;
      }
  } catch (error) {
      console.error(`Error updating ${field}:`, error);
      return false;
  }
}

// Example updateAvatar function (replace with your actual implementation)
async function updateAvatar(avatarFile, csrfToken) {
  try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('/profile/edit/avatar/', {
          method: 'POST',
          headers: {
              'X-CSRFToken': csrfToken
          },
          body: formData
      });

      if (!response.ok) {
          throw new Error('Failed to update avatar');
      }

      const result = await response.json();

      if (result.success) {
          console.log('Avatar updated successfully');
          return true;
      } else {
          console.error('Failed to update avatar:', result.message);
          return false;
      }
  } catch (error) {
      console.error('Error updating avatar:', error);
      return false;
  }
}