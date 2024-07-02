/**
 * Handles the edits to the user profile.
**/

document.addEventListener('DOMContentLoaded', function() {
    // Edit Modal
    const editModalElement = document.getElementById('editModal');
    if (!editModalElement) {
      console.error('Error: #editModal not found');
      return;
    }
    const editModal = new bootstrap.Modal(editModalElement);
    console.log('Edit Modal:', editModal);
  
    // Edit Modal Response
    const editModalResponseElement = document.getElementById('editModalResponse');
    if (!editModalResponseElement) {
      console.error('Error: #editModalResponse not found');
      return;
    }
    const editModalResponse = new bootstrap.Modal(editModalResponseElement);
    console.log('Edit Modal Response:', editModalResponse);
  
    // Reload Page Button
    const reloadPageButton = document.getElementById('reloadPageButton');
    reloadPageButton.addEventListener('click', function() {
      location.reload();
    });
  
    // Edit Form
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const formData = new FormData(editForm);
      fetch(editForm.action, {
          method: 'POST',
          body: formData,
          headers: {
              'X-CSRFToken': formData.get('csrfmiddlewaretoken')
          }
      })
      .then(response => response.json())
      .then(data => {
          console.log('Response Data:', data);
          if (data.error) {
              document.getElementById('editModalResponseLabel').textContent = 'Error';
              document.getElementById('editModalResponseContent').textContent = data.error;
              console.log('Hiding edit modal due to error');
              editModal.hide(); // Hide editModal
              editModalResponse.show(); // Show editModalResponse
          } else if (data.success) {
              document.getElementById('editModalResponseLabel').textContent = 'Success';
              document.getElementById('editModalResponseContent').textContent = data.success;
              console.log('Hiding edit modal due to success');
              editModal.hide(); // Hide editModal
              editModalResponse.show(); // Show editModalResponse
          } else {
              console.error('Unexpected response:', data);
          }
      })
      .catch(error => {
          console.error('Fetch Error:', error);
          document.getElementById('editModalResponseLabel').textContent = 'Error';
          document.getElementById('editModalResponseContent').textContent = 'An unexpected error occurred.';
          console.log('Hiding edit modal due to unexpected error');
          editModal.hide(); // Hide editModal
          editModalResponse.show(); // Show editModalResponse
      });
    });
  });
  