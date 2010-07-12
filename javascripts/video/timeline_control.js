/*jsl:import ../init.js*/

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
    
    this.handleGrabbed = false;
    this.handle.observe('mousedown',  this.handleGrab.bind(this));
    document.observe('mousemove',  this.handleDrag.bind(this));
    document.observe('mouseup',    this.handleRelease.bind(this));
    
    this.totalTime = { hours: 24, minutes: 0, decimal: 24.0 };
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
    this.handleGrabbed = false;
  },
  
  updateFromAngle: function(angle) {
    this.angle = angle;
    this.elapsed = angle / 360;
    this.handle.setStyle({"-webkit-transform": "rotate(" + this.angle + "deg)"});
    this.handle.style.setProperty("-moz-transform", "rotate(" + this.angle + "deg)", "");
    this.changeProgress();
    this.changeDigitalTime();
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
    this.currentTime = {};
    var d = this.currentTime.decimal  = this.elapsed * this.totalTime.decimal;
    var h = this.currentTime.hours    = Math.floor(d);
    var m = this.currentTime.minutes  = Math.round((d - h) * 60);
    
    this.digitalTime.innerHTML = h.toPaddedString(2) + ":" + m.toPaddedString(2);
  }
  
});

GLP.TimelineControls = [];

document.observe("dom:loaded", function(evt) {
  $$('.GLP-TimelineControl').each(function(container) {
    GLP.TimelineControls.push(new GLP.TimelineControl(container));
  });
});
