/*jsl:import base.js*/

GLP.Video.HTML5 = {
  
  // Methods that implement the GLP.Video template
  
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
    time.decimal = time.hours * 3600 + time.minutes * 60 + time.seconds + time.milliseconds;
    var seekCallback = this.seekCallback.bind(this, time);
    this.loadVideoForTime(time, seekCallback);
  },
  
  setPlaybackRate: function(rate) {
    this.video.playbackRate = rate;
  },
  
  timecode: function() {
    // console.log("HTML5 Video timecode()");
    var t = this.video.currentTime + this.currentVideo.start;
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
  },
  
  // Utility methods
  
  metadataRequestSuccess: function(response) {
    this.metadata = response.responseJSON;
    var start = 0;
    this.metadata.segments.each(function(segment) {
      segment.start = start;
      segment.end = start + segment.duration;
      start += segment.duration;
    });
    this.metadata.totalDuration = this.metadata.segments.last().end;
    this.container.fire("video:metadataloaded");
    
    this.currentVideo = this.metadata.segments.first();
    this.video = new Element("video", { src: this.currentVideo.uri });
    this.video.observe("error", this.videoError.bind(this));
    this.video.observe("waiting", this.videoSegmentWaiting.bind(this));
    this.video.observe("canplay", this.videoSegmentCanPlay.bind(this));
    this.video.observe("ended", this.videoSegmentEnded.bind(this));
    this.container.insert(this.video);
  },
  
  metadataRequestFailure: function(response) {
    window.alert("Failed to load video: " + response.responseText);
  },
  
  videoError: function(evt) {
    console.log("video load error: " + this.video.error.code);
  },
  
  videoSegmentWaiting: function(evt) {
    // this.showMessage("Loading");
  },
  
  videoSegmentCanPlay: function(evt) {
    // this.clearMessage();
  },
  
  videoSegmentEnded: function(evt) {
    var nextIndex;
    var segment;
    for (var i = 0; segment = this.metadata.segments[i]; i++) {
      if (segment == this.currentVideo) {
        nextIndex = (i + 1) % this.metadata.segments.length;
        segment = this.metadata.segments[nextIndex];
        console.log("Swapping segment " + i + " for segment " + nextIndex);
        break;
      }
    }
    if (!segment) {
      console.log("videoSegmentEnded: unable to find next segment, switching to first segment");
      segment = this.metadata.segments[0];
    }
    this.swapVideoSegment(segment);
  },
  
  seekCallback: function(time, evt) {
    this.video.currentTime = time.decimal - this.currentVideo.start;
    console.log("seekCallback: set currentTime to " + (time.decimal - this.currentVideo.start));
  },
  
  loadVideoForTime: function(time, callback) {
    var segment = this.currentVideo;
    var d = time.decimal;
    if (segment.start <= d && segment.end > d) {
      callback(time);
      return;
    }
    console.log("loadVideoForTime: loading new video segment");
    for (var i = 0; segment = this.metadata.segments[i]; i++) {
      if (segment.end > d) break;
    }
    if (segment.end < d) throw "Unable to find a segment for timecode " + d;
    this.swapVideoSegment(segment, callback);
  },
  
  swapVideoSegment: function(segment, callback) {
    console.log("swapVideoSegment: loading " + segment.uri);
    this.currentVideo = segment;
    this.playing = !this.video.paused;
    this.video.src = segment.uri;
    this.video.observe("loadedmetadata", function(callback, evt) {
      if (callback) callback();
      if (this.playing) this.video.play();
      this.video.stopObserving("loadedmetadata");
      console.log("Finished swapping video");
    }.bind(this, callback));
  }
  
};
