/**
 * Tap Code Recevier View controller
 * Author: Moses Wan
 * Date: January 2018
 * This file is the view controller of the Tap Code Receiver Application.
 *
 * This file is designed to only deal with setting up the view as well as attaching
 * the behaviour to the buttons and other view only interactions.
 *
 * The processing be done in the CodeProcessor class.
 *
 * DO NOT EDIT THIS FILE.
 */

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;
let videoplayer;

class CodeProcessor
{
  constructor()
  {

  }

/**
 * This function is required to tell JavaScript about how to handle an event
 * that it is listening to
 * @param  {EventType}  event   Event that is passed to the object to handle
 *
 */
  handleEvent(event)
  {
    switch(event.type) {
      case "refresh":
        this._listen(event);
        break;
    }
  }
}

let codeProcessor = new CodeProcessor();
codeProcessor._listen = _listen
codeProcessor.translate = translate
codeProcessor.clear = clear

/**
 * When the application first loads, try to acquire the video stream from the camera.
 */
window.onload = function() {
  reloadVideo();
}

/**
 * Function used to acquire the video stream from the camera. This is also used
 * as a callback for a button to reload the video.
 */
function reloadVideo()
{
  // From Mozilla Development Network site

  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get ahold of the legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }


  //let constraints = {video: { facingMode: "environment" } }
  let constraints = {video: { facingMode: "environment" }};

  // Acquires the video stream.
  navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      // Avoid using this in new browsers, as it is going away.
      video.src = window.URL.createObjectURL(stream);
    }
    video.onloadedmetadata = function(e) {
      video.play();
    };
    localMediaStream = stream;
    videoplayer = new VideoPlayer();
  }).catch((reason) => {
    console.error("Error in getting camera stream.");
    alert("Camera Stream is not available on this device.");
  });
  // Clear data, ready to be reused.
  clearText();
}

/**
 * Error Callback for getting camera stream
 */
function errorCallback()
{
  // When there is an error in acquiring video stream, send a console message and
  // popup alert.
  console.error("Error in getting camera stream.");
  alert("Camera Stream is not available on this device.");
}

/**
 * Success Callback for getting camera stream
 */
function successCallback(stream)
{
  // If there is a valid video stream, setup the VideoPlayer to run it.
  video.srcObject = stream;
  localMediaStream = stream;
  videoplayer = new VideoPlayer();
}

/**
 * Callback for the listening button.
 * When the button is press, it will determine the previous state of the button
 * and toggles the listening to events and status text.
 */
function toggleListening()
{
  let buttonIcon = document.querySelector(".button-control > button > i");
  let statusText = document.querySelector("#status");

  // Create a static variable isListening to keep track of the state.
  // If it is the first time this function runs, create it to be false to begin
  // with.
  if (typeof toggleListening.isListening == 'undefined')
  {
    toggleListening.isListening = false;
  }

  if(toggleListening.isListening)
  {
    // If previous state is listening, stop listening to events, change UI
    // accordingly and triggers the translation process.
    canvas.removeEventListener('refresh', codeProcessor, false);
    statusText.innerText = "Ready";
    buttonIcon.innerHTML = "visibility";
    console.log(codeProcessor._array);
    rxTranslate();
  }
  else
  {
    // If previous state is not listening, start listening to events and change
    // UI accordingly. Also clears data at the start.
    clearText();
    statusText.innerText = "Listening...";
    canvas.addEventListener('refresh', codeProcessor, false);
    buttonIcon.innerHTML = "visibility_off";

  }
  // Toggle state of the button
  toggleListening.isListening = !toggleListening.isListening;
}

/**
 * Clears the data
 * Redirects this to CodeProcessor class to deal with
 */
function clearText()
{
  codeProcessor.clear();
}

/**
 * Trigger to start the translation process
 * Redirects this to CodeProcessor class to deal with
 */
function rxTranslate()
{
  codeProcessor.translate();
}
