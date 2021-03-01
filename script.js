let songName = '';
const form = document.getElementById("guess");
const songGuess = document.getElementById("title");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  console.log(songGuess.value);
  if (songGuess.value.toUpperCase() == songName.toUpperCase()) {
  document.getElementById("result").innerText = "Correct!";
  }
  else {
    document.getElementById("result").innerText = "Wrong!";
  }
});

  const player = document.getElementById("audio");
  const source = document.getElementById("audio_source")
  const TEST_URL="https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl?market=ES";
    fetch(TEST_URL)
    .then(response => response.json())
    .then(data => {
      songName = data.name;
      source.setAttribute("src", data.preview_url);
      player.load();
    });