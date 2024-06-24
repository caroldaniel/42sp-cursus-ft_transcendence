async function updateDisplayName(displayName, csrfToken) {
  const formData = new FormData();
  formData.append("name", displayName);
  const response = await fetch("/user/update_name/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    showErrorMessage(data.message);
    return false;
  }
  return true;
}

async function updateAvatar(avatar, csrfToken) {
  const formData = new FormData();
  formData.append("file", avatar);
  const response = await fetch("/user/update_avatar/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    showErrorMessage(data.message);
    return false;
  }
  return true;
}

function showErrorMessage(message) {
  const toast = document.getElementById("toast");
  const toastBody = document.getElementById("toast-body");
  toastBody.innerHTML = message;
  const toastInstance = bootstrap.Toast.getOrCreateInstance(toast);
  toastInstance.show();
}

function setupProfile() {
  window.addEventListener("submit", async (event) => {
    event.preventDefault();
    const csrfToken = document.querySelector(
      "[name=csrfmiddlewaretoken]",
    ).value;

    let haveSucceeded;

    const displayName = document.getElementById("display-name").value;
    if (displayName)
      haveSucceeded = await updateDisplayName(displayName, csrfToken);
    if (haveSucceeded == false) return;

    const avatar = document.getElementById("avatar").files[0];
    if (avatar) haveSucceeded = await updateAvatar(avatar, csrfToken);
    if (haveSucceeded == false) return;

    showSection("/");
  });
}
