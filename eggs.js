const NUM_EGGS = 3;
let eggs = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noiseSeed(99);
  angleMode(DEGREES);
  colorMode(HSL);
  frameRate(3);

  const eggBoxWidth = windowWidth / NUM_EGGS;
  for (let i = 0; i < NUM_EGGS; i++) {
    const eggStartX = eggBoxWidth * i + eggBoxWidth / 2;
    const eggStartY = windowHeight / 2;
    eggs.push(new Egg(eggStartX, eggStartY, eggBoxWidth));
  }
}

function draw() {
  background(0);
  eggs.forEach((egg) => {
    egg.draw();
    egg.move();
  });

  const eggBoxWidth = windowWidth / NUM_EGGS;
  let isCrossing = false;
  eggs = eggs.filter((egg) => {
    if (egg.x < 0 && egg.x > -egg.width) {
      isCrossing = true;
    }
    return egg.x > -egg.width;
  });

  if (isCrossing && eggs.length < NUM_EGGS + 1) {
    eggs.push(new Egg(windowWidth, windowHeight / 2, eggBoxWidth));
  }
}

class Egg {
  constructor(x, y, eggBoxWidth) {
    this.x = x;
    this.y = y;
    this.eggBoxWidth = eggBoxWidth;
    this.width = eggBoxWidth / 4;
    this.hue = random(25, 55);
    this.yolks = this.generateYolk();
    this.whites = this.generateWhites();
  }

  move() {
    this.x = this.x - 20;
    this.whites = this.generateWhites();
  }

  draw() {
    push();
    translate(this.x, this.y);
    this.drawWhites();
    this.drawYolk();
    pop();
  }

  generateWhites() {
    const eggWhitePoints = [];
    let noiseSeed = random(1000);
    for (let i = 0; i < 90; i++) {
      let radius = this.width + map(noise(noiseSeed + i / 15), 0, 1, 6, 60);
      let x = sin(4 * i);
      let y = cos(4 * i);
      eggWhitePoints.push([radius * x, radius * y]);
    }
    return eggWhitePoints;
  }

  drawWhites() {
    fill(255);
    noStroke();

    beginShape();
    for (let i = 0; i < this.whites.length; i++) {
      const point = this.whites[i];
      vertex(point[0], point[1]);
    }
    endShape(CLOSE);
  }

  drawYolk() {
    fill(this.hue, 100, 50);
    noStroke();

    beginShape();
    for (let i = 0; i < this.yolks.length; i++) {
      const point = this.yolks[i];
      vertex(point[0], point[1]);
    }
    endShape(CLOSE);
  }

  generateYolk() {
    const yolkPoints = [];
    let noiseSeed = random(10);
    for (let i = 0; i < 90; i++) {
      let radius = 10 + map(noise(noiseSeed + i / 90), 0, 1, 6, 40);
      let x = sin(4 * i);
      let y = cos(4 * i);
      yolkPoints.push([radius * x, radius * y]);
    }
    return yolkPoints;
  }
}
