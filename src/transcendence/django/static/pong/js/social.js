document.addEventListener('DOMContentLoaded', function () {
  const openSocialOffCanvas = document.getElementById('openSocialOffCanvas');
  const socialOffCanvasElement = document.getElementById('socialOffCanvas');
  // User
  const userTableBody = document.querySelector('#userTable tbody');
  // Tournament
  const tournamentContent = document.getElementById('tournamentContent');
  const tournamentTableBody = document.querySelector('#tournamentTable tbody');
  const socialOffCanvas = new bootstrap.Offcanvas(socialOffCanvasElement);

  function fetchData(url, callback) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => callback(data))
      .catch(error => console.error('Error fetching data:', error));
  }

  function populateUserList(data) {
    const users = data.users;
    userTableBody.innerHTML = '';
    // Check if there's any user registered
    if (users.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'No users found';
      row.appendChild(cell);
      userTableBody.appendChild(row);
      return;
    }
    users.forEach(user => {
      const row = document.createElement('tr');
      row.classList.add(`user_${user.id}`);
      row.appendChild(createCell(user.display_name));
      if(data.relationships.friendList.includes(user.id))
        row.appendChild(createStatusCell(user.is_online));
      else
        row.appendChild(createCell(''));
      row.appendChild(createActionsCell(user, data.blockList.includes(user.id), data.relationships.friendList.includes(user.id), data.relationships.sentList.includes(user.id), data.relationships.receivedList.includes(user.id)));
      userTableBody.appendChild(row);
    });
  }

  function createCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
  }

  function createStatusCell(isOnline) {
    const cell = document.createElement('td');
    const statusIcon = document.createElement('i');
    statusIcon.className = isOnline ? 'bi bi-circle-fill text-success' : 'bi bi-circle-fill text-danger';
    cell.appendChild(statusIcon);
    return cell;
  }

  function createActionsCell(user, isBlocked, isFriend, isRequestSent, isRequestReceived) {
    const cell = document.createElement('td');
    if(!isBlocked && !isFriend && !isRequestSent && !isRequestReceived) {
      cell.appendChild(createButton('bi bi-person-plus-fill', 'btn btn-primary btn-sm me-2', () => addFriend(user)));
    }
    if(isRequestReceived){
      if(isBlocked)
        denyFriendRequest(user.id);
        cell.appendChild(createButton('bi bi-person-check-fill', 'btn btn-primary btn-sm me-2', () => acceptFriendRequest(user.id)));
        cell.appendChild(createButton('bi bi-person-x-fill', 'btn btn-primary btn-sm me-2', () => denyFriendRequest(user.id)));
      }
      if(isRequestSent){
        cell.appendChild(createButton('bi bi-person-fill-exclamation', 'btn btn-primary btn-sm me-2'));
      }
      if(isFriend){
        if(isBlocked)
          removeFriend(user.id);
        cell.appendChild(createButton('bi bi-joystick', 'btn btn-primary btn-sm me-2', () => playPong(user)));
        cell.appendChild(createButton('bi bi-person-lines-fill', 'btn btn-primary btn-sm me-2', () => viewProfile(user)));
        cell.appendChild(createButton('bi bi-person-x-fill', 'btn btn-primary btn-sm btn-sm me-2', () => removeFriend(user.id)));
    }
    if(!isBlocked){
      cell.appendChild(createButton('bi bi-chat-dots-fill', 'btn btn-primary btn-sm me-4', () => openChat(user), `unreadMessagesBadge_${user.id}`));
      cell.appendChild(createButton('bi bi-lock', 'btn btn-danger btn-sm', () => blockUser(user)));
    } else
      cell.appendChild(createButton('bi bi-unlock', 'btn btn-success btn-sm', () => unblockUser(user)));
    return cell;
  }

  function createButton(iconClass, buttonClass, onClick, badgeId = null) {
    const button = document.createElement('button');
    button.className = buttonClass;
    const icon = document.createElement('i');
    icon.className = iconClass;
    button.appendChild(icon);
    if (badgeId) {
      button.classList.add('position-relative');
      const badge = document.createElement('span');
      badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
      badge.setAttribute('hidden', true);
      badge.id = badgeId;
      button.appendChild(badge);
    }
    button.addEventListener('click', onClick);
    return button;
  }

  function playPong(user) {
    console.log(`Playing pong with ${user.display_name}...`);
    const gameTokenModal = document.getElementById('gameTokenModal');
    const modal = new bootstrap.Modal(gameTokenModal);
    fetch(`/users/${user.id}/`)
      .then(response => response.json())
      .then(data => {
        putModalContent(modal, data, user);
      })
    modal.show();
  }

  function putModalContent(modal, data, user) {
    const modalBody = gameTokenModal.querySelector('.modal-body');
    const modalgameTokenContent = modalBody.querySelector('#modalgameTokenContent');
    
    // Clear modal content
    modalgameTokenContent.innerHTML = '';

    // Create div to display infos
    const infosDiv = document.createElement('div');
    infosDiv.className = 'text-center';
    const infos = document.createElement('h2');
    infos.className = "fs-3 mb-1";
    infos.textContent = data.display_name;
    infosDiv.appendChild(infos);

    // Create div for avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = "position-relative d-inline-block";

    // Create elements to display the user's avatar
    const avatar = document.createElement('img');
    avatar.src = data.avatar;
    avatar.className = 'avatar rounded-circle mb-3';
    avatar.style.width = '150px';
    avatar.style.height = '150px';
    avatar.style.objectFit = 'cover';
    avatar.alt = 'Avatar';
    avatarDiv.appendChild(avatar);

    // Append avatar to the infos div
    infosDiv.appendChild(avatarDiv);

    // Create input field for game token
    const tokenInput = document.createElement('input');
    tokenInput.type = 'text';
    const placeholderText = `Enter with ${data.display_name} game token`;
    tokenInput.placeholder = placeholderText;
    tokenInput.className = 'form-control mt-3';

    // Create a temporary span to measure the placeholder width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.fontSize = '16px'; // Match the input's font size
    tempSpan.textContent = placeholderText;
    document.body.appendChild(tempSpan);

    // Set the input's width based on the span's width
    const inputWidth = tempSpan.offsetWidth + 30; // Add some padding
    tokenInput.style.width = `${inputWidth}px`; // Set input width
    tokenInput.style.textAlign = 'center'; // Center the placeholder text
    document.body.removeChild(tempSpan); // Clean up

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'btn btn-primary mt-2 me-2';

    // Create submit button
    const startGameButton = document.createElement('button');
    startGameButton.textContent = 'Start Game';
    startGameButton.className = 'btn btn-primary mt-2 me-2';
    startGameButton.disabled = true; // Disable the button by default

    // Create error message div
    const errorMessage = document.createElement('div');
    errorMessage.className = 'text-danger mt-2';
    errorMessage.style.display = 'none'; // Hide the error message by default

    // Add event listener to the submit button
    submitButton.addEventListener('click', () => {
        if (tokenInput.value === data.game_token) {
            startGameButton.disabled = false; // Enable the start game button
            errorMessage.style.display = 'none'; // Hide error message on success
        } else {
            errorMessage.textContent = '❌ Invalid game token. Please try again.';
            errorMessage.style.display = 'block'; // Show the error message
        }
    });

    // Add event listener to the start game button
    startGameButton.addEventListener('click', () => {
        console.log('Starting game...');
        modal.hide();
        socialOffCanvas.hide();
        showSection(`/game/${user.id}/`);
    });

    // Append input field, button, and error message to the infos div
    infosDiv.appendChild(tokenInput);
    infosDiv.appendChild(errorMessage);
    infosDiv.appendChild(submitButton);
    infosDiv.appendChild(startGameButton);

    // Append elements to the modal content
    modalgameTokenContent.appendChild(infosDiv);
  }

  function addFriend(user) {
    console.log(`Adding ${user.display_name} as a friend...`);
    sendFriendRequest(user.display_name);
  }

  function viewProfile(user) {
    console.log(`Viewing profile of ${user.display_name}...`);
    const userProfileModal = document.getElementById('userProfileModal');
    const modal = new bootstrap.Modal(userProfileModal);
    const modalBody = userProfileModal.querySelector('.modal-body');
    fetch(`/stats/${user.id}/`)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const profileUserContent = doc.getElementById('userProfileContent');
        if (profileUserContent) {
          const modalUserProfileContent = modalBody.querySelector('#modalUserProfileContent');
          modalUserProfileContent.innerHTML = profileUserContent.innerHTML;
        } else {
          console.error('userProfileContent div not found in the response');
        }
  
        modal.show();
      })
      .catch(error => console.error('Erro:', error));    
  }

  function openChat(user) {
    const chatTab = document.getElementById('chat-tab');
    setNewUserDefault(user.id);

    // Open chat tab
    chatTab.click();
  }

  async function blockUser(user) {
    console.log(`Blocking ${user.display_name}...`);
    try {
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      const formData = new FormData();
      
      formData.append('blocked', user.id);
      const response = await fetch('/block/', {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to block user');
      }
      
      console.log(data.success);  // Log the success message from the server
      fetchData('/users/list/', populateUserList);
      } catch (error) {
        console.error('Error fetching block user:', error.message);
    }
  }

  async function unblockUser(user) {
    console.log(`Unblocking ${user.display_name}...`);
    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData();
        
        formData.append('blocked', user.id);
        const response = await fetch('/unblock/', {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to unblock user');
        }

        console.log(data.success);  // Log the success message from the server
        fetchData('/users/list/', populateUserList);
      } catch (error) {
        console.error('Error fetching unblock user:', error.message);
    }
  }

  function populateTournament(data) {
    console.log('Populating tournament with data:', data);
    const tournaments = data.tournaments;
    tournamentTableBody.innerHTML = '';

    // Check if there's any tournament registered
    if (data.tournaments.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'No tournaments found';
      row.appendChild(cell);
      tournamentTableBody.appendChild(row);
      return;
    }
    
    tournaments.forEach(tournament => {
      const row = document.createElement('tr');
      row.id = tournament.id;
      row.appendChild(createCell(tournament.created_by + "'s Tournament"));
      if (tournament.winner === null)
        row.appendChild(createCell(tournament.actual_match));
      else
        row.appendChild(createCell("Winner: "+tournament.winner));
      tournamentTableBody.appendChild(row);
    });
  }

  function loadTabContent(tabId) {
    switch (tabId) {
      case 'user-list-tab':
        fetchData('/users/list/', populateUserList);
        break;
      case 'tournament-tab':
        fetchData('/tournament/list/', populateTournament);
        break;
      case 'chat-tab':
        fetchData('/users/list/', populateChat);
        break;
      default:
        console.error('Unknown tab ID');
    }
  }

  openSocialOffCanvas.addEventListener('click', function () {
    loadTabContent('user-list-tab');
    socialOffCanvas.show();
  });

  document.querySelectorAll('#socialTabs button[data-bs-toggle="tab"]').forEach(button => {
    button.addEventListener('show.bs.tab', function (event) {
      const tabId = event.target.id;
      loadTabContent(tabId);
    });
  });

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
    fetchData('/users/list/', populateUserList);
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
    fetchData('/users/list/', populateUserList);
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
    fetchData('/users/list/', populateUserList);
  }

  async function sendFriendRequest(displayName) {
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
      console.log(data.message);
      return false;
    }
    fetchData('/users/list/', populateUserList);
  }
});