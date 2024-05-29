// HOW TO USE
// predictWebcam(video) will start predicting landmarks

// pass a video MediaElement using createCapture
// make sure to call predictWebcam as a callback to createCapture
// this ensures the video is ready

// parts index and documentation:
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker

let capture;
let captureEvent;

let multiplier = {
  width: 0,
  height: 0,
  z: 40,
  shiftX: 0,
  shiftY: 0,
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  captureWebcam();
}

function draw() {
  background(255);

  fill(0);

  // flip the webcam image so it looks like a mirror
  push();
  scale(-1, 1); // mirror webcam
  // image(capture, -capture.width, 0); // draw webcam
  image(
    capture,
    multiplier.shiftX - multiplier.width,
    multiplier.shiftY,
    multiplier.width,
    multiplier.height
  );
  console.log(multiplier.width, multiplier.height);
  scale(-1, 1); // unset mirror
  pop();

  // background(255);
  // landmarks contain an array of hands
  if (mediaPipe.landmarks.length === 2) {
    // get the index fingers of both hands
    let i0 = mediaPipe.landmarks[0][8];
    let i1 = mediaPipe.landmarks[1][8];

    // let handX = capture.width - hand[8].x * capture.width;
    //   let handY = hand[8].y * capture.height;
    //   circle(handX, handY, 20);

    circle(getFlipPos(i0).x, getFlipPos(i0).y, 20);
    circle(getFlipPos(i1).x, getFlipPos(i1).y, 20);

    let d = dist(
      getFlipPos(i0).x,
      getFlipPos(i0).y,
      getFlipPos(i1).x,
      getFlipPos(i1).y
    );

    let cX = (getFlipPos(i0).x + getFlipPos(i1).x) / 2;
    let cY = (getFlipPos(i0).y + getFlipPos(i1).y) / 2;

    circle(cX, cY, d);
  } else {
    circle(width / 2, height / 2, width / 4);
  }
}

// return flipped x and y positions
function getFlipPos(part) {
  return {
    x: multiplier.width - part.x * multiplier.width + multiplier.shiftX,
    y: part.y * multiplier.height + multiplier.shiftY,
  };
}

// this function helps to captuer the webcam in a way that ensure video is loaded
// before we start predicting landmarks. Creatcapture has a callback which is
// only called when the video is correctly loaded. At that point we set the dimensions
// and start predicting landmarks
function captureWebcam() {
  capture = createCapture(
    {
      audio: false,
      video: {
        facingMode: "user",
      },
    },
    function (e) {
      captureEvent = e;
      console.log(captureEvent.getTracks()[0].getSettings());
      // do things when video ready
      // until then, the video element will have no dimensions, or default 640x480
      capture.srcObject = e;

      setCameraDimensions();
      mediaPipe.predictWebcam(capture);
    }
  );
  capture.elt.setAttribute("playsinline", "");
  capture.hide();
}

// this function sets the dimensions of the video element to match the
// dimensions of the camera. This is important because the camera may have
// different dimensions than the default video element
function setCameraDimensions() {
  // resize the capture depending on whether
  // the camera is landscape or portrait

  // if (capture.width > capture.height) {
  //   capture.size(width, (capture.height / capture.width) * width);
  // } else {
  //   capture.size((capture.width / capture.height) * height, height);
  // }

  let captureRatio = capture.width / capture.height;
  let screenRatio = width / height;

  if (captureRatio > screenRatio) {
    multiplier.width = width;
    multiplier.height = (width / capture.width) * capture.height;
  } else {
    multiplier.width = (height / capture.height) * capture.width;
    multiplier.height = height;
  }

  multiplier.shiftX = (width - multiplier.width) / 2;
  multiplier.shiftY = (height - multiplier.height) / 2;
}

// resize the canvas when the window is resized
// also reset the camera dimensions
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setCameraDimensions();
}
