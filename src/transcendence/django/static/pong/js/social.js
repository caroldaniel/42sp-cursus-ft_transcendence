document.addEventListener('DOMContentLoaded', function () {
  const openSocialOffCanvas = document.getElementById('openSocialOffCanvas');
  const socialOffCanvasElement = document.getElementById('socialOffCanvas');
  const currentUser = document.getElementById('displayNameSpan').textContent;
  // User
  const userTableBody = document.querySelector('#userTable tbody');
  // Tournament
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
    var languageDropdown = document.getElementById('languageDropdown');
    var languageCode = languageDropdown.getAttribute('data-language');

    const messages = {
        'en': "No users found",
        'pt': "Nenhum usuário encontrado",
        'es': "No se encontraron usuarios",
        'fr': "Aucun utilisateur trouvé"
    };

    const content = messages[languageCode] || messages['en'];

    const users = data.users;
    userTableBody.innerHTML = '';

    // Verificar se há algum usuário registrado
    if (users.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = content;
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
      cell.appendChild(createButton('bi bi-person-lines-fill', 'btn btn-primary btn-sm me-2', () => viewProfile(user)));
      cell.appendChild(createButton('bi bi-person-dash-fill', 'btn btn-primary btn-sm btn-sm me-2', () => removeFriend(user.id)));
    }
    if(!isBlocked){
      cell.appendChild(createButton('bi bi-joystick', 'btn btn-primary btn-sm me-2', () => playPong(user)));
      cell.appendChild(createButton('bi bi-chat-dots-fill', 'btn btn-primary btn-sm me-4', () => openChat(user), `unreadMessagesBadge_${user.id}`));
      cell.appendChild(createButton('bi bi-lock', 'btn btn-danger btn-sm', () => blockUser(user)));
    } else
      cell.appendChild(createButton('bi bi-unlock', 'btn btn-success btn-sm', () => unblockUser(user)));
    return cell;
  }

  function createButton(iconClass, buttonClass, onClick, badgeId = null) {
    var languageDropdown = document.getElementById('languageDropdown');
    var languageCode = languageDropdown.getAttribute('data-language');

    const buttonContentMap = {
        'en': {
            'bi bi-chat-dots-fill': 'Chat',
            'bi bi-joystick': 'Play Pong',
            'bi bi-person-lines-fill': 'View Profile',
            'bi bi-person-plus-fill': 'Add Friend',
            'bi bi-person-dash-fill': 'Remove Friend',
            'bi bi-person-check-fill': 'Accept Friend Request',
            'bi bi-person-x-fill': 'Deny Friend Request',
            'bi bi-person-fill-exclamation': 'Friend Request Sent',
            'bi bi-lock': 'Block User',
            'bi bi-unlock': 'Unblock User'
        },
        'pt': {
            'bi bi-chat-dots-fill': 'Chat',
            'bi bi-joystick': 'Jogar Pong',
            'bi bi-person-lines-fill': 'Ver Perfil',
            'bi bi-person-plus-fill': 'Adicionar Amigo',
            'bi bi-person-dash-fill': 'Remover Amigo',
            'bi bi-person-check-fill': 'Aceitar Pedido de Amizade',
            'bi bi-person-x-fill': 'Recusar Pedido de Amizade',
            'bi bi-person-fill-exclamation': 'Pedido de Amizade Enviado',
            'bi bi-lock': 'Bloquear Usuário',
            'bi bi-unlock': 'Desbloquear Usuário'
        },
        'es': {
            'bi bi-chat-dots-fill': 'Chat',
            'bi bi-joystick': 'Jugar Pong',
            'bi bi-person-lines-fill': 'Ver Perfil',
            'bi bi-person-plus-fill': 'Agregar Amigo',
            'bi bi-person-dash-fill': 'Eliminar Amigo',
            'bi bi-person-check-fill': 'Aceptar Solicitud de Amistad',
            'bi bi-person-x-fill': 'Rechazar Solicitud de Amistad',
            'bi bi-person-fill-exclamation': 'Solicitud de Amistad Enviada',
            'bi bi-lock': 'Bloquear Usuario',
            'bi bi-unlock': 'Desbloquear Usuario'
        },
        'fr': {
            'bi bi-chat-dots-fill': 'Chat',
            'bi bi-joystick': 'Jouer à Pong',
            'bi bi-person-lines-fill': 'Voir le Profil',
            'bi bi-person-plus-fill': 'Ajouter un Ami',
            'bi bi-person-dash-fill': 'Supprimer un Ami',
            'bi bi-person-check-fill': 'Accepter la Demande d\'Ami',
            'bi bi-person-x-fill': 'Refuser la Demande d\'Ami',
            'bi bi-person-fill-exclamation': 'Demande d\'Ami Envoyée',
            'bi bi-lock': 'Bloquer l\'Utilisateur',
            'bi bi-unlock': 'Débloquer l\'Utilisateur'
        }
    };

    // Pega o conteúdo do botão com base no idioma atual
    let buttonContent = buttonContentMap[languageCode]?.[iconClass] || buttonContentMap['en'][iconClass];

    const button = document.createElement('button');
    button.className = buttonClass;
    button.setAttribute('data-bs-toggle', 'popover');
    button.setAttribute('data-bs-placement', 'bottom');
    button.setAttribute('data-popover', 'true');

    if (buttonContent) {
        button.setAttribute('data-bs-content', buttonContent);
    }

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

    var popover = new bootstrap.Popover(button, {
        trigger: 'manual'
    });

    button.addEventListener('mouseenter', function() {
        popover.show();
    });

    button.addEventListener('mouseleave', function() {
        popover.hide();
    });

    button.addEventListener('click', function() {
        popover.hide();
    });

    return button;
}

  function playPong(user) {
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
    startGameButton.addEventListener('click', async () => {
        modal.hide();
        socialOffCanvas.hide();
        const formData = new FormData();
        //get id of the current user
        const response = await fetch(`/users/me/`)
        const data = await response.json();
        formData.append('player1_user', data.id);
        formData.append('player2_user', user.id);
        formData.append('player1_guest', '');
        formData.append('player2_guest', '');
        formData.append('difficulty', '1');
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        try {
          const response = await fetch("/match/create/", {
              method: "POST",
              headers: {
                  "X-CSRFToken": csrfToken
              },
              body: formData
          });

          const data = await response.json();
          if (response.ok && data.match_id) {
              showSection(`/game/${data.match_id}/`);
          } else {
              console.error("Failed to create match or retrieve match ID");
          }
      } catch (error) {
          console.error("Error creating match:", error);
      }
  });

    infosDiv.appendChild(tokenInput);
    infosDiv.appendChild(errorMessage);
    infosDiv.appendChild(submitButton);
    infosDiv.appendChild(startGameButton);

    modalgameTokenContent.appendChild(infosDiv);
  }

  function addFriend(user) {
    sendFriendRequest(user.display_name);
  }

  function viewProfile(user) {
    const userProfileModal = document.getElementById('userProfileModal');
    const modal = new bootstrap.Modal(userProfileModal);
    const modalBody = userProfileModal.querySelector('.modal-body');
    fetch(`/users/profile/${user.id}/`)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const modalUserProfileContent = doc.getElementById('modalUserProfileContent');
        if (modalUserProfileContent) {
          modalBody.querySelector('#modalUserProfileContent').innerHTML = modalUserProfileContent.innerHTML;
        }
      })

    fetch(`/stats/${user.id}/`)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const profileUserContent = doc.getElementById('userStatsContent');
        if (profileUserContent) {
          const modalUserStatsContent = modalBody.querySelector('#modalUserStatsContent');
          modalUserStatsContent.innerHTML = '';
          const infosDiv = document.createElement('div');
          infosDiv.className = 'text-center';
          modalUserStatsContent.appendChild(infosDiv);
          infosDiv.appendChild(profileUserContent);
          modalUserStatsContent.appendChild(infosDiv);
        } else {
          console.error('userProfileContent div not found in the response');
        }
      })
      .catch(error => console.error('Erro:', error));    


      modal.show();
  }

  function openChat(user) {
    const chatTab = document.getElementById('chat-tab');
    setNewUserDefault(user.id);

    chatTab.click();
  }

  async function blockUser(user) {
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
      
      fetchData('/users/list/', populateUserList);
      } catch (error) {
        console.error('Error fetching block user:', error.message);
    }
  }

  async function unblockUser(user) {
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

        fetchData('/users/list/', populateUserList);
      } catch (error) {
        console.error('Error fetching unblock user:', error.message);
    }
  }

  function createTournamentCardBody(tournament) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card text-center h-100 mb-2 mt-2';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardDiv.appendChild(cardBody);

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = tournament.name;
    cardBody.appendChild(cardTitle);

    const cardText = document.createElement('p');
    cardText.className = 'card-text';

    const finishedStages = ['Finished', 'Terminé', 'Terminado', 'Concluído'];
    cardText.textContent = tournament.current_stage;

    if (finishedStages.includes(tournament.current_stage)) {
      cardText.className = 'fw-bold text-success';
    } else {
      cardText.className = 'fw-bold text-danger';
    }
    cardBody.appendChild(cardText);

    const cardText2 = document.createElement('p');
    cardText2.className = 'card-text';

    cardText2.textContent = tournament.current_match;
    cardBody.appendChild(cardText2);

    if (tournament.was_created_by_me && tournament.current_stage !== 'Finished') {
      const button = document.createElement('button');
      button.className = 'btn btn-primary';
      button.textContent = 'View';
      button.addEventListener('click', () => {
        socialOffCanvas.hide();
        showSection(`/tournament/${tournament.id}/`);
      });
      cardBody.appendChild(button);
    }

    return cardDiv;
  }

  function populateTournament(data) {
    tournamentTableBody.innerHTML = '';
    var languageDropdown = document.getElementById('languageDropdown');
    var languageCode = languageDropdown.getAttribute('data-language');

    const messages = {
        'en': "No tournaments found",
        'pt': "Nenhum torneio encontrado",
        'es': "No se encontraron torneos",
        'fr': "Aucun utilisateur trouvé"
    };

    const content = messages[languageCode] || messages['en'];

    if (data.tournaments.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = content;
      row.appendChild(cell);
      tournamentTableBody.appendChild(row);
      return;
    }
    
    data.tournaments.forEach(tournament => {
      tournamentTableBody.appendChild(createTournamentCardBody(tournament));
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
      return false;
    }
    fetchData('/users/list/', populateUserList);
  }
});