document.addEventListener('DOMContentLoaded', function () {
  const openSocialOffCanvas = document.getElementById('openSocialOffCanvas');
  const socialOffCanvasElement = document.getElementById('socialOffCanvas');
  // User
  const userTableBody = document.querySelector('#userTable tbody');
  // Tournament
  const tournamentContent = document.getElementById('tournamentContent');
  // Chat
  const chatContent = document.getElementById('chatContent');
  const userSelector = document.getElementById('userSelector');


  const socialOffCanvas = new bootstrap.Offcanvas(socialOffCanvasElement);

  function fetchData(url, callback) {
    console.log('Fetching data from:', url);
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

  function populateUserList(users) {
    console.log('Populating user list with data:', users);
    userTableBody.innerHTML = '';
    users.forEach(user => {
      const row = document.createElement('tr');
      row.appendChild(createCell(user.display_name));
      row.appendChild(createStatusCell(user.is_online));
      row.appendChild(createActionsCell(user));
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

  function createActionsCell(user) {
    const cell = document.createElement('td');
    cell.appendChild(createButton('bi bi-person-plus-fill', 'btn btn-primary btn-sm me-2', () => addFriend(user)));
    cell.appendChild(createButton('bi bi-person-lines-fill', 'btn btn-primary btn-sm me-2', () => viewProfile(user)));
    cell.appendChild(createButton('bi bi-chat-dots-fill', 'btn btn-primary btn-sm me-2', () => openChat(user)));
    cell.appendChild(createButton('bi bi-ban', 'btn btn-danger btn-sm', () => blockUser(user)));
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
  }

  function viewProfile(user) {
    console.log(`Viewing profile of ${user.display_name}...`);
    const userProfileModal = document.getElementById('userProfileModal');
    const modal = new bootstrap.Modal(userProfileModal);
    modal.show();
  }

  function openChat(user) {
    const chatTab = document.getElementById('chat-tab');

    chatTab.click();
    userSelector.value = user.id;
    userSelector.dispatchEvent(new Event('change'));
  }

  function blockUser(user) {
    console.log(`Blocking ${user.display_name}...`);
  }

  function populateTournament(data) {
    console.log('Populating tournament with data:', data);
    tournamentContent.innerHTML = data.content;
  }

  // Chat
  function populateChatUserList(users) {
    
    users.forEach(user => {
      const userOption = document.createElement('option');
      userOption.value = user.id;
      userOption.textContent = user.display_name;
      userSelector.appendChild(userOption);
    });
  }

  function populateChat(users) {
    userSelector.innerHTML = `
      <option selected  disabled>---</option>
    `;    
    populateChatUserList(users);
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
});
