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
  if (section === "/game/" || section.match(/^\/game\/(.+)\/$/)) {
    localStorage.setItem("gameMode", "local");
    startGame();
  } else if (section === "/tournament/game/") {
    startGame();
  } else if (section === "/tournament/") {
    loadTournament();
  } else if (section === "/tournament/create/") {
    loadTournamentForm();
  } else if (section === "/tournament/winner/") {
    setWinner();
  } else if (section === "/profile/") {
    setupProfile();
  } else if (section === "/stats/") {
    setupStats();
  } else if (section === "/") {
    setupHome();
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

function activateSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "flex";
}

function deactivateSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "none";
}

window.addEventListener("popstate", async () => {
  const section = window.location.pathname;
  const sectionHtml = await getSectionHTML(section);
  if (sectionHtml === null) return;
  document.getElementById("app").innerHTML = sectionHtml;
  setupSection(section);
});

window.addEventListener("load", () => {
  const section = window.location.pathname;
  setupSection(section);
});
