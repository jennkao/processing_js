let vidio;
let poseNet;
let faces = null;
function setup() {
  createCanvas(640, 480);
  vidio = createCapture(VIDEO);
  vidio.hide();

  poseNet = ml5.poseNet(vidio, modelReady);
  poseNet.on('pose', gotPoses);
}

function gotPoses(poses) {
  if (poses.length > 0) {
    faces = poses;
  }
}

function modelReady() {
  console.log('model ready');
}

let count = 0;
let colorInd = 0;
let nextColorInd = 1;
const NUM_CYCLES_PER_COLOR_COMBO = 100;
const GLASSES_COLORS = [
  [250, 202, 169],
  [255, 161, 157],
  [255, 129, 169],
  [205, 130, 184],
  [84, 182, 228],
  [130, 226, 224],
];

const LENS_SHAPE = [
  [10, 10, 40, 40],
  [20, 20, 20, 20],
];

function draw() {
  count++;
  if (count > NUM_CYCLES_PER_COLOR_COMBO) {
    colorInd++;
    nextColorInd++;
    colorInd = colorInd % GLASSES_COLORS.length;
    nextColorInd = nextColorInd % GLASSES_COLORS.length;
    count = count % NUM_CYCLES_PER_COLOR_COMBO;
  }

  image(vidio, 0, 0);

  rectMode(CORNER);

  if (!faces) {
    return;
  }

  faces.forEach((face, ind) => {
    let eleftX = face.pose.leftEye.x;
    let eleftY = face.pose.leftEye.y;
    let erightX = face.pose.rightEye.x;
    let erightY = face.pose.rightEye.y;
    const lensShapeInd = ind % LENS_SHAPE.length;

    const eyeDistance = dist(eleftX, eleftY, erightX, erightY);
    const lensDiameter = eyeDistance - 10;
    const halfLensDiameter = lensDiameter / 2;
    const leftLensX = eleftX;
    const leftLensY = eleftY + 20;
    const rightLensX = erightX;
    const rightLensY = erightY + 20;
    const lensHeight = (lensDiameter * 4) / 5;
    const lensShape = LENS_SHAPE[lensShapeInd];
    drawEye(leftLensX, leftLensY, lensDiameter, lensHeight, lensShape);
    drawEye(rightLensX, rightLensY, lensDiameter, lensHeight, lensShape);
    strokeWeight(1);
    line(leftLensX - halfLensDiameter, eleftY, rightLensX + halfLensDiameter, erightY);
  });
}

const RADIAL_SECTIONS = 5;
function drawEye(x, y, d, h, lensShape) {
  const firstColor = color(...GLASSES_COLORS[colorInd], 150);
  const secondColor = color(...GLASSES_COLORS[nextColorInd], 150);
  for (let i = RADIAL_SECTIONS; i >= 0; i--) {
    strokeWeight(i === RADIAL_SECTIONS ? 3 : 0);
    const blendedColor = lerpColor(firstColor, secondColor, Math.random());
    const lensDia = map(i, 0, RADIAL_SECTIONS, 0, d);
    const lensHeight = map(i, 0, RADIAL_SECTIONS, 0, h);
    fill(blendedColor);
    drawLens(x - lensDia / 2, y - lensDia / 2, lensDia, lensHeight, lensShape);
  }
}

function drawLens(x, y, width, height, lensShape) {
  rect(x, y, width, height, ...lensShape);
}
