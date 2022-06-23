let video;
let fm;
let faces = null;
let foods = [];
let score = 0;
let state = null;
let level = null;
let round = null;
let startBtn = null;
let roundStartTime = null;
let correctSound = null;
let wrongSound = null;

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const GAME_STATE = {
  INITIALIZED: 1,
  RUNNING: 2,
  DONE: 3,
};

const FOOD_CLASSES = [Apple];

const LEVELS = [
  {
    secs: 3,
    points: 10,
    rounds: 3,
  },
  {
    secs: 2,
    points: 20,
    rounds: 3,
  },
  {
    secs: 1,
    points: 30,
    rounds: 3,
  },
];

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  video = createCapture(VIDEO);
  video.hide();

  fm = ml5.facemesh(video);
  fm.on('predict', gotFace);

  startBtn = createButton('start');
  startBtn.hide();

  correctSound = loadSound('./correct_sound.mp3');
  wrongSound = loadSound('./wrong_sound.mp3');
}

function gotFace(results) {
  if (results.length > 0) {
    if (state === null) {
      state = GAME_STATE.INITIALIZED;
    }
    faces = results;
  }
}

function startGame() {
  state = GAME_STATE.RUNNING;
  startBtn.hide();

  transitionRound();
}

function mirrorTransformation(cb) {
  push();
  //move image by the width of image to the left
  translate(video.width, 0);
  //then scale it by -1 in the x-axis to flip the image
  scale(-1, 1);

  cb();

  pop();
}

function draw() {
  mirrorTransformation(() => {
    image(video, 0, 0, width, height);
  });

  if (state === null) {
    handlePregameState();
  } else if (state === GAME_STATE.INITIALIZED) {
    handleInitializedState();
  } else if (state === GAME_STATE.RUNNING) {
    handleRunningState();
  } else {
    handleDoneState();
  }
}

function handlePregameState() {
  renderText(`Loading...`, video.width / 2, video.height / 2, 32, 'black', CENTER);
}

function handleInitializedState() {
  startBtn.show();
  startBtn.position(video.width / 2, video.height / 2);
  startBtn.mousePressed(startGame);
}

function handleRunningState() {
  // render mouth
  for (let i = 0; i < faces.length; i += 1) {
    const mouthpoints = getFaceMouthPoints(faces[i]);
    drawMouth(mouthpoints);
  }

  // don't render game elements if there is no current level or round
  if (!level || !round) {
    return;
  }

  // render level and round
  renderText(`Level: ${level} Round: ${round}`, 20, 40, 15, 'black', LEFT);

  // render score
  renderText(`Score: ${score}`, video.width - 20, 20, 15, 'black', RIGHT);

  // render time limit
  const levelObj = getCurrentLevel();
  if (levelObj) {
    const currTimeMs = new Date().valueOf();
    const elapsedMs = currTimeMs - roundStartTime.valueOf();
    const msLeft = levelObj.secs * 1000 - elapsedMs;
    const secsLeft = Math.round(msLeft / 1000);
    renderText(`Time left: ${secsLeft}`, 20, 20, 15, 'black', LEFT);
  }

  // render foods
  foods.forEach((food) => {
    mirrorTransformation(() => {
      food.draw();
    });
  });
}

function drawMouth(mouthpoints) {
  for (let j = 0; j < mouthpoints.length; j += 1) {
    const [x, y] = mouthpoints[j];
    mirrorTransformation(() => {
      fill(0, 255, 0);
      ellipse(x, y, 5, 5);
    });
  }
}

function handleDoneState() {
  renderText(`Game Over`, video.width / 2, video.height / 2, 32, 'black', CENTER);
  renderText(`Score: ${score}`, video.width - 20, 20, 15, 'black', RIGHT);
}

function getCurrentLevel() {
  if (!level) {
    return null;
  }
  return LEVELS[level - 1];
}

function startNewRoundTimer(timeMs) {
  roundStartTime = new Date();
  console.log('setting new round time', roundStartTime);
  timeout = setTimeout(() => {
    console.log(`level ${level} round ${round} complete`);
    recalculateScore();
    transitionRound();
  }, timeMs);
}

function transitionRound() {
  if (!getCurrentLevel()) {
    // initialize first level
    level = 1;
    round = 1;
  } else if (round >= getCurrentLevel().rounds) {
    // move on to next level
    level++;
    round = 1;
  } else {
    // move on to next round of current level
    round++;
  }

  // handle game end
  if (level > LEVELS.length) {
    state = GAME_STATE.DONE;
    return;
  }

  // generate a food item in a random spot
  generateRoundFood();

  // set timeout for the first round of next level
  startNewRoundTimer(getCurrentLevel().secs * 1000);
}

function generateRoundFood() {
  const padding = video.width / 15;
  const FoodClass = random(FOOD_CLASSES);
  // add extra padding to the food y coordinate since poseNet mouth detection
  // doesn't work as well when the rest of face is not in view
  foods = [new FoodClass(random(padding, width - padding), random(padding * 2, height - padding))];
}

function renderText(message, x, y, size, color, alignMode) {
  textSize(size);
  fill(color);
  textAlign(alignMode);
  text(message, x, y);
}

function getFaceMouthPoints(face) {
  return [...face.annotations.lipsLowerOuter, ...face.annotations.lipsUpperOuter];
}

function recalculateScore() {
  for (let i = 0; i < faces.length; i += 1) {
    const mouthpoints = getFaceMouthPoints(faces[i]);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let j = 0; j < mouthpoints.length; j += 1) {
      const [x, y] = mouthpoints[j];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    for (let k = 0; k < foods.length; k++) {
      const food = foods[k];
      const withinX = food.x >= minX && food.x <= maxX;
      const withinY = food.y >= minY && food.y <= maxY;
      if (withinX && withinY) {
        const levelObj = getCurrentLevel();
        score += levelObj.points;
        correctSound.play();
      } else {
        wrongSound.play();
      }
    }
  }
}

// improvements
// 1) use mouthpoint circle enclosure instead of min / max of x and y
// 2) balls should appear further apart
// 3) more time between levels, awareness of level
// 4) more types of food / point variety - some fruits high, some bomb
// 5) multiple foods per round
