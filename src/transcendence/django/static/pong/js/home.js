function setupHome() {
  const avatar = document.querySelector(".avatar");
  if (avatar.id === "/static/pong/img/default_avatar.svg")
    avatar.src = avatar.id;
  else avatar.src = `/media/${avatar.id}`;
}
