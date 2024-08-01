/**
 * Handles the edits to the user profile.
**/

function editProfile() {
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
