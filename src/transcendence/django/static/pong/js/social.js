document.addEventListener('DOMContentLoaded', function () {
  const openSocialOffCanvas = document.getElementById('openSocialOffCanvas');
  const socialOffCanvasElement = document.getElementById('socialOffCanvas');
  // User
  const userTableBody = document.querySelector('#userTable tbody');
  // Tournament
  const tournamentContent = document.getElementById('tournamentContent');
  // Chat
  const userSelector = document.getElementById('userSelector');

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
    console.log('Populating user list with data:', data);
    users.forEach(user => {
      const row = document.createElement('tr');
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
    if(!isBlocked && !isFriend && !isRequestSent && !isRequestReceived)
      cell.appendChild(createButton('bi bi-person-plus-fill', 'btn btn-primary btn-sm me-2', () => addFriend(user)));
    if(isRequestReceived){
      if(isBlocked)
        denyFriendRequest(user.id);
      cell.appendChild(createButton('bi bi-person-check-fill', 'btn btn-primary btn-sm me-2', () => acceptFriendRequest(user.id)));
      cell.appendChild(createButton('bi bi-person-x-fill', 'btn btn-primary btn-sm me-2', () => denyFriendRequest(user.id)));
    }
    if(isRequestSent)
      cell.appendChild(createButton('bi bi-person-fill-exclamation', 'btn btn-primary btn-sm me-2'));
    if(isFriend){
      if(isBlocked)
        removeFriend(user.id);
      cell.appendChild(createButton('bi bi-person-lines-fill', 'btn btn-primary btn-sm me-2', () => viewProfile(user)));
      cell.appendChild(createButton('bi bi-chat-dots-fill', 'btn btn-primary btn-sm me-2', () => openChat(user)));
      cell.appendChild(createButton('bi bi-person-x-fill', 'btn btn-primary btn-sm btn-sm me-2', () => removeFriend(user.id)));
    }
    if(!isBlocked)
      cell.appendChild(createButton('bi bi-lock', 'btn btn-danger btn-sm', () => blockUser(user)));
    else
      cell.appendChild(createButton('bi bi-unlock', 'btn btn-success btn-sm', () => unblockUser(user)));
    return cell;
  }

  function createButton(iconClass, buttonClass, onClick) {
    const button = document.createElement('button');
    button.className = buttonClass;
    const icon = document.createElement('i');
    icon.className = iconClass;
    button.appendChild(icon);
    button.addEventListener('click', onClick);
    return button;
  }

  function addFriend(user) {
    console.log(`Adding ${user.display_name} as a friend...`);
    sendFriendRequest(user.display_name);
  }

  function viewProfile(user) {
    console.log(`Viewing profile of ${user.display_name}...`);
    const userProfileModal = document.getElementById('userProfileModal');
    const modal = new bootstrap.Modal(userProfileModal);
    modal.show();
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
    tournamentContent.innerHTML = data.content;
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
