let capture;
let MAX_SAMPLE_RATE = 2;
let MIN_SAMPLE_RATE = 10;
let DOT_SIZE_PX = 2;
let ROWS = 3;
let COLS = 2;
let VIDEOSCALE = 2;
let PADDING = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(width / VIDEOSCALE, height / VIDEOSCALE);
  capture.hide();
  ellipseMode(CORNER);
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  capture.loadPixels();

  const rowWidth = width / ROWS;
  const colHeight = height / COLS;
  const numImages = ROWS * COLS;
  let count = 0;
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      count++;
      const x = i * rowWidth;
      const y = j * colHeight;
      const hue = map(count, 0, numImages, 0, 360);
      const brightThreshold = Math.floor(map(count, 0, numImages, 0, 75));
      const sampleRate = Math.floor(map(count, 0, numImages, MAX_SAMPLE_RATE, MIN_SAMPLE_RATE));
      drawImage(
        capture,
        x,
        y,
        rowWidth - 2 * PADDING,
        colHeight - 2 * PADDING,
        hue,
        brightThreshold,
        sampleRate
      );
    }
  }
}

function drawImage(
  capture,
  topLeftX,
  topLeftY,
  rowWidth,
  colHeight,
  hue,
  brightThreshold,
  sampleRate
) {
  for (let cy = 0; cy < capture.height; cy += sampleRate) {
    for (let cx = 0; cx < capture.width; cx += sampleRate) {
      let offset = (cy * capture.width + cx) * 4;
      let x = topLeftX + (cx / capture.width) * rowWidth;
      let y = topLeftY + (cy / capture.height) * colHeight;

      colorMode(HSB);
      let red = capture.pixels[offset];
      let green = capture.pixels[offset + 1];
      let blue = capture.pixels[offset + 2];
      let col = color(red, green, blue);
      let bright = brightness(col) > brightThreshold ? brightness(col) : 0;
      fill(hue, 100, bright);

      ellipse(x, y, DOT_SIZE_PX * VIDEOSCALE, DOT_SIZE_PX * VIDEOSCALE);
    }
  }
}
