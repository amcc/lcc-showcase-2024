import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let poseLandmarker;
let runningMode = "VIDEO";
// let video = null;
let lastVideoTime = -1;

const mediaPipe = {
  landmarks: [],
  worldLandmarks: [],
};

// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async ({ numPoses = 1 }) => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`,
      // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task`,
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numPoses: numPoses,
    minPoseDetectionConfidence: 0.8,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.8,
    outputSegmentationMasks: false,
  });
};

const predictWebcam = (video) => {
  // Now let's start detecting the stream.
  let startTimeMs = performance.now();

  if (video.elt && lastVideoTime !== video.elt.currentTime && poseLandmarker) {
    lastVideoTime = video.elt.currentTime;
    // console.log(poseLandmarker)
    poseLandmarker.detectForVideo(video.elt, startTimeMs, (result) => {
      mediaPipe.landmarks = result.landmarks;
      mediaPipe.worldLandmarks = result.worldLandmarks;
    });
  }

  // Call this function again to keep predicting when the browser is ready.
  window.requestAnimationFrame(() => {
    predictWebcam(video);
  });
};

mediaPipe.predictWebcam = predictWebcam;
mediaPipe.createPoseLandmarker = createPoseLandmarker;

export { mediaPipe };
