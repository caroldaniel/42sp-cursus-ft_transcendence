async function getSectionHTML(section) {
  const response = await fetch(section, {
    method: "GET",
    headers: {
      "X-Custom-Header": "self",
    },
  });
  if (response.status !== 200) return null;
  return await response.text();
}

function setupSection(section) {
  if (section === "/game/") {
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
  } else if (section === "/social/") {
    setupSocial();
  } else if (section === "/profile/") {
    setupProfile();
  } else if (section === "/") {
    setupHome();
  }
}

async function showSection(section) {
  const sectionHtml = await getSectionHTML(section);
  if (sectionHtml === null) return;
  document.getElementById("app").innerHTML = sectionHtml;
  setupSection(section);
  window.history.pushState({}, "", section);
}

function activateSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "flex";
}

function deactivateSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "none";
}

async function isLoggedIn() {
  const response = await fetch("/login/check/", {
    method: "GET",
  });
  if (response.status !== 200) return false;
  return true;
}

window.addEventListener("popstate", async () => {
  // if ((await isLoggedIn()) === false) {
  //   window.location.href = "/login";
  // }
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
