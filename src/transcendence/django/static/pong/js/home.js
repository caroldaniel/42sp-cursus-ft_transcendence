async function logout() {
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

    return;
}