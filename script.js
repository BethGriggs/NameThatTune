function getHashParams() {
  let hash = window.location.hash;
  return new URLSearchParams(hash.substr(1));
}

const userProfileSource = document.getElementById('user-profile-template').innerHTML,
  userProfileTemplate = Handlebars.compile(userProfileSource),
  userProfilePlaceholder = document.getElementById('user-profile');

const params = getHashParams();

const access_token = params.get("access_token"),
  error = params.get("error");

const player = document.getElementById("audio");
const source = document.getElementById("audio_source");
const name = document.getElementById("name");
const artist = document.getElementById("artist");
const artwork = document.getElementById("artwork");

// Game setup 
let songName = '';
const form = document.getElementById("guess");
const songGuess = document.getElementById("title");
let tracks;
let tracksGuessed = 0;
let streak = 0;

if (error) {
  alert('There was an error during the authentication');
} else {
  if (access_token) {
    fetch('https://api.spotify.com/v1/me', {
      headers: {
            'Authorization': 'Bearer ' + access_token
          },
    }).then(response => response.json())
      .then((data) => {
        console.log(data);
        userProfilePlaceholder.innerHTML = userProfileTemplate(data);
        $('#login').hide();
        setUpGame(access_token);
        $('#loggedin').show();
    });
  } else {
    // render initial screen
    $('#login').show();
    $('#loggedin').hide();
  }
}

function setTrack(track) {
  songName = track.name;
  source.setAttribute("src", track.preview_url);
  player.load();
}

function skippedTrack() {
  streak = 0;
  document.getElementById("result").innerText = "Skipped!";
}

function wrongTrack() {
  streak = 0;
  document.getElementById("result").innerText = "Wrong!";
}

function correctTrack() {
  streak = streak + 1;
  console.log(streak);
  document.getElementById("result").innerText = "Correct!";
}

function updateStreak() {
  console.log(streak, "+++");
  document.getElementById("streak").innerText = streak;
}

function getNextTrack() {
  if (tracksGuessed >= tracks.length) {
    document.getElementById("result").innerText = "No moar tracks!";
  }
  return tracks[tracksGuessed];
}

function fetchTracks() {
  const TEST_URL = "https://api.spotify.com/v1/recommendations?seed_genres=rock&limit=100";
  fetch(TEST_URL, {
      headers: new Headers({
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      })
    }, )
    .then(response => response.json())
    .then(data => {
      console.log(" tracks:", data.tracks[0]);
      tracks = data.tracks.filter(track => track.preview_url !== null);
      setTrack(tracks[0]);
    });
}

function setLastTrack() {
  let trackid = tracks[tracksGuessed].id;
  fetch('https://api.spotify.com/v1/tracks/' + trackid, {
    headers: new Headers({
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    })
  }, )
  .then(response => response.json())
  .then(data => {
    console.log(data);
    console.log(data.name);
    name.innerText = data.name;
    artist.innerText = data.artists[0].name;
    artwork.setAttribute("src", data.album.images[0].url);
  });

}

function setUpGame(token) {
  fetchTracks();
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // log the track for debugging
    console.log(tracks[tracksGuessed]);

    if (songGuess.value == "") {
      skippedTrack();
    } else if (songGuess.value.toUpperCase() == songName.toUpperCase()) {
      correctTrack()
    } else {
      wrongTrack();
    }

    setLastTrack();
    tracksGuessed++;
    updateStreak();
    setTrack(getNextTrack());
  });
}