/*jsl:import base.js*/

// http://code.google.com/apis/youtube/js_api_reference.html

// Two ways to index the videos on the page: by YouTube playerId or by
// numeric index (for compatibility with YouTube's onStateChange).
GLP.videos = {};
GLP.videosArray = [];

function onYouTubePlayerReady(playerId) {
  GLP.videos[playerId].handleYouTubePlayerReady();
  var ytplayer = document.getElementById(playerId);
  console.log(ytplayer);
  ytplayer.playVideo();

  // This callback has to be referenced by name, which poses a problem
  // with multiple videos on a page that may change frequently.
  // One idea: make a number of callback functions, ytStateChange1 through
  // ytStateChangeN, and have each one index into a global array and call
  // a function on the resulting object.
  ytplayer.addEventListener("onStateChange", "ytStateChange1");
}

function onYouTubeStateChange0(state) {
  GLP.videosArray[0].handleYouTubeStateChange(state);
}
