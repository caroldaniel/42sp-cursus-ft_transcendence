function sleep(callback, milliseconds) {
  setTimeout(callback, milliseconds);
}

async function updateMatch(
  matchId,
  tournament,
  playerLScore,
  playerRScore,
) {
  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const formData = new FormData();

  formData.append("score_player1", playerLScore);
  formData.append("score_player2", playerRScore);

  if (tournament) {
    formData.append("matchId", matchId);

    const nextMatchResponse = await fetch(`/tournament/next/${tournament}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    });

    await nextMatchResponse.json();
  } else {
    const updateMatchResponse = await fetch(`/match/update/${matchId}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    });
    
    await updateMatchResponse.json();
  }
}

export default class GameManager {
  constructor({ matchId, gameData }) {

    this.matchId = matchId;
    this.playerLScore = gameData.score_player1;
    this.playerRScore = gameData.score_player2;
    this.tournament = gameData.tournament;
    
    this.maxScore = gameData.max_score;

    this.difficulty = gameData.difficulty;
    
    this.targetFrameRate = 1000 / 60;

    this.deltaTime = 0;

    this.previousTime = performance.now();

    this.lastTimeStamp = 0;

    // Set game over buttons
    this.gameOverButtonsDiv = document.getElementById("gameOverButtons");

    // Set player name divs
    this.playerLName = document.getElementById("player-l-name");
    this.playerLName.textContent = gameData.player1;
    this.playerRName = document.getElementById("player-r-name");
    this.playerRName.textContent = gameData.player2;

    // Set initial score on divs
    this.playerLSpan = document.getElementById("player-l-score");
    this.playerLSpan.innerHTML = gameData.score_player1;
    this.playerRSpan = document.getElementById("player-r-score");
    this.playerRSpan.innerHTML = gameData.score_player2;

    if (gameData.tournament) {
      const backToTournamentButton = document.createElement("button");
      backToTournamentButton.textContent = "Back to Tournament";
      backToTournamentButton.classList.add("btn", "btn-primary", "m-2");
      backToTournamentButton.setAttribute("data-bs-dismiss", "modal");
      backToTournamentButton.addEventListener("click", () => {
        showSection(`/tournament/${gameData.tournament}/`);
      });
      this.gameOverButtonsDiv.appendChild(backToTournamentButton);
    } else {
      // Add normal buttons: Restart and Back to match list
      const newMatchButton = document.createElement("button");
      newMatchButton.textContent = "New Match";
      newMatchButton.classList.add("btn", "btn-primary", "m-2");
      newMatchButton.setAttribute("data-bs-dismiss", "modal");
      newMatchButton.addEventListener("click", () => {
        showSection('/match/setup/');
      });
      const backToHomeButton = document.createElement("button");
      backToHomeButton.textContent = "Back to Home Page";
      backToHomeButton.classList.add("btn", "btn-secondary", "m-2");
      backToHomeButton.setAttribute("data-bs-dismiss", "modal");
      backToHomeButton.addEventListener("click", () => {
        showSection("/");
      });
      this.gameOverButtonsDiv.appendChild(newMatchButton);
      this.gameOverButtonsDiv.appendChild(backToHomeButton);
    }
    this.gameOver = gameData.game_over;

    this.unpauseFrame = true;
  }

  resetScore() {
    this.playerLScore = 0;
    this.playerRScore = 0;
    this.playerLSpan.innerHTML = this.playerLScore;
    this.playerRSpan.innerHTML = this.playerRScore;
  }

  increaseLScore() {
    this.playerLScore++;
    this.playerLSpan.innerHTML = this.playerLScore;
    if (this.playerLScore >= this.maxScore) {
      this.gameOver = true;
      updateMatch(
        this.matchId,
        this.tournament,
        this.playerLScore,
        this.playerRScore
      );
      sleep(() => {
        showGameResultModal(this);
      }, 500);
    }
  }

  increaseRScore() {
    this.playerRScore++;
    this.playerRSpan.innerHTML = this.playerRScore;
    if (this.playerRScore >= this.maxScore) {
      this.gameOver = true;
      updateMatch(
        this.matchId,
        this.tournament,
        this.playerLScore,
        this.playerRScore
      );
      sleep(() => {
        showGameResultModal(this);
      }, 500);
    }
  }

  updateDeltaTime(timestamp) {
    if (this.unpauseFrame) {
      this.lastTimeStamp = timestamp;
      this.unpauseFrame = false;
      return;
    }
    this.deltaTime = (timestamp - this.lastTimeStamp) / this.targetFrameRate;
    if (this.deltaTime > 1) this.deltaTime = 1;

    this.lastTimeStamp = timestamp;
  }

  resetGame() {
    this.resetScore();
    this.gameOver = false;
    this.deltaTime = 0;
    this.unpauseFrame = true;
  }
}