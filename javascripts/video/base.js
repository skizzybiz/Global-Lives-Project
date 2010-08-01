/*jsl:import ../init.js*/

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
  },
  
  // Utility methods for subclasses
  
  showMessage: function(message) {
    console.log("Showing message '" + message + "'");
    this.clearMessage();
    this.message = new Element("div", {"class": "message"});
    this.message.innerHTML = message;
    this.message.style.visibility = "hidden";
    this.container.insert(this.message);
    window.setTimeout(this._adjustMessagePosition.bind(this), 20);
    window.setTimeout(this._clearMessageTimeout.bind(this), 200);
  },
  
  clearMessage: function() {
    if (this.message) {
      this.message.remove();
      this.message = null;
    }
  },
  
  _adjustMessagePosition: function() {
    if (!this.message) return;
    var layout = this.message.getLayout();
    var width  = layout.get('width') + layout.get('padding-left') + layout.get('padding-right');
    var height = layout.get('height') + layout.get('padding-top') + layout.get('padding-bottom');
    this.message.setStyle({
      visibility: "visible",
      left:       "50%",
      top:        "50%",
      marginLeft: "-" + Math.round(width / 2) + "px",
      marginTop:  "-" + Math.round(height / 2) + "px"
    });
  },
  
  _clearMessageTimeout: function() {
    if (!this.message) return;
    this.message.addClassName('hidden');
    window.setTimeout(this.clearMessage.bind(this), 800);
  }
  
});

GLP.Videos = [];

document.observe('dom:loaded', function() {
  $$('.GLP.Video').each(function(container) {
    GLP.Videos.push(new GLP.Video(container));
  });
});

