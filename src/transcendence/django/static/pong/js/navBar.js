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

/**
 * Sets the theme for the application.
 */

document.addEventListener('DOMContentLoaded', function () {
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Load theme preference from localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  root.setAttribute('data-bs-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = root.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-bs-theme', newTheme);
  
    // Update the icon
    themeIcon.className = newTheme === 'light' ? 'bi bi-moon' : 'bi bi-sun';
  
    // Save the user's preference to localStorage
    localStorage.setItem('theme', newTheme);
  })
});
