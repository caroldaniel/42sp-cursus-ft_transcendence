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
        tournament_id: localStorage.getItem("tournament_id"),
        currentMatch: currentMatch,
        playerL: playerL,
        playerR: playerR,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Notification sent:', data);
  } catch (error) {
    alert("Error sending notification: " + error);
  }
}

function loadTournament() {
  const quartersString = localStorage.getItem("quarters");
  const quarters = JSON.parse(quartersString);

  const semiFinalsString = localStorage.getItem("semiFinals");
  const semiFinals = JSON.parse(semiFinalsString);

  const finalString = localStorage.getItem("final");
  const final = JSON.parse(finalString);

  const winner = localStorage.getItem("winner");

  const currentMatchString = localStorage.getItem("currentMatch");
  const currentMatch = Number(JSON.parse(currentMatchString));

  if (winner) {
    sendNotification(currentMatch, winner, winner);
    showSection("/tournament/winner/");
  }

  const quarterDivs = document.querySelectorAll(".quarter > .player");
  for (let i = 0; i < quarterDivs.length; i++) {
    quarterDivs[i].innerHTML = quarters[i];
  }

  const semiFinalDivs = document.querySelectorAll(".semi > .player");
  if (semiFinals && semiFinals.length > 0) {
    for (let i = 0; i < semiFinals.length; i++) {
      const player = semiFinals[i];
      semiFinalDivs[i].innerHTML = player;
    }
  }

  const finalDivs = document.querySelectorAll("#final > .player");
  if (final && final.length > 0) {
    for (let i = 0; i < final.length; i++) {
      const player = final[i];
      finalDivs[i].innerHTML = player;
    }
  }

  const playerL = document.getElementById("player-l");
  const playerR = document.getElementById("player-r");

  if (currentMatch >= 0 && currentMatch <= 3) {
    playerL.innerHTML = quarters[currentMatch * 2];
    playerR.innerHTML = quarters[currentMatch * 2 + 1];
    sendNotification(currentMatch, playerL.innerHTML, playerR.innerHTML);
  } else if (currentMatch >= 4 && currentMatch <= 5) {
    playerL.innerHTML = semiFinals[(currentMatch - 4) * 2];
    playerR.innerHTML = semiFinals[(currentMatch - 4) * 2 + 1];
    sendNotification(currentMatch, playerL.innerHTML, playerR.innerHTML);
  } else if (currentMatch === 6) {
    playerL.innerHTML = final[0];
    playerR.innerHTML = final[1];
    sendNotification(currentMatch, playerL.innerHTML, playerR.innerHTML);
  }

  localStorage.setItem("playerL", playerL.innerHTML);
  localStorage.setItem("playerR", playerR.innerHTML);
}

window.loadTournament = loadTournament;
