// Run on page load
function setupSocial() {
	window.addEventListener("submit", async (event) => {
		event.preventDefault()

		let success

		const displayName = document.getElementById("add-friend-name").value
		if (displayName)
			success = await addFriend(displayName)

		if (success)
			await showSection("/social/");
	});
}

async function removeFriend(friendId) {
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	const formData = new FormData()

	formData.append("friend_id", friendId)

	const response = await fetch('/friend/remove/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrfToken,
		},
		body: formData,
	})

	await response.json()
	await showSection('/social/')
}

async function acceptFriendRequest(friendId) {
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	const formData = new FormData()

	formData.append("friend_id", friendId)

	const response = await fetch('/friend/accept/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrfToken,
		},
		body: formData,
	})

	await response.json()
	await showSection('/social/')
}

async function denyFriendRequest(friendId) {
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	const formData = new FormData()

	formData.append("friend_id", friendId)

	const response = await fetch('/friend/deny/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrfToken,
		},
		body: formData,
	})

	await response.json()
	await showSection('/social/')
}

async function addFriend(displayName) {
	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
	const formData = new FormData()

	formData.append("friend_name", displayName)

	const response = await fetch('/friend/send/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrfToken,
		},
		body: formData,
	})
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
