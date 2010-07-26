
// To remove jslint warnings
// The Rails team is stubborn: http://dev.rubyonrails.org/ticket/7311
if (window.Prototype === undefined) var Prototype = {};
if (window.$ === undefined) var $ = function() {};
if (window.$$ === undefined) var $$ = function() {};
if (window.$H === undefined) var $H = function() {};
if (window.$A === undefined) var $A = function() {};
if (window.$F === undefined) var $F = function() {};
if (window.$R === undefined) var $R = function() {};
if (window.Class === undefined) var Class = {};
if (window.Form === undefined) var Form = {};
if (window.Effect === undefined) var Effect = {};
if (window.Draggable === undefined) var Draggable = {};
if (window.Droppables === undefined) var Droppables = {};
if (window.Sortable === undefined) var Sortable = {};
if (window.Control === undefined) var Control = {};
if (window.Position === undefined) var Position = {};
if (window.PeriodicalExecuter === undefined) var PeriodicalExecuter = {};

// Global Lives Project namespace
var GLP = {};



GLP.Video = Class.create({
  initialize: function(container) {
    console.log("GLP.Video initialize()");
    if (!container) {
      console.log("GLP.Video: no container given");
      throw "ContainerNotGiven";
    }
    this.container = container;
    if (typeof(this.container.GLP) === "undefined") this.container.GLP = {};
    this.container.GLP.Video = this;
    Object.extend(this, GLP.Video.HTML5);
    this.setup();
  },
  
  setup: function() {
    throw "MethodNotImplemented";
  },
  
  play: function() {
    throw "MethodNotImplemented";
  },
  
  pause: function() {
    throw "MethodNotImplemented";
  },
  
  // Will return "playing" or "paused"
  togglePlay: function() {
    throw "MethodNotImplemented";
  },
  
  // time = { hours: HH, minutes: MM, seconds: SS, milliseconds: MS }
  seek: function(time) {
    throw "MethodNotImplemented";
  },
  
  setPlaybackRate: function(rate) {
    throw "MethodNotImplemented";
  },
  
  // Returns { hours: HH, minutes: MM, seconds: SS, milliseconds: 0.123, decimal: ... }
  // 'decimal' is the decimal time in seconds
  timecode: function() {
    throw "MethodNotImplemented";
  }
  
});

GLP.Videos = [];

document.observe('dom:loaded', function() {
  $$('.GLP.Video').each(function(container) {
    GLP.Videos.push(new GLP.Video(container));
  });
});




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




// Add IE support: http://www.useragentman.com/blog/2010/03/09/cross-browser-css-transforms-even-in-ie/

GLP.TimelineControl = Class.create({
  
  initialize: function(container) {
    console.log("GLP.TimelineControl initialize");
    this.container = container;
    if (!container) {
      console.log("GLP.TimelineControl: no container given");
      throw("ContainerNotGiven");
    }
    this.assign('clockFace',    '.clock-face');
    this.assign('handle',       '.handle',        this.clockFace);
    this.assign('progress',     '.progress',      this.clockFace);
    this.assign('digitalTime',  '.digital-time');
    this.assign('controls',     '.controls');
    this.assign('playpause',    '.playpause',     this.controls);
    
    this.handleGrabbed = false;
    this.handle.observe('mousedown',  this.handleGrab.bind(this));
    document.observe('mousemove',  this.handleDrag.bind(this));
    document.observe('mouseup',    this.handleRelease.bind(this));
    
    this.playpause.observe('click', this.pressPlayPause.bind(this));
    this.timecodeObserver = this.checkTimecode.bind(this);
    
    this.waitForVideoMetadata();
  },
  
  assign: function(variable, selector, container) {
    if (typeof(selector) === 'undefined') selector = variable;
    if (typeof(container) === 'undefined') container = this.container;
    this[variable] = container.select(selector).first();
    if (!this[variable]) {
      console.log("GLP.TimelineControl: unable to find '" + selector + "'");
      throw("SelectorNotFound");
    }
    return this[variable];
  },
  
  waitForVideoMetadata: function() {
    this.totalDuration = 0; // in seconds
    // First pass to get any metadata that may have already loaded
    GLP.Videos.each(this.updateTotalDurationFromVideo.bind(this));
    document.observe("video:metadataloaded", this.videoMetadataLoaded.bind(this));
  },
  
  videoMetadataLoaded: function(evt) {
    this.updateTotalDurationFromVideo(evt.element().GLP.Video);
  },
  
  updateTotalDurationFromVideo: function(video) {
    if (video.metadata && video.metadata.totalDuration > this.totalDuration) {
      this.totalDuration = video.metadata.totalDuration;
      console.log("updating total duration to " + this.totalDuration);
    }
  },
  
  handleGrab: function(evt) {
    console.log("STARTING DRAG");
    evt.stop();
    this.handleGrabbed = true;
    var offset  = this.clockFace.viewportOffset();
    var dim     = this.clockFace.getDimensions();
    this.clockCenter = {
      x: (offset.left + (dim.width / 2)),
      y: (offset.top  + (dim.height / 2))
    };
    // console.log("clock x: " + this.clockCenter.x + ", y: " + this.clockCenter.y);
  },
  
  handleDrag: function(evt) {
    if (!this.handleGrabbed) return;
    // console.log(evt);
    // console.log("event x: " + evt.clientX + ", y: " + evt.clientY);
    var vector = {
      x: (evt.clientX - this.clockCenter.x),
      y: (evt.clientY - this.clockCenter.y)
    };
    // The angle will be positive going CCW from a vector pointing down,
    // and negative going CW.
    // E.g., 6:00 is 0°, 3:00 is 90°, and 9:00 is -90°
    var angle = Math.atan2(vector.x, vector.y) * 180 / Math.PI;
    // Convert the angle to CW starting at 12:00
    angle = 180 - angle;
    this.updateFromAngle(angle);
  },
  
  handleRelease: function(evt) {
    if (this.handleGrabbed) {
      this.handleDrag(evt);
      this.handleGrabbed = false;
      this.update();
    }
  },
  
  updateFromAngle: function(angle) {
    this.angle = angle;
    this.elapsed = angle / 360;
    this.currentTime = {};
    var d = this.currentTime.decimal  = this.elapsed * this.totalDuration;
    var h = this.currentTime.hours    = Math.floor(d / 3600);
    var m = this.currentTime.minutes  = Math.floor(d / 60 - h * 60);
    var s = this.currentTime.seconds  = Math.floor(d - m * 60 - h * 3600);
    this.update();
  },
  
  update: function(options) {
    if (typeof(options) === 'undefined') options = {};
    if (typeof(options.video) === 'undefined') options.video = true;
    if (typeof(options.digitalTime) === "undefined") options.digitalTime = true;
    this.handle.setStyle({"-webkit-transform": "rotate(" + this.angle + "deg)"});
    this.handle.style.setProperty("-moz-transform", "rotate(" + this.angle + "deg)", "");
    this.changeProgress();
    if (options.digitalTime) this.changeDigitalTime();
    
    if (!this.handleGrabbed && options.video) {
      GLP.Videos.each(function(video) {
        video.seek(this.currentTime);
      }.bind(this));
    }
  },
  
  changeProgress: function() {
    this.progress.innerHTML = '';
    var elem;
    if (this.angle < 0 || this.angle > 360) return;
    if (this.angle <= 90) {
      this.insertProgressWedge(this.angle - 90);
      this.insertProgressWedge(270, {mask: true});
    } else if (this.angle <= 180) {
      this.insertProgressWedge(0);
      this.insertProgressWedge(this.angle - 90);
    } else if (this.angle <= 270) {
      this.insertProgressWedge(0);
      this.insertProgressWedge(90);
      this.insertProgressWedge(this.angle - 90);
    } else {
      this.insertProgressWedge(0);
      this.insertProgressWedge(90);
      this.insertProgressWedge(180);
      this.insertProgressWedge(this.angle - 90);
    }
  },
  
  insertProgressWedge: function(angle, options) {
    if (!options) options = {};
    var src = "images/clock-progress-arc.png";
    if (options.mask) src = "images/clock-progress-arc-mask.png";
    var elem = new Element('img', {
      src: src,
      style: "-webkit-transform: rotate(" + angle + "deg); -moz-transform: rotate(" + angle + "deg)"
    });
    this.progress.insert(elem);
  },
  
  changeDigitalTime: function() {
    this.digitalTime.innerHTML = this.currentTime.hours.toPaddedString(2) + 
      ":" + this.currentTime.minutes.toPaddedString(2) +
      ":" + this.currentTime.seconds.toPaddedString(2);
  },
  
  pressPlayPause: function(evt) {
    evt.stop();
    GLP.Videos.each(function(video) {
      if (video.togglePlay() === "playing") {
        this.playing = true;
        this.playpause.select("img").first().src = "images/pause.png";
        this.observeVideoProgress();
      } else {
        this.playpause.select("img").first().src = "images/play.png";
        this.playing = false;
      }
    }.bind(this));
  },
  
  checkTimecode: function() {
    if (!this.handleGrabbed) {
      var t = this.currentTime = GLP.Videos.first().timecode();
      this.elapsed = t.decimal / this.totalDuration;
      this.angle = this.elapsed * 360;
      this.update({ video: false });
    }
    if (this.playing) window.setTimeout(this.timecodeObserver, 200);
  },
  
  observeVideoProgress: function() {
    window.setTimeout(this.timecodeObserver, 200);
  }
  
});

GLP.TimelineControls = [];

document.observe("dom:loaded", function(evt) {
  $$('.GLP.TimelineControl').each(function(container) {
    GLP.TimelineControls.push(new GLP.TimelineControl(container));
  });
});



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

