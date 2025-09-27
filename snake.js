const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake;
let direction;
let food;
let gold = null; // gold coin
let score;
let game;
let isPaused = false;

let speed = 200; // starting speed in ms per frame

// Initialize / restart game
function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  food = spawnFood();
  gold = null;
  score = 0;
  document.getElementById("gameOver").style.display = "none";

  if (game) clearInterval(game);
  game = setInterval(gameLoop, 150);
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function maybeSpawnGold() {
  if (!gold && Math.random() < 0.02) {
    gold = spawnFood();
    setTimeout(() => {
      gold = null;
    }, 5000);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Head
      ctx.fillStyle = "limegreen";
      ctx.fillRect(segment.x, segment.y, box, box);

      // Eyes
      ctx.fillStyle = "white";
      let eyeSize = 4;
      let eye1 = {};
      let eye2 = {};

      if (direction === "RIGHT") {
        eye1 = { x: segment.x + box - eyeSize - 2, y: segment.y + 4 };
        eye2 = { x: segment.x + box - eyeSize - 2, y: segment.y + box - 8 };
      } else if (direction === "LEFT") {
        eye1 = { x: segment.x + 2, y: segment.y + 4 };
        eye2 = { x: segment.x + 2, y: segment.y + box - 8 };
      } else if (direction === "UP") {
        eye1 = { x: segment.x + 4, y: segment.y + 2 };
        eye2 = { x: segment.x + box - 8, y: segment.y + 2 };
      } else if (direction === "DOWN") {
        eye1 = { x: segment.x + 4, y: segment.y + box - eyeSize - 2 };
        eye2 = { x: segment.x + box - 8, y: segment.y + box - eyeSize - 2 };
      }

      ctx.fillRect(eye1.x, eye1.y, eyeSize, eyeSize);
      ctx.fillRect(eye2.x, eye2.y, eyeSize, eyeSize);

      // Pupils
      ctx.fillStyle = "black";
      ctx.fillRect(eye1.x + 1, eye1.y + 1, 2, 2);
      ctx.fillRect(eye2.x + 1, eye2.y + 1, 2, 2);
    } else {
      // Body
      ctx.fillStyle = "green";
      ctx.fillRect(segment.x, segment.y, box, box);
    }
  });

  // Normal food
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
  ctx.fill();

  // Gold coin
  if (gold) {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(gold.x + box / 2, gold.y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Score
  document.getElementById("score").innerText = "Score: " + score;
}

function moveSnake() {
  let head = { ...snake[0] };

  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  // ✅ Wall wrapping
  if (head.x < 0) head.x = canvas.width - box;
  if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - box;
  if (head.y >= canvas.height) head.y = 0;

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
  } else if (gold && head.x === gold.x && head.y === gold.y) {
    score += 5;
    gold = null;
  } else {
    snake.pop();
  }

  // Collision with self
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    clearInterval(game);
    document.getElementById("gameOver").style.display = "block";
    return;
  }

  snake.unshift(head);
}

function gameLoop() {
  if (!isPaused) {
    moveSnake();
    maybeSpawnGold();
    draw();
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Mobile button controls
document.getElementById("leftBtn").addEventListener("click", () => {
  if (direction !== "RIGHT") direction = "LEFT";
});
document.getElementById("upBtn").addEventListener("click", () => {
  if (direction !== "DOWN") direction = "UP";
});
document.getElementById("rightBtn").addEventListener("click", () => {
  if (direction !== "LEFT") direction = "RIGHT";
});
document.getElementById("downBtn").addEventListener("click", () => {
  if (direction !== "UP") direction = "DOWN";
});

// Swipe gestures
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

// ✅ Pause button
document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").innerText = isPaused ? "Play" : "Pause";
});

// ✅ Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
  initGame();
});

// Start game first time
initGame();
