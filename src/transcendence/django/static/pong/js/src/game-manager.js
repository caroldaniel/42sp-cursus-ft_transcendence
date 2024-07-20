async function registerMatch(
  playerLName,
  playerLScore,
  playerRName,
  playerRScore,
) {
  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const formData = new FormData();

  formData.append("user_display_name", playerLName);
  formData.append("user_score", playerLScore);
  formData.append("opponent_display_name", playerRName);
  formData.append("opponent_score", playerRScore);

  const response = await fetch("/game/register/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
    body: formData,
  });

  await response.json();
}

export default class GameManager {
  constructor({ maxScore, gameMode }) {
    this.playerLScore = 0;
    this.playerRScore = 0;
    this.maxScore = maxScore;

    this.targetFrameRate = 1000 / 60; // 60 fps

    this.deltaTime = 0;

    this.previousTime = performance.now();

    this.lastTimeStamp = 0;

    if (gameMode === "tournament") {
      const playerL = sessionStorage.getItem("playerL");
      const playerR = sessionStorage.getItem("playerR");
      document.getElementById("player-l-name").innerHTML = playerL;
      document.getElementById("player-r-name").innerHTML = playerR;
    }

    this.playerLName = document.getElementById("player-l-name").innerHTML;
    this.playerRName = document.getElementById("player-r-name").innerHTML;

    this.popupWinnerName = document.getElementById("popup-winner-name");

    this.playerLSpan = document.getElementById("player-l-score");
    this.playerRSpan = document.getElementById("player-r-score");
    this.playerLSpan.innerHTML = 0;
    this.playerRSpan.innerHTML = 0;

    this.gameOver = false;
    this.gameOverPopUp = document.getElementById("game-over");

    this.unpauseFrame = true;

    this.gameMode = gameMode;
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
      this.popupWinnerName.innerHTML = this.playerLName;
      if (this.gameMode === "tournament") {
        this.setTournamentMatchWinner(this.playerLName);
      } else {
        registerMatch(
          this.playerLName,
          this.playerLScore,
          this.playerRName,
          this.playerRScore,
        );
      }
      this.gameOverPopUp.style.display = "flex";
    }
  }

  increaseRScore() {
    this.playerRScore++;
    this.playerRSpan.innerHTML = this.playerRScore;
    if (this.playerRScore >= this.maxScore) {
      this.gameOver = true;
      this.popupWinnerName.innerHTML = this.playerRName;
      if (this.gameMode === "tournament") {
        this.setTournamentMatchWinner(this.playerRName);
      } else {
        registerMatch(
          this.playerLName,
          this.playerLScore,
          this.playerRName,
          this.playerRScore,
        );
      }
      this.gameOverPopUp.style.display = "flex";
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
    this.gameOverPopUp.style.display = "none";
    this.gameOver = false;
    this.deltaTime = 0;
    this.unpauseFrame = true;
  }

  setTournamentMatchWinner(winner) {
    const currentMatch = Number(sessionStorage.getItem("currentMatch"));

    if (currentMatch >= 0 && currentMatch <= 3) {
      const semiFinals = JSON.parse(sessionStorage.getItem("semiFinals"));
      if (!semiFinals) {
        sessionStorage.setItem("semiFinals", JSON.stringify([winner]));
      } else {
        semiFinals.push(winner);
        sessionStorage.setItem("semiFinals", JSON.stringify(semiFinals));
      }
    } else if (currentMatch >= 4 && currentMatch <= 5) {
      const final = JSON.parse(sessionStorage.getItem("final"));
      if (!final) {
        sessionStorage.setItem("final", JSON.stringify([winner]));
      } else {
        final.push(winner);
        sessionStorage.setItem("final", JSON.stringify(final));
      }
    } else if (currentMatch === 6) {
      sessionStorage.setItem("winner", winner);
    }

    sessionStorage.setItem("currentMatch", currentMatch + 1);
  }
}
