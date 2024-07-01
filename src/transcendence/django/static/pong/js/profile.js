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

  try {
    const response = await fetch("/user/update_avatar/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    });

    // Check if the content type is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, got HTML: ${text}`);
    }

    const data = await response.json();

    if (!response.ok) {
      showErrorMessage(data.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    showErrorMessage(error.message || "An unexpected error occurred.");
    return false;
  }
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
