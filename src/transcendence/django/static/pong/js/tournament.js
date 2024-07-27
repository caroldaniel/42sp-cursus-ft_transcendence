export async function saveSessionStorageToServer() {
  console.log('Saving sessionStorage to the server...');
  // Create an object to store all sessionStorage items
  const sessionData = {};

  // Iterate over all sessionStorage items
  for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      sessionData[key] = value;
  }

  // Convert the object to JSON
  const jsonData = JSON.stringify(sessionData);
  const csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

  // Send the JSON to the server using fetch
  await fetch('/session/set/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfmiddlewaretoken,
      },
      body: jsonData,
  })
  .then(response => response.json())
  .then(data => {
      return;
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

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

async function loadTournament() {
  const quartersString = sessionStorage.getItem("quarters");
  const quarters = JSON.parse(quartersString);

  const semiFinalsString = sessionStorage.getItem("semiFinals");
  const semiFinals = JSON.parse(semiFinalsString);

  const finalString = sessionStorage.getItem("final");
  const final = JSON.parse(finalString);

  const winner = sessionStorage.getItem("winner");
  const numPlayers = parseInt(sessionStorage.getItem("numPlayers"), 10);

  const currentMatchString = sessionStorage.getItem("currentMatch");
  const currentMatch = Number(JSON.parse(currentMatchString));

  if (winner) {
    sendNotification(currentMatch, winner, winner);
    showSection("/tournament/winner/");
  }

  if (numPlayers === 8){
    const quarterDivs = document.querySelectorAll(".quarter > .player");
    for (let i = 0; i < quarterDivs.length; i++) {
      quarterDivs[i].innerHTML = quarters[i];
    }
  }
  else if (numPlayers === 4) {
    const quarterFinalsDiv = document.getElementById("quarterFinals");
    quarterFinalsDiv.style.display = "none";
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

  sessionStorage.setItem("playerL", playerL.innerHTML);
  sessionStorage.setItem("playerR", playerR.innerHTML);
  await saveSessionStorageToServer();
}

window.loadTournament = loadTournament;
