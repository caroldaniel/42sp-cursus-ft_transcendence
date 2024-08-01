let currentRoute = null;

async function getSectionHTML(section) {
  try {
    const response = await fetch(section, {
      method: "GET",
      headers: {
        "X-Custom-Header": "self",
      },
    });

    // Check if the response is successful (status 200)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check if the response is HTML content
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      throw new Error("Expected HTML content type");
    }

    // Return the HTML content as text
    return await response.text();
  } catch (error) {
    console.error("Error fetching section:", error);
    return null; // Handle error gracefully, return null or handle in calling function
  }
}

function setupSection(section) {
  if (currentRoute && currentRoute.startsWith("/game/") && !section.startsWith("/game/")) {
    // User is leaving the game route
    stopGame();
    updateMatchResultToWO();
  }
  currentRoute = section;

  if (section.startsWith("/game/")) {
    const matchId = getMatchIdFromRoute(section);
    startGame(matchId);
  } else if (section === "/match/setup/") {
    loadGameSetup();
  } else if (section === "/tournament/game/") {
    startGame();
  } else if (section === "/tournament/") {
    loadTournament();
  } else if (section === "/tournament/form/") {
    loadTournamentForm();
  } else if (section === "/tournament/winner/") {
    setWinner();
  } else if (section === "/profile/") {
    setupProfile();
  } else if (section === "/stats/") {
    setupStats();
  } else if (section === "/") {
    setupHome();
  } else {
    return;
  }
}

async function showSection(section) {
  try {
    const sectionHtml = await getSectionHTML(section);

    // Handle cases where fetching HTML fails
    if (sectionHtml === null) {
      console.error(`Failed to fetch or invalid HTML for section: ${section}`);
      return;
    }

    // Update the #app element with the fetched HTML content
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.innerHTML = sectionHtml;
    } else {
      console.error(`#app element not found`);
      return;
    }

    // Perform additional setup based on the loaded section
    setupSection(section);

    // Update browser history state and URL
    if (window.location.pathname !== section) {
      window.history.pushState({}, "", section);
    }
  } catch (error) {
    console.error(`Error while showing section ${section}:`, error);
    // Handle errors as needed, e.g., display an error message or fallback content
  }
}

// Function to send AJAX request to update match result to 'wo'
function updateMatchResultToWO() {
  const matchId = getMatchIdFromRoute(currentRoute);
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  
  fetch(`/match/update_wo/${matchId}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log("Match result updated to 'wo':", data);
    })
    .catch(error => {
      console.error("Error updating match result to 'wo':", error);
    });
}

// Function to extract match_id from the route
function getMatchIdFromRoute(route) {
  const match = route.match(/\/game\/([0-9a-fA-F-]+)\//);
  return match ? match[1] : null;
}

// Function to initialize the current tab
window.addEventListener("load", () => {
  const section = window.location.pathname;
  setupSection(section);
});

// Handle tab close event
window.addEventListener("beforeUnload", () => {
  if (currentRoute.startsWith("/game/")) {
    const matchId = getMatchIdFromRoute(currentRoute);
    if (matchId) {
      stopGame();
      updateMatchResultToWO(matchId);
    }
  }
});

// Handle back and forward navigation
window.addEventListener("popstate", async () => {
  const section = window.location.pathname;
  const sectionHtml = await getSectionHTML(section);
  if (sectionHtml === null) return;
  document.getElementById("app").innerHTML = sectionHtml;
  setupSection(section);
});
