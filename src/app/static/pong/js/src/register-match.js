export default async function registerMatch(
  playerLScore,
  playerRName,
  playerRScore,
) {
  const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const formData = new FormData();

  formData.append("user_score", playerLScore);
  formData.append("opponent_display_name", playerRName);
  formData.append("opponent_score", playerRScore);

  const response = await fetch("/game/register/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
    },
    body: formData,
  });

  await response.json();
}
