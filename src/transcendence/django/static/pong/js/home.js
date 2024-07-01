function setupHome() {
  document.addEventListener('DOMContentLoaded', function() {
    const avatar = document.querySelector(".avatar");
    if (avatar) {
      avatar.src = `/media/${avatar.id}`;
    }
  });
}
