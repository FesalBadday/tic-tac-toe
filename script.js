let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameMode = 'player'; // Default game mode: player vs player
let difficultyLevel = 'easy'; // Default difficulty level: easy

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const boardElement = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetBtn');
const modeSelect = document.getElementById('modeSelect');
const difficultySelect = document.getElementById('difficultySelect');

// Initialize the game board
function initializeBoard() {
    boardElement.innerHTML = ''; // Clear existing board
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
    currentPlayer = 'X';
    statusDisplay.textContent = '';
}

// Update cell click handler
function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.dataset.index);

    if (board[cellIndex] === '' && !checkWinner()) {
        board[cellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase()); // Add class 'x' or 'o'
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        if (gameMode === 'computer' && currentPlayer === 'O' && !checkWinner()) {
            playComputerMove();
        }
    }
}

// Update game status
function updateStatus() {
    if (checkWinner()) {
        const winningCombo = getWinningCombo();
        highlightWinningCells(winningCombo);
        const winner = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `${winner} wins!`;
    } else if (!board.includes('')) {
        statusDisplay.textContent = 'It\'s a draw!';
    }
}


// Check for a winner
function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

// Get the winning combo
function getWinningCombo() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combo;
        }
    }
    return null;
}

// Highlight winning cells by drawing a line
function highlightWinningCells(winningCombo) {
    if (winningCombo) {
        const [a, b, c] = winningCombo;
        const cells = boardElement.querySelectorAll('.cell');
        cells[a].classList.add('winner');
        cells[b].classList.add('winner');
        cells[c].classList.add('winner');
    }
}

// Reset the game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    statusDisplay.textContent = '';
    resetCellStyles();
    initializeBoard();
}

// Reset cell styles
function resetCellStyles() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winner'); // Remove winner class
    });
}

// Play against the computer (AI)
function playComputerMove() {
    if (difficultyLevel === 'easy') {
        playRandomMove();
    } else if (difficultyLevel === 'medium') {
        playSmartMove();
    } else if (difficultyLevel === 'impossible') {
        const bestMove = getBestMove();
        board[bestMove.index] = 'O';
        const computerMoveCell = boardElement.querySelector(`[data-index='${bestMove.index}']`);
        computerMoveCell.textContent = 'O';
        currentPlayer = 'X';
        updateStatus();
    }
}

// Play a random move (Easy mode)
function playRandomMove() {
    const emptyCells = board.map((value, index) => value === '' ? index : -1).filter(index => index !== -1);
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const computerMoveIndex = emptyCells[randomIndex];

    board[computerMoveIndex] = 'O';
    const computerMoveCell = boardElement.querySelector(`[data-index='${computerMoveIndex}']`);
    computerMoveCell.textContent = 'O';
    currentPlayer = 'X';
    updateStatus();
}

// Play a smart move (Medium mode)
function playSmartMove() {
    // Check if computer can win in the next move
    const winningMove = getWinningMove('O');
    if (winningMove !== -1) {
        makeMove(winningMove, 'O');
        return;
    }

    // Check if player can win in the next move and block them
    const blockingMove = getWinningMove('X');
    if (blockingMove !== -1) {
        makeMove(blockingMove, 'O');
        return;
    }

    // Otherwise, play a strategic move
    playStrategicMove();
}

// Helper function to play a strategic move (prioritizes center, corners, then edges)
function playStrategicMove() {
    // Prioritize the center cell if available
    const centerIndex = 4;
    if (board[centerIndex] === '') {
        makeMove(centerIndex, 'O');
        return;
    }

    // If center is taken, prioritize corners
    const cornerIndices = [0, 2, 6, 8];
    const availableCorners = cornerIndices.filter(index => board[index] === '');
    if (availableCorners.length > 0) {
        const randomCornerIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        makeMove(randomCornerIndex, 'O');
        return;
    }

    // If center and corners are taken, play any available edge
    const edgeIndices = [1, 3, 5, 7];
    const availableEdges = edgeIndices.filter(index => board[index] === '');
    if (availableEdges.length > 0) {
        const randomEdgeIndex = availableEdges[Math.floor(Math.random() * availableEdges.length)];
        makeMove(randomEdgeIndex, 'O');
        return;
    }

    // Fallback: play a random move (should rarely reach this point)
    playRandomMove();
}


// Helper function to check for winning or blocking moves
function getWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = player;
            if (checkWinner()) {
                board[i] = ''; // Reset for future checks
                return i;
            }
            board[i] = ''; // Reset for future checks
        }
    }
    return -1;
}

// Helper function to make a move on the board
function makeMove(index, player) {
    board[index] = player;
    const computerMoveCell = document.querySelector(`[data-index='${index}']`);
    computerMoveCell.textContent = player;
    currentPlayer = 'X';
    updateStatus();
}

// Get the best move using Minimax algorithm (Impossible mode)
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, false);
            board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return { index: bestMove };
}

// Minimax algorithm
function minimax(board, isMaximizing) {
    if (checkWinnerForPlayer(board, 'X')) {
        return -10;
    } else if (checkWinnerForPlayer(board, 'O')) {
        return 10;
    } else if (!board.includes('')) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, false);
                board[i] = '';
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, true);
                board[i] = '';
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
}

// Check for a winner for a specific player
function checkWinnerForPlayer(board, player) {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

// Event listener for mode selection change
modeSelect.addEventListener('change', () => {
    gameMode = modeSelect.value;
    if (gameMode === 'computer') {
        document.querySelector('.difficulty-selection').style.display = 'block';
    } else {
        document.querySelector('.difficulty-selection').style.display = 'none';
    }
    resetGame();
});

// Event listener for difficulty selection change
difficultySelect.addEventListener('change', () => {
    difficultyLevel = difficultySelect.value;
    resetGame();
});

// Initialize the game
initializeBoard();
resetButton.addEventListener('click', resetGame);
