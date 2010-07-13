/*jsl:import base.js*/

GLP.Video.HTML5 = {
  setup: function() {
    this.video = this.container.select("video").first();
    console.log("GLP.Video.HTML5 setup()");
  },
  
  play: function() {
    this.video.play();
  },
  
  pause: function() {
    this.video.pause();
  },
  
  togglePlay: function() {
    if (this.video.paused) {
      this.video.play();
      return "playing";
    } else {
      this.video.pause();
      return "paused";
    }
  },
  
  seek: function(time) {
    if (typeof(time.hours)        === 'undefined') time.hours         = 0;
    if (typeof(time.minutes)      === 'undefined') time.minutes       = 0;
    if (typeof(time.seconds)      === 'undefined') time.seconds       = 0;
    if (typeof(time.milliseconds) === 'undefined') time.milliseconds  = 0;
    var seconds = time.hours * 3600 + time.minutes * 60 + time.seconds + time.milliseconds;
    this.video.currentTime = seconds % this.video.duration;
  },
  
  setPlaybackRate: function(rate) {
    this.video.playbackRate = rate;
  }
  
};
