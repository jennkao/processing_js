let capture;
let videoscale = 2;
let framerate = 5;

function setup() {
  createCanvas(480, 360);

  frameRate(framerate);
  capture = createCapture(VIDEO);
  capture.size(width / videoscale, height / videoscale);
  capture.hide();

  background(30);
}

function draw() {
  capture.loadPixels();
  const newPixels = blur(capture.pixels, capture.width, capture.height);
  const { edgeData, maxEdge } = edgeDetection(newPixels, capture.width, capture.height);
  for (let cy = 0; cy < capture.height; cy += 1) {
    for (let cx = 0; cx < capture.width; cx += 1) {
      const edgeIndex = findPixelOffsetIndex(cx, cy, capture.width, 1);
      colorMode(HSB, 100);
      const saturation = map(edgeData[edgeIndex], 0, 255, 0, 100);
      const bright = map(edgeData[edgeIndex], 0, maxEdge, 0, 100);
      const color = 77; // purple
      fill(color, saturation, bright);
      noStroke();
      rect(cx * videoscale, cy * videoscale, videoscale, videoscale);
      colorMode(RGB);
    }
  }
}

function blur(pixels, width, height) {
  const blurFilter = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];

  const newPixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const newPixelData = blurConvolusion(pixels, x, y, width, blurFilter);
      newPixels.push(...newPixelData);
    }
  }
  return newPixels;
}

function edgeDetection(pixels, width, height) {
  const filterVertical = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  const filterHorizontal = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  let max = 0;
  let edgeData = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let edgeVertical = edgeDetectionConvolusion(pixels, x, y, width, filterVertical);
      let edgeHorizontal = edgeDetectionConvolusion(pixels, x, y, width, filterHorizontal);
      let edge = sqrt(sq(edgeVertical) + sq(edgeHorizontal));
      edgeData.push(edge);
      max = Math.max(edge);
    }
  }
  return new EdgeDetectionResult(edgeData, max);
}

// filter needs to be an nxn matrix, where n is an odd number and >= 3
function convolusion(pixels, x, y, width, filter) {
  const filterCenter = filterCenterIndex(filter);
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumFilter = 0;
  for (let i = -filterCenter; i <= filterCenter; i++) {
    for (let j = -filterCenter; j <= filterCenter; j++) {
      const index = findPixelOffsetIndex(x + i, y + j, width, 4);
      sumFilter += filter[i + filterCenter][j + filterCenter];
      if (index < 0 || index >= pixels.length) {
        continue;
      } else {
        sumR += pixels[index] * filter[i + filterCenter][j + filterCenter]; // red
        sumG += pixels[index + 1] * filter[i + filterCenter][j + filterCenter]; // green
        sumB += pixels[index + 2] * filter[i + filterCenter][j + filterCenter]; // blue
      }
    }
  }
  return new ConvolusionResult(sumR, sumG, sumB, sumFilter);
}

function edgeDetectionConvolusion(pixels, x, y, width, filter) {
  const convolusionResult = convolusion(pixels, x, y, width, filter);
  const { sumR, sumG, sumB } = convolusionResult;
  return (sumR + sumG + sumB) / filter.length;
}

function blurConvolusion(pixels, x, y, width, filter) {
  const convolusionResult = convolusion(pixels, x, y, width, filter);
  const { sumR, sumG, sumB, sumFilter } = convolusionResult;
  return [sumR / sumFilter, sumG / sumFilter, sumB / sumFilter, 255];
}

// for a given x y coordinate in a image of a given width
// find the offset index in an array of variable cols per pixel
// (represented by numberColsPerPixel)
function findPixelOffsetIndex(x, y, width, numberColsPerPixel) {
  return (y * width + x) * numberColsPerPixel;
}

function filterCenterIndex(filter) {
  return Math.floor(filter.length / 2);
}

class ConvolusionResult {
  constructor(sumR, sumG, sumB, sumFilter) {
    this.sumR = sumR;
    this.sumG = sumG;
    this.sumB = sumB;
    this.sumFilter = sumFilter;
  }
}

class EdgeDetectionResult {
  constructor(edgeData, maxEdge) {
    this.edgeData = edgeData;
    this.maxEdge = maxEdge;
  }
}
