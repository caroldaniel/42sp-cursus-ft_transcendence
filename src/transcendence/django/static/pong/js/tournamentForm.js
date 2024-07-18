async function getUserList() {
  try {
    const response = await fetch('/users/list/');
    const data = await response.json();
    const userList = data.users;
    return userList;
  } catch (error) {
    console.error('Error fetching user list:', error);
    return [];
  }
}

async function createTournament(registeredPlayers) {
  try {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const response = await fetch('/tournament/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        players: registeredPlayers,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    localStorage.setItem('tournament_id', data.tournament_id);
    localStorage.setItem('tournament_status', 'created');
  } catch (error) {
    console.error('Error creating tournament:', error);
  }
}

function checkTokens(players, registeredPlayers, userList) {
  let state = false;
  for (let i = 0; i < players.length; i++) {
    if (registeredPlayers.includes(players[i])) {
      const playerIndex = i + 1;
      const playerInput = document.getElementById(`player-${playerIndex}`).value;
      const gameTokenInput = document.getElementById(`game-token-${playerIndex}`).value;
      const user = userList.find(user => user.display_name === playerInput);
      const playerDiv = document.getElementById(`div-player-${playerIndex}`);

      if (user && user.game_token !== gameTokenInput) {
        state = true;
        if (gameTokenInput === "") continue;
        const errorMessage = document.createElement("p");
        errorMessage.className = "error";
        errorMessage.innerHTML = "❌ Invalid game token. Please try again";
        errorMessage.style.color = "red";
        playerDiv.appendChild(errorMessage);
      } else {
        const successMessage = document.createElement("p");
        successMessage.className = "success";
        successMessage.innerHTML = "✔️ Game token verified";
        successMessage.style.color = "green";
        playerDiv.appendChild(successMessage);
      }
    }
  }
  return state;
}

async function loadTournamentForm() {
  const tournamentForm = document.getElementById("tournament-form");

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  tournamentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear previous messages
    clearMessages();

    // Check if players have the same name or are empty
    const players = getPlayers();
    if (players) {
      const userList = await getUserList();
      const registeredPlayers = getRegisteredPlayers(players, userList);

      // Check if players are registered
      if (registeredPlayers.length > 0) {
        handleRegisteredPlayers(registeredPlayers, players);
      }

      // Check if players have valid game tokens and show messages accordingly
      const needCheckToken = checkTokens(players, registeredPlayers, userList);

      // If all game tokens are valid, shuffle players and save them to local storage
      if (needCheckToken === false) {
        const quarters = shuffle(players);
        localStorage.clear();
        localStorage.setItem("gameMode", "tournament");
        localStorage.setItem("quarters", JSON.stringify(quarters));
        localStorage.setItem("currentMatch", "0");
        await createTournament(registeredPlayers);
        showSection("/tournament/");
      }
    }
  });
}

function clearMessages() {
  const errorMessages = document.querySelectorAll(".error");
  errorMessages.forEach((errorMessage) => {
    errorMessage.remove();
  });
  const successMessages = document.querySelectorAll(".success");
  successMessages.forEach((successMessage) => {
    successMessage.remove();
  });
}

// Get players from the form and check if they have the same name or are empty
function getPlayers() {
  const players = [];
  for (let i = 1; i <= 8; i++) {
    const playerName = document.getElementById(`player-${i}`);
    const userPlayerName = document.getElementById(`player-${i - 1}`);

    if (userPlayerName && userPlayerName.value === playerName.value || players.includes(playerName.value)) {
      const errorMessage = document.createElement("p");
      errorMessage.className = "error";
      errorMessage.innerHTML = "* Players must have different names";
      errorMessage.style.color = "red";
      playerName.parentNode.appendChild(errorMessage);
      return null;
    }

    if (playerName.value === "") {
      players.push(`Player ${i}`);
      playerName.value = `Player ${i}`;
    } else {
      players.push(playerName.value);
    }

    playerName.disabled = true;
  }
  return players;
}

function getRegisteredPlayers(players, userList) {
  return players.filter(player => userList.find(user => user.display_name === player));
}

function handleRegisteredPlayers(registeredPlayers, players) {
  registeredPlayers.forEach((player, index) => {
    const playerIndex = players.indexOf(player) + 1;
    const gameTokenInput = document.getElementById(`game-token-${playerIndex}`);

    // Show game token input and set it as required to registered players
    if (gameTokenInput) {
      gameTokenInput.type = "text";
      gameTokenInput.required = true;
    }
    // Disable inputs for registered players and set their names
    if (playerIndex !== index + 1) {
      const playerInput = document.getElementById(`player-${playerIndex}`);
      playerInput.value = player;
      playerInput.disabled = true;
    }
  });
}

window.loadTournamentForm = loadTournamentForm;
