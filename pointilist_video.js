let capture;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide();
  noStroke();
  ellipseMode(CORNER);
}

function draw() {
  background(0);
  capture.loadPixels();
  for (let cy = 0; cy < capture.height; cy += 10) {
    for (let cx = 0; cx < capture.width; cx += 10) {
      let offset = ((cy*capture.width)+cx)*4;
      let xpos = (cx / width) * width;
      let ypos = (cy / height) * height;
      var red = capture.pixels[offset];
      var green = capture.pixels[offset+1];
      var blue = capture.pixels[offset+2];
      fill(`rgba(${red},${green},${blue},${blue/255})`);
      ellipse(xpos, ypos, 20*(green/255), 20*(red/255));
    }
  }
}