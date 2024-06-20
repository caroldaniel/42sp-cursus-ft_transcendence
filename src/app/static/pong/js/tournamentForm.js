function loadTournamentForm() {
  const tournamentForm = document.getElementById("tournament-form");

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  tournamentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const players = [];
    for (let i = 1; i <= 8; i++) {
      const playerName = document.getElementById(`player-${i}`).value;
      if (playerName === "") players.push(`Player ${i}`);
      else players.push(playerName);
    }

    const quarters = shuffle(players);

    localStorage.clear();
    localStorage.setItem("gameMode", "tournament");
    localStorage.setItem("quarters", JSON.stringify(quarters));
    localStorage.setItem("currentMatch", "0");

    showSection("/tournament/");
  });
}

window.loadTournamentForm = loadTournamentForm;
