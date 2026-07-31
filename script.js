// ================================
// Conway Volume Controller
// Part 1
// ================================

// ---------- Canvas ----------

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ROWS = 40;
const COLS = 40;
const CELL_SIZE = 15;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

// ---------- UI ----------

const generationText = document.getElementById("generation");
const populationText = document.getElementById("population");
const volumeText = document.getElementById("volumeText");
const volumeFill = document.getElementById("volumeFill");

const runBtn = document.getElementById("runBtn");
const randomBtn = document.getElementById("randomBtn");
const clearBtn = document.getElementById("clearBtn");
const stepBtn = document.getElementById("stepBtn");
const speedBtn = document.getElementById("speedBtn");

const audio = document.getElementById("audio");
const audioFile = document.getElementById("audioFile");

// ---------- Board ----------

let board = [];
let generation = 0;

let running = false;

let speed = 200;

const speedLevels = [400, 200, 100, 50];

let speedIndex = 1;

function createBoard() {
  board = [];

  for (let y = 0; y < ROWS; y++) {
    const row = [];

    for (let x = 0; x < COLS; x++) {
      row.push(0);
    }

    board.push(row);
  }
}

createBoard();

// ---------- Draw ----------

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = board[y][x] ? "#59ff93" : "#141821";

      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      ctx.strokeStyle = "#222";

      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

drawGrid();

// ---------- Click ----------

canvas.addEventListener("click", (e) => {
  if (running) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);

  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;

  board[y][x] ^= 1;

  drawGrid();

  updateStats();
});

// ---------- Population ----------

function getPopulation() {
  let total = 0;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) total++;
    }
  }

  return total;
}

// ---------- UI Update ----------

function updateStats() {
  const population = getPopulation();

  generationText.textContent = generation;

  populationText.textContent = population;

  const volume = Math.min(Math.round((population / (ROWS * COLS)) * 100 * 4),100);

  volumeText.textContent = volume + "%";

  volumeFill.style.width = volume + "%";

  audio.volume = volume / 100;
}

updateStats();

// ---------- Audio ----------

audioFile.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  audio.src = URL.createObjectURL(file);

  audio.play();
});

// ================================
// Conway Volume Controller
// Part 2
// ================================

// ---------- Conway Rules ----------

function countNeighbors(x, y) {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      // 자기 자신 제외
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      // 바깥은 죽은 셀 처리
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;

      if (board[ny][nx]) count++;
    }
  }

  return count;
}

// ---------- Next Generation ----------

function nextGeneration() {
  const next = [];

  for (let y = 0; y < ROWS; y++) {
    const row = [];

    for (let x = 0; x < COLS; x++) {
      const neighbors = countNeighbors(x, y);

      const alive = board[y][x];

      let result = 0;

      // 살아있는 셀
      if (alive) {
        if (neighbors === 2 || neighbors === 3) {
          result = 1;
        }
      }

      // 죽은 셀
      else {
        if (neighbors === 3) {
          result = 1;
        }
      }

      row.push(result);
    }

    next.push(row);
  }

  board = next;

  generation++;

  drawGrid();

  updateStats();
}

// ---------- Game Loop ----------

let timer = null;

function startGame() {
  if (running) return;

  running = true;

  runBtn.textContent = "⏸ Pause";

  timer = setInterval(() => {
    nextGeneration();
  }, speed);
}

function stopGame() {
  running = false;

  runBtn.textContent = "▶ Run";

  clearInterval(timer);
}

// ---------- Run Button ----------

runBtn.addEventListener("click", () => {
  if (running) {
    stopGame();
  } else {
    startGame();
  }
});

// ---------- Step Button ----------

stepBtn.addEventListener("click", () => {
  if (running) return;

  nextGeneration();
});

// ---------- Speed ----------

speedBtn.addEventListener("click", () => {
  speedIndex++;

  if (speedIndex >= speedLevels.length) {
    speedIndex = 0;
  }

  speed = speedLevels[speedIndex];

  speedBtn.textContent = `${["0.5x", "1x", "2x", "4x"][speedIndex]}`;

  // 실행 중이면 다시 시작
  if (running) {
    stopGame();

    startGame();
  }
});

// ================================
// Conway Volume Controller
// Part 3
// ================================

// ---------- Clear ----------

function clearBoard() {
  stopGame();

  createBoard();

  generation = 0;

  drawGrid();

  updateStats();
}

clearBtn.addEventListener("click", () => {
  clearBoard();
});

// ---------- Random ----------

function randomBoard() {
  stopGame();

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      board[y][x] = Math.random() > 0.7 ? 1 : 0;
    }
  }

  generation = 0;

  drawGrid();

  updateStats();
}

randomBtn.addEventListener("click", () => {
  randomBoard();
});

// ---------- Pattern Loader ----------

function setCell(x, y) {
  if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
    board[y][x] = 1;
  }
}

function loadGlider() {
  clearBoard();

  const pattern = [
    [1, 0, 0],

    [0, 1, 1],

    [1, 1, 0],
  ];

  const startX = 18;
  const startY = 18;

  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x]) {
        setCell(startX + x, startY + y);
      }
    }
  }

  drawGrid();

  updateStats();
}

// ---------- Gosper Glider Gun ----------

function loadGosperGun() {
  clearBoard();

  const cells = [
    [1, 5],
    [1, 6],

    [2, 5],
    [2, 6],

    [11, 5],
    [11, 6],
    [11, 7],

    [12, 4],
    [12, 8],

    [13, 3],
    [13, 9],

    [14, 3],
    [14, 9],

    [15, 6],

    [16, 4],
    [16, 8],

    [17, 5],
    [17, 6],
    [17, 7],

    [18, 6],

    [21, 3],
    [21, 4],
    [21, 5],

    [22, 3],
    [22, 4],
    [22, 5],

    [23, 2],
    [23, 6],

    [25, 1],
    [25, 2],
    [25, 6],
    [25, 7],
  ];

  for (const [x, y] of cells) {
    setCell(x + 5, y + 10);
  }

  drawGrid();

  updateStats();
}

// ---------- Keyboard Shortcuts ----------

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (running) stopGame();
    else startGame();
  }

  if (e.code === "KeyR") {
    randomBoard();
  }

  if (e.code === "KeyC") {
    clearBoard();
  }
});

// ---------- Final Render ----------

drawGrid();

updateStats();
