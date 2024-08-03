async function loadTournament(tournamentId) {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const formData = new FormData();
  formData.append("tournamentId", tournamentId);
  const response = await fetch(`/tournament/info/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken
    },
    body: formData
  });

  if (!response.ok) {
    return;
  }

  const data = await response.json();
  if (data.winner) {
    showSection(`/tournament/winner/${tournamentId}/`);
    return;
  }

  // Get all player names in order
  const players = [];
  data.matches.forEach(match => {
    players.push(match.player1);
    players.push(match.player2);
  });

  let quarters = [];
  let semiFinals = [];
  let final = [];

  if (data.player_count === 8) {
    quarters = players.slice(0, 8);
    semiFinals = players.slice(8, 12);
    final = players.slice(12, 14);
  } else if (data.player_count === 4) {
    semiFinals = players.slice(0, 4);
    final = players.slice(4, 6);
  }

  if (data.player_count === 8){
    const quarterDivs = document.querySelectorAll(".quarter > .player");
    for (let i = 0; i < quarters.length ; i++) {
      quarterDivs[i].innerHTML = quarters[i];
    }
  } else if (data.player_count === 4) {
    const quarterFinalsDiv = document.getElementById("quarterFinals");
    quarterFinalsDiv.style.display = "none";
  }

  const semiFinalDivs = document.querySelectorAll(".semi > .player");
  for (let i = 0; i < semiFinals.length; i++) {
    if (semiFinals[i] !== 'TBD') {
      semiFinalDivs[i].innerHTML = semiFinals[i];
    }
  }

  const finalDivs = document.querySelectorAll("#final > .player");
  for (let i = 0; i < final.length; i++) {
    if (final[i] !== 'TBD') {
      finalDivs[i].innerHTML = final[i];
    }
  }

  const playerL = document.getElementById("player-l");
  const playerR = document.getElementById("player-r");

  playerL.innerHTML = data.current_match.player1;
  playerR.innerHTML = data.current_match.player2;

  const playNextMatchButton = document.getElementById("play-next-match");
  playNextMatchButton.addEventListener("click", () => {
    showSection("/tournament/game/"+data.current_match.match_id+"/");
  });
}

window.loadTournament = loadTournament;
