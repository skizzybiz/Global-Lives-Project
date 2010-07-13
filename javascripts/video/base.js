/*jsl:import ../init.js*/

GLP.Video = Class.create({
  initialize: function(container) {
    console.log("GLP.Video initialize()");
    if (!container) {
      console.log("GLP.Video: no container given");
      throw "ContainerNotGiven";
    }
    this.container = container;
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
  }
  
});

GLP.Videos = [];

document.observe('dom:loaded', function() {
  $$('.GLP.Video').each(function(container) {
    GLP.Videos.push(new GLP.Video(container));
  });
});

