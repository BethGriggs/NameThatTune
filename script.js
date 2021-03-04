let songName = '';
const form = document.getElementById("guess");
const songGuess = document.getElementById("title");
let tracks;
let tracksGuessed=0;

function setTrack(trackName, previewSource) {
  console.log(trackName);
  songName = trackName;
  source.setAttribute("src", previewSource);
  player.load();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  console.log(songGuess.value);
  if (songGuess.value.toUpperCase() == songName.toUpperCase()) {
    document.getElementById("result").innerText = "Correct!";
    tracksGuessed++;
    setTrack(tracks[tracksGuessed].name, tracks[tracksGuessed].preview_url);
  }
  else {
    document.getElementById("result").innerText = "Wrong!";
  }
});

  const player = document.getElementById("audio");
  const source = document.getElementById("audio_source")
  const token = "TBD";
  const TEST_URL="https://api.spotify.com/v1/recommendations?seed_genres=alt-rock";
    fetch(TEST_URL, {
      headers: new Headers({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      })}, )
    .then(response => response.json())
    .then(data => {
      tracks = data.tracks.filter(track => track.preview_url !== null);
      setTrack(tracks[0].name, tracks[0].preview_url);
    });

