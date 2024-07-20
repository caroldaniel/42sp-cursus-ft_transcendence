function setWinner() {
  const winnerSpan = document.getElementById("winner");
  const winnerName = sessionStorage.getItem("winner");
  winnerSpan.innerHTML = winnerName;
  sessionStorage.clear();
  sessionStorage.setItem('tournament_status', 'finished');
}
