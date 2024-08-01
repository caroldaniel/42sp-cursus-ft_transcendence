async function loadGameSetup() {
    // Initialize form and controls
    const gameSetupForm = document.getElementById("game-setup-form");
    if (!gameSetupForm) {
        console.error("Game setup form not found.");
        return;
    }

    const player1GuestSwitch = document.getElementById("player1-guest-switch");
    const player1Select = document.getElementById("player1");
    const player1GuestInput = document.getElementById("player1-guest");

    const player2GuestSwitch = document.getElementById("player2-guest-switch");
    const player2Select = document.getElementById("player2");
    const player2GuestInput = document.getElementById("player2-guest");

    const tokenContainer = document.getElementById("token-container");
    const gameTokenInput = document.getElementById("game-token");
    const validateTokenButton = document.getElementById("validate-token");
    const tokenWarning = document.getElementById("token-warning");
    const startGameButton = document.getElementById("start-game");
    const validationSuccess = document.getElementById("validation-success");

    const player1UserInput = document.getElementById("player1-user");
    const player1GuestHiddenInput = document.getElementById("player1-guest-input");
    const player2UserInput = document.getElementById("player2-user");
    const player2GuestHiddenInput = document.getElementById("player2-guest-input");

    let tokenValidated = false;

    function updateStartButtonState() {
        if ((player2GuestSwitch.checked || (player2Select.value && tokenValidated))) {
            startGameButton.disabled = false;
        } else {
            startGameButton.disabled = true;
        }
    }

    if (player1GuestSwitch) {
        player1GuestSwitch.addEventListener("change", function() {
            if (player1GuestSwitch.checked) {
                player1Select.style.display = "none";
                player1Select.removeAttribute('required');
                player1GuestInput.style.display = "block";
                player1GuestInput.value = "Guest";
                player1UserInput.value = "";
                player1GuestHiddenInput.value = "Guest";
            } else {
                player1Select.style.display = "block";
                player1Select.setAttribute('required', 'required');
                player1GuestInput.style.display = "none";
                player1UserInput.value = player1Select.value;
                player1GuestHiddenInput.value = "";
            }
        });
    }

    player2GuestSwitch.addEventListener("change", function() {
        if (player2GuestSwitch.checked) {
            player2Select.style.display = "none";
            player2Select.removeAttribute('required');
            player2GuestInput.style.display = "block";
            player2GuestInput.value = "Guest";
            tokenContainer.style.display = "none";
            player2UserInput.value = "";
            player2GuestHiddenInput.value = "Guest";
            updateStartButtonState();
        } else {
            player2Select.style.display = "block";
            player2Select.setAttribute('required', 'required');
            player2GuestInput.style.display = "none";
            tokenContainer.style.display = player2Select.value ? "block" : "none";
            player2UserInput.value = player2Select.value;
            player2GuestHiddenInput.value = "";
            updateStartButtonState();
        }
    });

    player2Select.addEventListener("change", function() {
        tokenContainer.style.display = player2Select.value ? "block" : "none";
        player2UserInput.value = player2Select.value;
        tokenValidated = false; // Reset token validation status
        updateStartButtonState();
    });

    gameTokenInput.addEventListener("input", function() {
        validateTokenButton.disabled = gameTokenInput.value.length !== 5;
    });

    validateTokenButton.addEventListener("click", function() {
        const playerId = player2Select.value;
        const token = gameTokenInput.value;
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
                gameTokenInput.disabled = true;
                validateTokenButton.disabled = true;
                player2Select.disabled = true;
                tokenWarning.style.display = "none";
                tokenValidated = true;
            } else {
                tokenWarning.style.display = "block";
                tokenValidated = false;
            }
            updateStartButtonState();
        })
        .catch(error => {
            console.error("Error validating token:", error);
            tokenWarning.style.display = "block";
            tokenValidated = false;
            updateStartButtonState();
        });
    });

    gameSetupForm.addEventListener("submit", async function(event) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        event.preventDefault();

        if (player1GuestSwitch.checked) {
            player1UserInput.value = "";
            player1GuestHiddenInput.value = player1GuestInput.value;
        } else {
            player1UserInput.value = player1Select.value;
            player1GuestHiddenInput.value = "";
        }

        if (player2GuestSwitch.checked) {
            player2UserInput.value = "";
            player2GuestHiddenInput.value = player2GuestInput.value;
        } else {
            player2UserInput.value = player2Select.value;
            player2GuestHiddenInput.value = "";
        }

        const formData = new FormData(gameSetupForm);
        
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

    // Initial state
    updateStartButtonState();
}