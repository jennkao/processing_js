let capture;
let GRID_SIZE = 10;
let DOT_SIZE = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide();
  noStroke();
  ellipseMode(CORNER);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  capture.loadPixels();
  for (let cy = 0; cy < capture.height; cy += GRID_SIZE) {
    for (let cx = 0; cx < capture.width; cx += GRID_SIZE) {
      let offset = ((cy*capture.width)+cx)*4;
      let x = (cx / capture.width) * width;
      let y = (cy / capture.height) * height;
      let nearDot = isMouseNearDot(x, y);
      let xpos = nearDot ? x * random(0.95, 1.05) : x;
      let ypos = nearDot ? y * random(0.95, 1.05) : y;
      
      let red = capture.pixels[offset];
      let green = capture.pixels[offset+1];
      let blue = capture.pixels[offset+2];
      let col = color(red, green, blue);
      let bright = brightness(col);
      let dotWidth = DOT_SIZE * (mouseX / width);
      let dotHeight = DOT_SIZE * (mouseY / height);
      
      fill(`rgba(${red},${green},${blue},${bright/100})`);
      ellipse(xpos, ypos, dotWidth, dotHeight);
    }
  }
}

function isMouseNearDot(xpos, ypos) {
  let withinXRange = isBetween(mouseX, xpos-4*GRID_SIZE, xpos+4*GRID_SIZE)
  let withinYRange = isBetween(mouseY, ypos-4*GRID_SIZE, ypos+4*GRID_SIZE);
  return withinXRange && withinYRange;
}

function isBetween(xpos, min, max) {
  return xpos >= min && xpos <= max;
}