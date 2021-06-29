(function() {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var params = getHashParams();

    var access_token = params.access_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
    
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              userProfilePlaceholder.innerHTML = userProfileTemplate(response);

              $('#login').hide();
              setUpGame(access_token);
              $('#loggedin').show();
            }
        });
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }
    }
  })();

  
function updateStreak(streak){
    document.getElementById("streak").innerText = streak;
}

function setUpGame(token) {
    let songName = '';
    const form = document.getElementById("guess");
    const songGuess = document.getElementById("title");
    let tracks;
    let tracksGuessed=0;
    let streak = 0;

    function setTrack(trackName, previewSource) {
        console.log(trackName);
        songName = trackName;
        source.setAttribute("src", previewSource);
        player.load();
    }

    form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    console.log(songGuess.value);

    if (songGuess.value == "") {
    
        console.log(tracks[tracksGuessed]);
        streak = 0;
        document.getElementById("result").innerText = "Skipped! " + tracks[tracksGuessed].name + " - " + tracks[tracksGuessed].artists[0].name;
        tracksGuessed++;
        setTrack(tracks[tracksGuessed].name, tracks[tracksGuessed].preview_url);
    }
    else if (songGuess.value.toUpperCase() == songName.toUpperCase()) {
        document.getElementById("result").innerText = "Correct!";
        tracksGuessed++; streak++;
        setTrack(tracks[tracksGuessed].name, tracks[tracksGuessed].preview_url);
    }
    else {
        console.log(tracks[tracksGuessed]);
        streak = 0;
        document.getElementById("result").innerText = "Wrong! " + tracks[tracksGuessed].name + " - " + tracks[tracksGuessed].artists[0].name;
        tracksGuessed++;
        setTrack(tracks[tracksGuessed].name, tracks[tracksGuessed].preview_url);
    }
    updateStreak(streak);
    });

    const player = document.getElementById("audio");
    const source = document.getElementById("audio_source")
   
    const TEST_URL="https://api.spotify.com/v1/recommendations?seed_genres=rock";
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
}