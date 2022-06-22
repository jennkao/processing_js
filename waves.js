/**
 *  Re-group the FFT into more meaningful values by
 *  splitting into one-third-octave bands,
 *  and by smoothing each point with its neighbors.
 *
 *  Plot over time.
 */

let source, fft;
let cnv;

let started = false;
const NUM_PAGE_DIVISIONS = 1; // controls whether the page is divided in to halves / thirds etc.
const _SPEED = 0; // used if wanted to scroll the waves along the y axis

function setup() {
  // mimics the autoplay policy
  getAudioContext().suspend();

  cnv = createCanvas(windowWidth, windowHeight);
  noFill();
  stroke(0, 100); // whispy-ness of lines

  source = new p5.AudioIn();
  source.start();

  fft = new p5.FFT(0.9, 1024);
  fft.setInput(source);
}

const NUM_WAVE_COLOR_CYCLES = 100;
let cycleCount = 0;
let waveColors = [
  [117, 160, 201],
  [131, 154, 208],
  [113, 119, 176],
  [82, 106, 155],
];
let waveColorInd = 0;
function draw() {
  cycleCount++;
  cycleCount = cycleCount % NUM_WAVE_COLOR_CYCLES;
  if (cycleCount === 0) {
    waveColorInd++;
    waveColorInd = waveColorInd % waveColors.length;
  }

  const spectrum = fft.analyze();
  const scaledSpectrum = splitOctaves(spectrum, 12);

  drawBackground();

  drawSun();

  stroke(0, 100);
  const nextColorInd = (waveColorInd + 1) % waveColors.length;
  const blendedWaveColor = lerpColor(
    color(...waveColors[waveColorInd]),
    color(...waveColors[nextColorInd]),
    cycleCount / NUM_WAVE_COLOR_CYCLES
  );
  drawWave(scaledSpectrum, blendedWaveColor);
}

const BACKGROUND_SECTIONS = 12;
function drawBackground() {
  stroke('white');
  strokeWeight(2);
  background(255, 255, 255, 0);
  rectMode(CORNER);
  const darkSkyColor = color(231, 151, 177);
  const lightSkyColor = color(254, 215, 200);
  const heightPerSection = height / BACKGROUND_SECTIONS;
  for (let i = 0; i < BACKGROUND_SECTIONS; i++) {
    const blendedSkyColor = lerpColor(darkSkyColor, lightSkyColor, i / BACKGROUND_SECTIONS);
    fill(red(blendedSkyColor), green(blendedSkyColor), blue(blendedSkyColor), 60); // alpha controls whether previous lines stay around
    rect(0, heightPerSection * i, width, heightPerSection);
  }
}

const SUN_RADIAL_SECTIONS = 100;
function drawSun() {
  const darkSunColor = color(253, 94, 83);
  const lightSunColor = color(250, 147, 106);
  const x = width / 2;
  const y = height / 3;
  const diameter = height / 2.5;
  noStroke();
  for (let i = SUN_RADIAL_SECTIONS; i >= 0; i--) {
    const blendedColor = lerpColor(lightSunColor, darkSunColor, i / SUN_RADIAL_SECTIONS);
    const dia = map(i, 0, SUN_RADIAL_SECTIONS, 0, diameter);
    fill(blendedColor);
    circle(x, y, dia);
  }
}

function drawWave(scaledSpectrum, color) {
  const maxWaveHeight = height / NUM_PAGE_DIVISIONS;
  noStroke();
  fill(color);
  beginShape();
  curveVertex(0, 0);

  // one at the left corner
  vertex(0, maxWaveHeight);

  for (let i = 0; i < scaledSpectrum.length; i++) {
    const smoothedPoint = smoothPoint(scaledSpectrum, i, 2);
    const x = map(i, 0, scaledSpectrum.length - 1, 0, width);
    const y = map(smoothedPoint, 0, 255, maxWaveHeight, 0);
    curveVertex(x, y);
  }

  // one last point at right corner
  curveVertex(width, maxWaveHeight);
  vertex(width, 0);

  endShape();
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
  const scaledSpectrum = [];
  const len = spectrum.length;

  // default to 3 slices per octave
  const n = slicesPerOctave || 3;
  const nthRootOfTwo = Math.pow(2, 1 / n);

  // the last N bins are not scaled
  const lowestBin = slicesPerOctave;

  // iterate spectrum in reverse from last bin of the spectrum
  // to the val of slicesPerOctave
  let endBinIndex = len - 1;
  let i = endBinIndex;
  while (i > lowestBin) {
    const nextBinIndex = round(endBinIndex / nthRootOfTwo);
    if (nextBinIndex === 1) return;

    let total = 0;
    let numBins = 0;

    // sum up all the amplitude measurements in the bin group
    for (i = endBinIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins in group to get the average energy
    // in the bin group
    const energy = total / numBins;
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
  const neighbors = numberOfNeighbors || 2;
  const len = spectrum.length;

  let val = 0;

  // start below the index
  const indexMinusNeighbors = index - neighbors;
  let smoothedPoints = 0;

  for (let i = indexMinusNeighbors; i < index + neighbors && i < len; i++) {
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
