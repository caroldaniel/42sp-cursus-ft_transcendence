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

/**
 * Sets the language for the application.
 * @param {string} language - The language to set.
 */
function setLanguage(language) {
    fetch(`/set_language?language=${language}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            location.reload();
        } else {
            console.error('Failed to set language');
        }
    });
}