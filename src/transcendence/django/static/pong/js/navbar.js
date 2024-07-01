/**
 * Updates the navbar with the provided user information.
 *
 * @param {Object} user - The user object containing the avatar and display name.
 */
function updateNavbar(user) {
    const avatarElement = document.querySelector('.avatar');
    if (avatarElement) {
        avatarElement.src = `${user.avatar}`;
    }

    const displayNameElement = avatarElement.nextSibling;
    if (displayNameElement) {
        displayNameElement.textContent = user.display_name;
    }
}

// Example function to update display name using fetch
/**
 * Updates the display name of the user.
 * @param {string} newDisplayName - The new display name to be updated.
 * @param {string} csrfToken - The CSRF token for authentication.
 * @returns {Promise<boolean>} - A promise that resolves to true if the display name is updated successfully, or false otherwise.
 */
async function updateDisplayName(newDisplayName, csrfToken) {
    try {
        const response = await fetch('/update_display_name/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ name: newDisplayName }),
        });
        if (!response.ok) {
            throw new Error('Failed to update display name');
        }
        const data = await response.json();
        updateNavbar(data.user); // Update navbar after successful update
        return true;
    } catch (error) {
        console.error('Error updating display name:', error);
        return false;
    }
}

/**
 * Updates the user's avatar by sending a POST request to the server.
 * 
 * @param {File} avatarFile - The avatar file to be uploaded.
 * @param {string} csrfToken - The CSRF token for authentication.
 * @returns {Promise<boolean>} - A promise that resolves to true if the avatar is updated successfully, or false otherwise.
 */
async function updateAvatar(avatarFile, csrfToken) {
    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
        const response = await fetch('/update_avatar/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to update avatar');
        }
        const data = await response.json();
        updateNavbar(data.user); // Update navbar after successful update
        return true;
    } catch (error) {
        console.error('Error updating avatar:', error);
        return false;
    }
}
