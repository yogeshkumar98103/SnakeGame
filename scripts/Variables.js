// Gameplay Type
const HUMAN = 0;
const AI = 1;
const CARNAGE = 2;

// Game Constants
const blockSize = 20;

// Game State
let gameOver;
let pauseGameTriggered;
let gamePaused;
let gameOverTriggered;

// Display Information on screen
let score;
let stateLabel;
let playButton;
let highestScoreText;
let generations;
let genrationText;

// Used In A Star Mode
let rows, cols;
let pathFinder;
let grid;

// In in AI Mode with Learning Enabled
const learningRate = 0.2;
const mutationRate = 0.05;
const popCount = 2000;
let population;

// Snake Variables
let snake;
let snakeBrain;
let data;