const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton'); // Game Over Restart
const startButton = document.getElementById('startButton');
const gridSizeSelect = document.getElementById('gridSize');
const difficultySelect = document.getElementById('difficulty');
const countdownDisplay = document.getElementById('countdown');

const settingsArea = document.getElementById('settingsArea');
const gameArea = document.getElementById('gameArea');

const pauseButton = document.getElementById('pauseButton');
const inGameRestartButton = document.getElementById('inGameRestartButton');
const gameControls = document.getElementById('gameControls'); // Get reference to controls div

// CELL_SIZE is passed from Flask

let gameState = null;
let gameInterval = null;
let currentGridSize = 0;
let currentGameSpeed = 0;
let isCountingDown = false;
let isPaused = false;

// --- Drawing Functions ---
function drawGrid() {
    ctx.strokeStyle = '#222'; // Darker grid lines
    // Use currentGridSize for drawing
    for (let i = 0; i < currentGridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawSnake(snake) {
    ctx.fillStyle = '#4CAF50'; // Green snake
    snake.forEach(segment => {
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#333'; // Outline for segments
        ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function drawFood(food) {
    ctx.fillStyle = '#f44336'; // Red food
    ctx.beginPath();
    // Draw a circle for food
    const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 * 0.8; // Make food slightly smaller than cell
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
}

function drawGame(state) {
    // Update local variables from state
    currentGridSize = state.grid_size;
    currentGameSpeed = state.game_speed;

    // Adjust canvas size based on current grid size
    canvas.width = currentGridSize * CELL_SIZE;
    canvas.height = currentGridSize * CELL_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111'; // Background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawSnake(state.snake);
    drawFood(state.food);

    scoreDisplay.textContent = `Score: ${state.score}`;

    if (state.game_over) {
        clearInterval(gameInterval);
        // Hide in-game controls
        gameControls.style.display = 'none';
        // Show game over message
        gameOverMessage.style.display = 'flex'; // Use flex as per CSS
        finalScoreDisplay.textContent = state.score;
    } else {
        // Ensure game over message is hidden
        gameOverMessage.style.display = 'none';
        // Show in-game controls
        gameControls.style.display = 'block'; // Use block as per CSS
    }
}

// --- Game Logic / Communication ---
async function fetchGameState() {
    // Only fetch/update state if not paused and not game over
    if (!isPaused && gameState && !gameState.game_over) {
        try {
            const response = await fetch('/game_state');
            gameState = await response.json();
            drawGame(gameState);

            // If game speed changed, restart the interval
            if (gameInterval && currentGameSpeed !== gameState.game_speed) {
                 startGameLoop(gameState.game_speed);
            }

        } catch (error) {
            console.error('Error fetching game state:', error);
            clearInterval(gameInterval); // Stop game on error
            // Optionally show an error message to the user
        }
    }
}

async function sendMove(direction) {
    // Only send move if game is not over, not counting down, and not paused
    if (gameState && !gameState.game_over && !isCountingDown && !isPaused) {
        try {
            await fetch('/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ direction: direction })
            });
            // No need to fetch state immediately, the interval will do it
        } catch (error) {
            console.error('Error sending move:', error);
        }
    }
}

async function startGame() {
    const selectedGridSize = gridSizeSelect.value;
    const selectedDifficulty = difficultySelect.value;

    try {
        const response = await fetch('/start_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grid_size: selectedGridSize,
                difficulty: selectedDifficulty
            })
        });
        const result = await response.json();
        if (result.status === 'ok') {
            gameState = result.initial_state; // Get initial state from start_game response

            // Ensure game over message and countdown are hidden using style
            gameOverMessage.style.display = 'none';
            countdownDisplay.style.display = 'none';

            // Hide settings, show game area
            settingsArea.classList.add('hidden');
            gameArea.classList.remove('hidden'); // gameArea is flex, so this works

            // Reset pause state and button text
            isPaused = false;
            pauseButton.textContent = 'Pause';

            // Show in-game controls initially using style
            gameControls.style.display = 'block';


            drawGame(gameState); // Draw initial state

            // Start the countdown
            startCountdown(3);
        }
    } catch (error) {
        console.error('Error starting game:', error);
        // Optionally show an error message to the user
    }
}

function startCountdown(count) {
    isCountingDown = true;
    countdownDisplay.style.display = 'block'; // Show countdown
    countdownDisplay.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDisplay.textContent = count;
        } else {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none'; // Hide countdown
            isCountingDown = false;
            // Start the actual game loop after countdown
            startGameLoop(gameState.game_speed);
        }
    }, 1000); // Update countdown every 1 second
}


function showSettingsScreen() {
    // Stop the game loop if it's running
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    // Hide game area, show settings area
    gameArea.classList.add('hidden'); // Hides the flex container
    settingsArea.classList.remove('hidden');

    // Ensure specific elements are hidden using style property
    gameOverMessage.style.display = 'none';
    countdownDisplay.style.display = 'none';
    gameControls.style.display = 'none';


    isCountingDown = false; // Reset countdown flag
    isPaused = false; // Reset pause flag
    pauseButton.textContent = 'Pause'; // Reset pause button text
}

function togglePause() {
    if (gameState && !gameState.game_over && !isCountingDown) {
        isPaused = !isPaused;
        if (isPaused) {
            pauseButton.textContent = 'Resume';
            // Optionally display a "Paused" message on screen
        } else {
            pauseButton.textContent = 'Pause';
            // Optionally hide the "Paused" message
        }
    }
}


function startGameLoop(speed) {
    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    // Start a new interval to fetch game state periodically using the provided speed
    // The fetchGameState function itself checks if the game is paused
    gameInterval = setInterval(fetchGameState, speed);
}

// --- Event Listeners ---
document.addEventListener('keydown', (event) => {
    // Only process input if game is not over, not counting down, and not paused
    if (gameState && !gameState.game_over && !isCountingDown && !isPaused) {
        switch (event.key) {
            case 'ArrowUp':
                sendMove('up');
                break;
            case 'ArrowDown':
                sendMove('down');
                break;
            case 'ArrowLeft':
                sendMove('left');
                break;
            case 'ArrowRight':
                sendMove('right');
                break;
        }
    }
});

startButton.addEventListener('click', startGame); // Start button starts the game
restartButton.addEventListener('click', showSettingsScreen); // Game Over Restart button goes to settings
pauseButton.addEventListener('click', togglePause); // Pause button toggles pause
inGameRestartButton.addEventListener('click', showSettingsScreen); // In-game Restart button goes to settings


// --- Initialization ---
// The game starts on the settings screen.
showSettingsScreen();
