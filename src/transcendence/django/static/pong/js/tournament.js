async function sendNotification(currentMatch, playerL, playerR) {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  try {
    const response = await fetch("/tournament/warning/", { 
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({
        currentMatch: currentMatch,
        playerL: playerL,
        playerR: playerR,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    alert("Error sending notification: " + error);
  }
}

async function loadTournament(tournamentId) {
  console.log(tournamentId);

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
    console.log("Error loading tournament:", response.status);
    return;
  }

  const data = await response.json();
  console.log(data);

  if (data.winner) {
    sendNotification(currentMatch, data.winner, data.winner);
    showSection("/tournament/winner/");
  }

  // Get all player names in order
  const players = [];
  data.matches.forEach(match => {
    players.push(match.player1);
    players.push(match.player2);
  });
  console.log(players);

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

  // const playerL = document.getElementById("player-l");
  // const playerR = document.getElementById("player-r");

  // if (currentMatch >= 0 && currentMatch <= 3) {
  //   playerL.innerHTML = quarters[currentMatch * 2];
  //   playerR.innerHTML = quarters[currentMatch * 2 + 1];
  //   sendNotification(currentMatch, playerL.innerHTML, playerR.innerHTML);
  // } else if (currentMatch >= 4 && currentMatch <= 5) {
  //   playerL.innerHTML = semiFinals[(currentMatch - 4) * 2];
  //   playerR.innerHTML = semiFinals[(currentMatch - 4) * 2 + 1];
  //   sendNotification(currentMatch, playerL.innerHTML, playerR.innerHTML);
  // } else if (currentMatch === 6) {
  //   playerL.innerHTML = final[0];
  //   playerR.innerHTML = final[1];
  //   sendNotification(currentMatch, playerL.innerHTML, playerR.innerHTML);
  // }
}

window.loadTournament = loadTournament;
