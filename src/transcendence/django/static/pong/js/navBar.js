/**
 * Sets the theme for the application.
 */

document.addEventListener('DOMContentLoaded', function () {
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Load theme preference from sessionStorage
  const currentTheme = sessionStorage.getItem('theme') || 'light';
  root.setAttribute('data-bs-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = root.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-bs-theme', newTheme);
  
    // Update the icon
    themeIcon.className = newTheme === 'light' ? 'bi bi-moon' : 'bi bi-sun';
  
    // Save the user's preference to sessionStorage
    sessionStorage.setItem('theme', newTheme);
  })
});
