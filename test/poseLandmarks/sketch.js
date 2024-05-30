// HOW TO USE
// createPoseLandmarker({ numPoses: 5 }) starts the mediaPipe.poseLandmarker
// numPoses is the number of poses to detect
// predictWebcam(video) will start predicting mediaPipe.landmarks

// pass a video MediaElement using createCapture
// make sure to call predictWebcam as a callback to createCapture
// this ensures the video is ready

// parts index:
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/index

// adjust the lerp rate if you want
let lerpRate = 0.3;
const numPoses = 5;
let currentPersons = 1;

let multiplier = {
  width: 0,
  height: 0,
  z: 40,
  shiftX: 0,
  shiftY: 0,
};

let yOff = 0;
let capture;
let madeClone = false;

let lerpLandmarks = [];
for (let i = 0; i < numPoses; i++) {
  lerpLandmarks.push([]);
  for (let j = 0; j < 33; j++) {
    lerpLandmarks[i].push({ x: 0, y: 0, z: 0 });
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  captureWebcam();
}

function draw() {
  background(255);
  lerpPositions();

  // capture / screen ratios

  // draw the webcam
  drawCapture();
  // console.log(capture);

  // console.log(mediaPipe);

  // mediaPipe.landmarks contains an array of people
  if (mediaPipe.landmarks.length > 0) {
    // l[start].x = simpLerp(l[start].x, p[start].x, lerpRate);
    mediaPipe.landmarks.forEach((person, personIndex) => {
      // sometimes we don't have a person for a bit, if not then return
      // each person contains an array of positions of each body part
      person.forEach((part, partIndex) => {
        // get the lerped position for detected body parts
        const x = lerpLandmarks[personIndex][partIndex].x;
        const y = lerpLandmarks[personIndex][partIndex].y;
        const z = lerpLandmarks[personIndex][partIndex].z;
        const mx = part.x * multiplier.width + multiplier.shiftX;
        const my = part.y * multiplier.height + multiplier.shiftY;
        const mz = (part.z * capture.height) / 10;
        // console.log(part);

        // unlerped positions are part.x and part.y
        // circle(part.x * capture.width, part.y * capture.height, 10);

        let col = personIndex === 0 ? "brown" : "blue";
        fill(col);
        circle(mx, my, mz);
        fill("red");
        circle(x, y, z);
      });
    });
  }
}

function drawCapture() {
  image(
    capture,
    multiplier.shiftX,
    multiplier.shiftY,
    multiplier.width,
    multiplier.height
  );
}

// create and set lerp positions
// this function creates a deep clone of the mediaPipe.landmarks if it doesn't exist already
// then it lerps the positions of the landmarks
// lerp works by moving a percentage of the way from one position to another
function lerpPositions() {
  mediaPipe.landmarks.forEach((person, personIndex) => {
    let p = mediaPipe.landmarks[personIndex];
    let l = lerpLandmarks[personIndex];
    // sometimes we don't have a person for a bit, if not then return
    if (!l || !p) return;
    // each person contains an array of positions of each body part
    person.forEach((part, partIndex) => {
      // get the lerped position for detected body parts
      l[partIndex].x = lerp(
        l[partIndex].x,
        part.x * multiplier.width + multiplier.shiftX,
        lerpRate
      );
      l[partIndex].y = lerp(
        l[partIndex].y,
        part.y * multiplier.height + multiplier.shiftY,
        lerpRate
      );
      l[partIndex].z = lerp(l[partIndex].z, part.z * multiplier.z, lerpRate);
      // draw a circle on each body part
    });
  });
}

// this function helps to captuer the webcam in a way that ensure video is loaded
// before we start predicting mediaPipe.landmarks. Createcapture has a callback which is
// only called when the video is correctly loaded. At that point we set the dimensions
// and start predicting mediaPipe.landmarks

// N.B. the video is flipped horizontally in the CSS

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
      // do things when video ready
      // until then, the video element will have no dimensions, or default 640x480

      console.log(capture.width, capture.height);

      setCameraDimensions();

      mediaPipe.createPoseLandmarker({ numPoses: 3 });
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
  // dont resize the capture - try to clone it instead
  // this works fine - the video is contained within the canvas

  // set multiplier for x and y

  let captureRatio = capture.width / capture.height;
  let screenRatio = width / height;

  if (captureRatio > screenRatio) {
    multiplier.width = height * captureRatio;
    multiplier.height = height;
  } else {
    multiplier.width = width * captureRatio;
    multiplier.height = width;
  }

  multiplier.shiftX = (width - multiplier.width) / 2;
  multiplier.shiftY = (height - multiplier.height) / 2;

  // if (width / height) {
  //   multiplier.width = width;
  //   multiplier.height = (width / capture.width) * capture.height;
  // } else {
  // }
}

// resize the canvas when the window is resized
// also reset the camera dimensions
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setCameraDimensions();
}
