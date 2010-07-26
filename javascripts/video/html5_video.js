/*jsl:import base.js*/

GLP.Video.HTML5 = {
  setup: function() {
    this.metadata_uri = this.container.getAttribute("data-html5");
    console.log(this.metadata_uri);
    new Ajax.Request(this.metadata_uri, {
      method: "get",
      evalJSON: "force",
      onSuccess: this.metadataRequestSuccess.bind(this),
      onFailure: this.metadataRequestFailure.bind(this)
    });
  },
  
  metadataRequestSuccess: function(response) {
    this.metadata = response.responseJSON;
    var start = 0;
    this.metadata.segments.each(function(segment) {
      segment.start = start;
      segment.end = start + segment.duration;
      start += segment.duration;
    });
    this.container.fire("video:metadataloaded");
    this.video = new Element("video", { src: this.metadata.segments[0].uri });
    this.container.insert(this.video);
  },
  
  metadataRequestFailure: function(response) {
    window.alert("Failed to load video: " + response.responseText);
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
    // TODO: Load and seek to the correct video using metadata
    this.video.currentTime = seconds % this.video.duration;
  },
  
  setPlaybackRate: function(rate) {
    this.video.playbackRate = rate;
  },
  
  timecode: function() {
    // console.log("HTML5 Video timecode()");
    var t = this.video.currentTime;
    var tc = { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, decimal: t };
    tc.seconds = Math.floor(t);
    tc.milliseconds = t - tc.seconds;
    if (tc.seconds > 59) {
      tc.minutes = Math.floor(tc.seconds / 60);
      tc.seconds = tc.seconds - tc.minutes * 60;
      if (tc.minutes > 59) {
        tc.hours = Math.floor(tc.minutes / 60);
        tc.minutes = tc.minutes - tc.hours * 60;
      }
    }
    return tc;
  }
  
};
