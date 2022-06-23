let x;
let y;
let video;

function setup() {
  createCanvas(640, 480);
  background(255);
  // Start x and y in the center
  x = width / 2;
  y = height / 2;
  // Start the capture process
  capture = createCapture(VIDEO);
  capture.hide();
  frameRate(120);
}

function draw() {
  capture.loadPixels();
  let newx = constrain(x + random(-20, 20), 0, width);
  let newy = constrain(y + random(-20, 20), 0, height - 1);

  // Find the midpoint of the line
  let midx = int((newx + x) / 2);
  let midy = int((newy + y) / 2);
  // Pick the color from the video, reversing x
  let offset = findPixelOffsetIndex(midx, midy, width, 4);
  let red = capture.pixels[offset];
  let green = capture.pixels[offset + 1];
  let blue = capture.pixels[offset + 2];
  let col = color(red, green, blue);

  // Draw a line from (x,y) to (newx,newy)
  stroke(col);
  strokeWeight(4);
  line(x, y, newx, newy);

  // Save (newx,newy) in (x,y)
  x = newx;
  y = newy;
}

function findPixelOffsetIndex(x, y, width, numberColsPerPixel) {
  return (y * width + x) * numberColsPerPixel;
}
