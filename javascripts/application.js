
if(window.Prototype===undefined){var Prototype={}}if(window.$===undefined){var $=function(){}}if(window.$$===undefined){var $$=function(){}}if(window.$H===undefined){var $H=function(){}}if(window.$A===undefined){var $A=function(){}}if(window.$F===undefined){var $F=function(){}}if(window.$R===undefined){var $R=function(){}}if(window.Class===undefined){var Class={}}if(window.Form===undefined){var Form={}}if(window.Effect===undefined){var Effect={}}if(window.Draggable===undefined){var Draggable={}}if(window.Droppables===undefined){var Droppables={}}if(window.Sortable===undefined){var Sortable={}}if(window.Control===undefined){var Control={}}if(window.Position===undefined){var Position={}}if(window.PeriodicalExecuter===undefined){var PeriodicalExecuter={}}var GLP={};GLP.Video=Class.create({});GLP.TimelineControl=Class.create({initialize:function(A){console.log("GLP.TimelineControl initialize");this.container=A;if(!A){console.log("GLP.TimelineControl: no container given");throw ("ContainerNotGiven")}this.assign("clockFace",".clock-face");this.assign("handle",".handle",this.clockFace);this.assign("progress",".progress",this.clockFace);this.assign("digitalTime",".digital-time");this.handleGrabbed=false;this.handle.observe("mousedown",this.handleGrab.bind(this));document.observe("mousemove",this.handleDrag.bind(this));document.observe("mouseup",this.handleRelease.bind(this));this.totalTime={hours:24,minutes:0,decimal:24}},assign:function(C,A,B){if(typeof (A)==="undefined"){A=C}if(typeof (B)==="undefined"){B=this.container}this[C]=B.select(A).first();if(!this[C]){console.log("GLP.TimelineControl: unable to find '"+A+"'");throw ("SelectorNotFound")}return this[C]},handleGrab:function(A){console.log("STARTING DRAG");A.stop();this.handleGrabbed=true;var C=this.clockFace.viewportOffset();var B=this.clockFace.getDimensions();this.clockCenter={x:(C.left+(B.width/2)),y:(C.top+(B.height/2))}},handleDrag:function(B){if(!this.handleGrabbed){return }var A={x:(B.x-this.clockCenter.x),y:(B.y-this.clockCenter.y)};var C=Math.atan2(A.x,A.y)*180/Math.PI;C=180-C;this.updateFromAngle(C)},handleRelease:function(A){this.handleGrabbed=false},updateFromAngle:function(A){this.angle=A;this.elapsed=A/360;this.handle.setStyle({"-webkit-transform":"rotate("+this.angle+"deg)"});this.changeProgress();this.changeDigitalTime()},changeProgress:function(){this.progress.innerHTML="";var A;if(this.angle<0||this.angle>360){return }if(this.angle<=90){this.insertProgressWedge(this.angle-90);this.insertProgressWedge(270,{mask:true})}else{if(this.angle<=180){this.insertProgressWedge(0);this.insertProgressWedge(this.angle-90)}else{if(this.angle<=270){this.insertProgressWedge(0);this.insertProgressWedge(90);this.insertProgressWedge(this.angle-90)}else{this.insertProgressWedge(0);this.insertProgressWedge(90);this.insertProgressWedge(180);this.insertProgressWedge(this.angle-90)}}}},insertProgressWedge:function(D,A){if(!A){A={}}var C="images/clock-progress-arc.png";if(A.mask){C="images/clock-progress-arc-mask.png"}var B=new Element("img",{src:C,style:"-webkit-transform: rotate("+D+"deg)"});this.progress.insert(B)},changeDigitalTime:function(){this.currentTime={};var C=this.currentTime.decimal=this.elapsed*this.totalTime.decimal;var B=this.currentTime.hours=Math.floor(C);var A=this.currentTime.minutes=Math.round((C-B)*60);this.digitalTime.innerHTML=B.toPaddedString(2)+":"+A.toPaddedString(2)}});GLP.TimelineControls=[];document.observe("dom:loaded",function(A){$$(".GLP-TimelineControl").each(function(B){GLP.TimelineControls.push(new GLP.TimelineControl(B))})});GLP.videos={};GLP.videosArray=[];function onYouTubePlayerReady(B){GLP.videos[B].handleYouTubePlayerReady();var A=document.getElementById(B);console.log(A);A.playVideo();A.addEventListener("onStateChange","ytStateChange1")}function onYouTubeStateChange0(A){GLP.videosArray[0].handleYouTubeStateChange(A)};