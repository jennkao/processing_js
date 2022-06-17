/**
 *  Re-group the FFT into more meaningful values by
 *  splitting into one-third-octave bands,
 *  and by smoothing each point with its neighbors.
 *
 *  Plot over time.
 */

var source, fft;
let started = false;

var divisions = 1; // controls whether the page is divided in to halves / thirds etc.
var cnv;
var _speed = 0; // used if wanted to scroll the waves along the y axis

function setup() {
  // // mimics the autoplay policy
  getAudioContext().suspend();

  cnv = createCanvas(windowWidth, windowHeight);
  noFill();
  stroke(0, 100); // whispy-ness of lines

  source = new p5.AudioIn();
  source.start();

  fft = new p5.FFT(0.9, 1024);
  fft.setInput(source);
}

let colorInd = 0;
let count = 0;
let waveColors = [
  [68, 93, 137],
  [136, 150, 180],
  [154, 173, 205],
  [116, 156, 197],
];
function draw() {
  count++;
  count = count % 500;
  if (count === 0) {
    colorInd++;
    colorInd = colorInd % waveColors.length;
  }

  var h = height / divisions;
  var spectrum = fft.analyze();

  var scaledSpectrum = splitOctaves(spectrum, 12);

  background(253, 207, 186, 40); // alpha controls whether previous lines stay around
  drawSun();

  // draw shape
  stroke(0, 100);
  fill(...waveColors[colorInd]);
  beginShape();
  vertex(0, 0);

  // one at the left corner
  curveVertex(0, h);

  for (var i = 0; i < scaledSpectrum.length; i++) {
    var point = smoothPoint(scaledSpectrum, i, 2);
    var x = map(i, 0, scaledSpectrum.length - 1, 0, width);
    var y = map(point, 0, 255, h, 0);
    curveVertex(x, y);
  }

  // one last point at right corner
  vertex(width, h);

  endShape();
}

function drawSun() {
  var x = width / 2;
  var y = height / 3;
  var diameter = height / 2;
  noStroke();
  fill(229, 55, 18);
  circle(x, y, diameter);
}

/**
 *  Divides an fft array into octaves with each
 *  divided by three, or by a specified "slicesPerOctave".
 *
 *  There are 10 octaves in the range 20 - 20,000 Hz,
 *  so this will result in 10 * slicesPerOctave + 1
 *
 *  @method splitOctaves
 *  @param {Array} spectrum Array of fft.analyze() values
 *  @param {Number} [slicesPerOctave] defaults to thirds
 *  @return {Array} scaledSpectrum array of the spectrum reorganized by division
 *                                 of octaves
 */
function splitOctaves(spectrum, slicesPerOctave) {
  var scaledSpectrum = [];
  var len = spectrum.length;

  // default to 3 slices per octave
  var n = slicesPerOctave || 3;
  var nthRootOfTwo = Math.pow(2, 1 / n);

  // the last N bins are not scaled
  var lowestBin = slicesPerOctave;

  // iterate spectrum in reverse from last bin of the spectrum
  // to the val of slicesPerOctave
  var endBinIndex = len - 1;
  var i = endBinIndex;
  while (i > lowestBin) {
    var nextBinIndex = round(endBinIndex / nthRootOfTwo);
    if (nextBinIndex === 1) return;

    var total = 0;
    var numBins = 0;

    // sum up all the amplitude measurements in the bin group
    for (i = endBinIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins in group to get the average energy
    // in the bin group
    var energy = total / numBins;
    scaledSpectrum.push(energy);

    endBinIndex = nextBinIndex;
  }

  // add the lowest bins at the end - these are not summed
  for (var j = i; j > 0; j--) {
    scaledSpectrum.push(spectrum[j]);
  }

  // reverse so that array has same order as original array (low to high frequencies)
  scaledSpectrum.reverse();

  return scaledSpectrum;
}

// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {
  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < index + neighbors && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof spectrum[i] !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val / smoothedPoints;

  return val;
}

// toggle play/stop when canvas is clicked
function mousePressed() {
  if (!started) {
    started = true;
    userStartAudio();
  }
}
