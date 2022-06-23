let fft;
let started = false;
const minBarWidth = 2;
const barSpacingPadding = 10;

const FREQ_TYPES = {
  bass: 0,
  lowMid: 1,
  mid: 2,
  highMid: 3,
  treble: 4,
};

const prevFreqData = {
  bass: new Array(50),
  lowMid: new Array(50),
  mid: new Array(50),
  highMid: new Array(50),
  treble: new Array(50),
};

const freqMetadata = {
  bass: { lowHueValue: 0, highHueValue: 51 },
  lowMid: { lowHueValue: 51, highHueValue: 102 },
  mid: { lowHueValue: 102, highHueValue: 153 },
  highMid: { lowHueValue: 200, highHueValue: 255 },
  treble: { lowHueValue: 255, highHueValue: 360 },
};

function setup() {
  // mimics the autoplay policy
  getAudioContext().suspend();

  background(0);
  createCanvas(windowWidth, windowHeight);
  noStroke();

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  rectMode(CENTER);
  colorMode(HSB);
}

function draw() {
  background(0);

  fft.analyze();

  const freqKeys = Object.keys(FREQ_TYPES);
  for (let i = 0; i < freqKeys.length; i++) {
    const key = freqKeys[i];
    const energy = fft.getEnergy(key);
    prevFreqData[key].shift();
    prevFreqData[key].push(energy);
  }

  for (let i = 0; i < freqKeys.length; i++) {
    const key = freqKeys[i];
    const prevData = prevFreqData[key];

    const widthPerFreq = width / freqKeys.length;
    const x = i * widthPerFreq + widthPerFreq / 2;
    for (let j = 0; j < prevData.length; j++) {
      const energy = prevData[j];
      const y = map(j, 0, prevData.length, 0, height / 2);
      const w = map(energy, 0, 255, minBarWidth, widthPerFreq);
      var alphaValue = map(i, 0, prevData.length, 1, 255);
      var hueValue = map(
        energy,
        0,
        255,
        freqMetadata[key]['lowHueValue'],
        freqMetadata[key]['highHueValue']
      );
      fill(hueValue, 255, 255, alphaValue);
      rect(x, y, w, 2);
      rect(x, height - y, w, 2);
    }
  }
}

// toggle play/stop when canvas is clicked
function mousePressed() {
  if (!started) {
    started = true;
    userStartAudio();
  }
}
