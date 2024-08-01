async function redistributeSessionStorageItems() {
    sessionStorage.clear();
    const currentUser = document.getElementById('displayNameSpan').textContent;


    try {
        // Retrieve the combined item from the server
        const response = await fetch('/session/get/');
        // Check if the response status is 400
        if (response.status === 204) {
            return;
        }
        
        const combinedItemsJSON = await response.json();
        // Check if the combined item exists
        if (combinedItemsJSON) {

            // Store each item from the object back into sessionStorage individually
            for (let key in combinedItemsJSON) {
                if (combinedItemsJSON.hasOwnProperty(key)) {
                    sessionStorage.setItem(key, combinedItemsJSON[key]);
                }
            }
            sessionStorage.setItem('redistributed', 'true');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function logout() {
    sessionStorage.clear();
    window.location.href = '/logout';
}

function setupHome() {
    const copyButton = document.getElementById('copyButton');
    const gameTokenElement = document.getElementById('gameToken');

    if (!copyButton || !gameTokenElement) {
        return;
    }

    // Initialize the tooltip
    const tooltip = new bootstrap.Tooltip(copyButton, {
      trigger: 'hover'
    });

    copyButton.addEventListener('click', function () {
      const gameToken = gameTokenElement.textContent;

      // Create a temporary textarea element
      const tempInput = document.createElement('textarea');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      tempInput.value = gameToken;
      document.body.appendChild(tempInput);

      // Select the text
      tempInput.select();
      tempInput.setSelectionRange(0, 99999); // For mobile devices

      // Copy the text
      document.execCommand('copy');

      // Remove the temporary textarea
      document.body.removeChild(tempInput);

      // Update the tooltip content and icon
      copyButton.innerHTML = '<i class="bi bi-clipboard-check"></i>';

      // Show the updated tooltip
      tooltip.show();

      // Revert the tooltip content and icon after a short delay
      setTimeout(() => {
        tooltip.hide();
        copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
      }, 2000);
    });

    // Retrieve all items only once per session
    if (document.getElementById('displayNameSpan')) {
        redistributeSessionStorageItems();
    }
    return;
}