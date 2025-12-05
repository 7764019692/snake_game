// ======== CANVAS SETUP ========
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreSpan = document.getElementById("score");
const highScoreSpan = document.getElementById("highScore");
const avgScoreSpan = document.getElementById("avgScore");
const startBtn = document.getElementById("startBtn");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

let snake = [];
let velocity = { x: 0, y: 0 };
let food = {};
let score = 0;
let gameLoop = null;
let gameOver = false;

// ======== INITIAL GAME RESET ========
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 1, y: 0 }; // snake starts moving RIGHT
    food = getRandomFoodPosition();
    score = 0;
    scoreSpan.textContent = score;
    gameOver = false;
}

// ======== RANDOM FOOD POSITION ========
function getRandomFoodPosition() {
    return {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

// ======== MAIN GAME LOOP ========
function updateGame() {
    if (gameOver) return;

    const head = {
        x: snake[0].x + velocity.x,
        y: snake[0].y + velocity.y
    };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return endGame();
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return endGame();
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreSpan.textContent = score;
        food = getRandomFoodPosition();
    } else {
        snake.pop();
    }

    drawGame();
}

// ======== DRAW EVERYTHING ========
function drawGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

    // Snake
    ctx.fillStyle = "lime";
    snake.forEach(part => {
        ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize - 1, tileSize - 1);
    });
}

// ======== GAME OVER ========
function endGame() {
    clearInterval(gameLoop);
    gameOver = true;
    sendScore(score);
    alert("Game Over! Your score was " + score);
}

// ======== KEYBOARD CONTROLS ========
document.addEventListener("keydown", function (e) {
    if (gameOver) return;

    if (e.key === "ArrowUp" && velocity.y !== 1) {
        velocity = { x: 0, y: -1 };
    } 
    else if (e.key === "ArrowDown" && velocity.y !== -1) {
        velocity = { x: 0, y: 1 };
    } 
    else if (e.key === "ArrowLeft" && velocity.x !== 1) {
        velocity = { x: -1, y: 0 };
    } 
    else if (e.key === "ArrowRight" && velocity.x !== -1) {
        velocity = { x: 1, y: 0 };
    }
});

// ======== START BUTTON ========
startBtn.addEventListener("click", () => {
    resetGame();
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 110); // Speed of snake
});

// ======== SEND SCORE TO FLASK BACKEND ========
function sendScore(score) {
    fetch("/submit_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: score })
    })
    .then(res => res.json())
    .then(data => {
        highScoreSpan.textContent = data.high_score;
        avgScoreSpan.textContent = data.average_score;
    })
    .catch(err => console.log("Error:", err));
}

// Load initial frame
drawGame();
