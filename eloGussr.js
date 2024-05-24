// API token for accessing LiChess API
const API_TOKEN = process.env.API_TOKEN;

// Elements in the DOM
const timeControlSelect = document.getElementById("time-control");
const newGameButton = document.getElementById("new-game");
const gameInfo = document.getElementById("game-info");
const guessInput = document.getElementById("guess");
const submitGuessButton = document.getElementById("submit-guess");
const feedbackDiv = document.getElementById("feedback");
const boardContainer = document.getElementById("board-container");

// Initialize game variables
let gameData = null;
let actualElo = null;
let timeControl = "rapid";   
let userGuess = null;
let remainingTime = 60; // Time limit in seconds
let countdownTimer = null;

// Audio files for sound effects
const correctSound = new Audio('correct.mp3');
const incorrectSound = new Audio('incorrect.mp3');
const countdownSound = new Audio('countdown.mp3');

// Get a random game from LiChess API based on the selected time control
async function getGame() {
  const response = await fetch(`https://api.chess.com/pub/player/Hikaru/games?&rated=true&variant=standard&clocks=true&time_class=${timeControl}&pgnInJson=true`, {
    method: "GET"
  });

  if (response.ok) {
    const data = await response.json();
    gameData = data[0];
    actualElo = data[0].players.white.rating;
    const gameUrl = data[0].url; 
    const gameId = data[0].id;
    const whiteId = data[0].players.white.user.id;
    const blackId = data[0].players.black.user.id;
    gameInfo.innerHTML = `Game ID: ${gameId}<br>White: ${whiteId} (${actualElo})<br>Black: ${blackId}<br><a href="${gameUrl}" target="_blank">View Game on LiChess</a>`;
    guessInput.disabled = false;
    submitGuessButton.disabled = false;
    feedbackDiv.innerHTML = "";

    // Create the board
    const board = Chessboard('board-container', {
      draggable: false,
      position: 'start'
    });

    // Load the game on the board
    const moves = gameData.moves;
    const game = new Chess();
    moves.split(" ").forEach(move => {
      game.move(move);
      board.position(game.fen());
    });

    // Start the countdown timer
    remainingTime = 60;
    countdownTimer = setInterval(() => {
      remainingTime--;
      if (remainingTime <= 10) {
        countdownSound.play();
      }
      if (remainingTime === 0) {
        clearInterval(countdownTimer);
        feedbackDiv.innerHTML = `Time's up! The actual Elo rating was ${actualElo}.`;
        guessInput.disabled = true;
        submitGuessButton.disabled = true;
      }
    }, 1000);

  } else {
    gameInfo.innerHTML = "Error: Failed to retrieve game.";
  }
}

// Initialize the game
getGame();

// Add event listeners to buttons and select element
newGameButton.addEventListener("click", () => {
  getGame();
  guessInput.value = "";
  guessInput.disabled = true;
  submitGuessButton.disabled = true;
});

timeControlSelect.addEventListener("change", () => {
  timeControl = timeControlSelect.value;
  getGame();
});

submitGuessButton.addEventListener("click", () => {
  userGuess = parseInt(guessInput.value);
  if (isNaN(userGuess)
(userGuess)) {
    feedbackDiv.innerHTML = "Please enter a number.";
    return;
  }
  const difference = Math.abs(userGuess - actualElo);
  const message = `You were ${difference} points off.`;
  if (difference <= 50) {
    feedbackDiv.innerHTML = `Correct! ${message}`;
  } else {
    feedbackDiv.innerHTML = `Incorrect! ${message}`;
  }
});
