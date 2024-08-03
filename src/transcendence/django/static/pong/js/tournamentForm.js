async function loadTournamentSetup() {
  const tournamentSetupForm = document.getElementById('tournament-setup-form');
  const playerCountInputs = document.querySelectorAll('input[name="playerCount"]');
  const playerFieldsContainer = document.getElementById('player-fields-container');
  const playerFieldTemplate = document.getElementById('player-field-template');
  const tournamentFormDiv = document.getElementById('tournament-setup');
  const createTournamentButton = document.getElementById('create-tournament');

  playerCountInputs.forEach(input => {
    input.addEventListener('change', () => {
      tournamentFormDiv.style.display = 'block';
      updatePlayerFields(parseInt(input.value));
    });
  });

  function updatePlayerFields(count) {
    playerFieldsContainer.innerHTML = ''; // Clear existing fields
    for (let i = 1; i <= count; i++) {
      // Create player field HTML
      const fieldHTML = playerFieldTemplate.innerHTML
        .replace(/Player/g, `Player ${i}`)
        .replace(/player2/g, `player${i}`)
        .replace(/tournament-validate-token/g, `tournament-validate-token-${i}`)
        .replace(/tournament-token-warning/g, `tournament-token-warning-${i}`)
        .replace(/tournament-player-guest/g, `tournament-player-guest-${i}`)
        .replace(/tournament-validation-success/g, `tournament-validation-success-${i}`);
      
      // Insert player field HTML into the container
      playerFieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);

      // Ensure the last element is selected correctly
      const lastPlayerField = playerFieldsContainer.lastElementChild;

      if (lastPlayerField) {
        const hiddenInputsHTML = `
          <input type="hidden" name="player${i}_user" id="tournament-player${i}-user" class="player-user-input" value="">
          <input type="hidden" name="player${i}_guest" id="tournament-player${i}-guest" class="player-guest-input" value="">
        `;
        lastPlayerField.insertAdjacentHTML('beforeend', hiddenInputsHTML);
      }
    }
  
    updateFieldDependencies();
    updateCreateTournamentButton();
  
    // Optionally remove the template element if necessary
    if (playerFieldTemplate) {
        playerFieldTemplate.remove();
    }
}

  function updateFieldDependencies() {
    const playerGuestSwitches = document.querySelectorAll('.player-guest-switch');
    playerGuestSwitches.forEach(switchElement => {
      const parent = switchElement.closest('.mb-3');
      const playerSelect = parent.querySelector('.player-select');
      const playerGuest = parent.querySelector('.player-guest');
      const playerUserHidden = parent.querySelector('.player-user-input');
      const playerGuestHidden = parent.querySelector('.player-guest-input');
      const tokenInput = parent.querySelector('.game-token');
      const validateButton = parent.querySelector('.validate-token');
      const validationSuccess = parent.querySelector('.validation-success');
      const tokenWarning = parent.querySelector('.token-warning');
      const tokenContainer = parent.querySelector('.token-container');

      playerGuest.addEventListener('input', () => {
        playerGuestHidden.value = playerGuest.value;
        updateCreateTournamentButton();
      });

      switchElement.addEventListener('change', () => {
        if (switchElement.checked) {
          playerSelect.style.display = 'none';
          playerSelect.removeAttribute('required');
          playerGuest.style.display = 'block';
          playerGuest.value = 'Guest';
          playerUserHidden.value = '';
          playerGuestHidden.value = 'Guest';
          tokenContainer.style.display = 'none';
          validationSuccess.style.display = 'none';
          tokenWarning.style.display = 'none';
        } else {
          playerSelect.style.display = 'block';
          playerSelect.setAttribute('required', 'required');
          playerGuest.style.display = 'none';
          playerUserHidden.value = playerSelect.value;
          playerGuestHidden.value = '';
          tokenContainer.style.display = 'block';
          if (playerSelect.value) {
            validationSuccess.style.display = validateButton.disabled ? 'block' : 'none';
          }
        }
        updateCreateTournamentButton();
      });

      tokenInput.addEventListener("input", function () {
        validateButton.disabled = tokenInput.value.length !== 5;
        tokenWarning.style.display = 'none'; // Hide warning on input
      });

      validateButton.addEventListener("click", function () {
        const playerId = playerSelect.value;
        const token = tokenInput.value;
        const formData = JSON.stringify({ player_id: playerId, game_token: token });
    
        fetch("/game_token/validate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                validationSuccess.style.display = "block";
                tokenInput.disabled = true;
                validateButton.disabled = true;
                playerSelect.disabled = true;
                tokenWarning.style.display = "none";
            } else {
                tokenWarning.style.display = "block";
            }
            updateCreateTournamentButton();
        })
        .catch(error => {
            console.error("Error validating token:", error);
            tokenWarning.style.display = "block";
            updateCreateTournamentButton();
        });
      });
    });

    const playerFields = document.querySelectorAll('.player-select');
    playerFields.forEach(field => {
      field.addEventListener('change', () => {
        const parent = field.closest('.mb-3');
        const playerUserHidden = parent.querySelector('.player-user-input');
        const tokenContainer = parent.querySelector('.token-container');
        const guestInput = parent.querySelector('.player-guest');
        const validationSuccess = parent.querySelector('.validation-success');


        playerUserHidden.value = field.value; // Update hidden input with selected player ID

        if (field.value) {
          tokenContainer.style.display = 'block';
          guestInput.style.display = 'none';
          validationSuccess.style.display = 'none';
        } else {
          tokenContainer.style.display = 'none';
          guestInput.style.display = 'block';
          validationSuccess.style.display = 'none';
        }
        updateCreateTournamentButton();
      });
    });

    updateCreateTournamentButton();
  }

  function updateCreateTournamentButton() {
    const validateButtons = document.querySelectorAll('.validate-token');
    const playerGuestSwitches = document.querySelectorAll('.player-guest-switch');
    const playerFields = document.querySelectorAll('.player-select');
    let allValidated = true;

    validateButtons.forEach((button, index) => {
        const parent = button.closest('.mb-3');
        const switchElement = playerGuestSwitches[index];
        const playerSelect = parent.querySelector('.player-select');
        const validationSuccess = parent.querySelector('.validation-success');

        if (!switchElement.checked) {
            if (!playerSelect.value) {
                allValidated = false;
            } else {
                if (!validationSuccess) {
                    allValidated = false;
                }
            }
        }
    });

    // If there are any player fields without a valid token or without a selected player, disable the button
    const allPlayerFieldsValid = Array.from(playerFields).every(field => {
        const parent = field.closest('.mb-3');
        const switchElement = parent.querySelector('.player-guest-switch');
        const validationSuccess = parent.querySelector('.validation-success');
        
        if (switchElement.checked) {
            return true; // Skip guest players
        }
        
        return validationSuccess.style.display === 'block';
    });

    createTournamentButton.disabled = !allValidated || !allPlayerFieldsValid;
}

  tournamentSetupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(tournamentSetupForm);
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('/tournament/create/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.tournament_id) {
          showSection(`/tournament/${data.tournament_id}/`);
        }
      })
      .catch(error => {
        console.error('Error creating tournament:', error);
      });
  });  
};

window.loadTournamentSetup = loadTournamentSetup;
