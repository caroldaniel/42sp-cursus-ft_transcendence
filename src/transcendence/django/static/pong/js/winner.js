function setWinner() {
  const winnerSpan = document.getElementById("winner");
  const winnerName = localStorage.getItem("winner");
  winnerSpan.innerHTML = winnerName;
}
