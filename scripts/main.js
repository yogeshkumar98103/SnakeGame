// Gameplay Type
const HUMAN_PLAYING = 1;
const AI_PLAYING = 2;
const AI_LEARNING = 3;

// Strategy
const GENETIC_ALGORITHM = 1;
const A_STAR = 2;

let type = AI_PLAYING;
let strategy = GENETIC_ALGORITHM;

// Game Constants
const blockSize = 20;
const learningRate = 0.2;
const mutationRate = 0.05;
const popCount = 2000;

let population;

let gameOver = false;
let pauseGameTriggered = false;
let gamePaused = false;
let gameOverTriggered = false;

let speed = 1;
let fRate = 60;

let score;
let stateLabel;
let playButton;
let highestScoreText;
let generations;
let genrationText;

let snake;
let data;
function preload(){
    data = loadJSON("Saved Data/snake-1.json");
}

function setup(){
    let canvas = createCanvas(900,700);
    canvas.parent('snake-canvas');

    strokeWeight(4);
    stroke('#333');
    setupText();
    loadHighestScore();

    if(type == HUMAN_PLAYING){
        fRate = 10;
        snake = new Snake();
        snake.type = HUMAN_PLAYING;
        snake.humanPlaying = true;
        generationText.style.display = "inline-block";
    }
    else{
        switch(strategy){
            case GENETIC_ALGORITHM: geneticAlgoSetup();
                                    break;
            case A_STAR:            aStarSetup();
                                    break;
        }
    }
    
    frameRate(fRate);
}

function geneticAlgoSetup(){
    createDirections();
    switch(type){
        case AI_PLAYING:    loadSnake(data);
                            break;

        case AI_LEARNING:   population = new Population(popCount, mutationRate);
                            while(!population.allSnakesDead){
                                population.runSimulation(false);
                            }
                            population.calcFitness();
                            break;
    }
}

let rows, cols;
let pathFinder;
let grid;
function aStarSetup(){
    rows = height/blockSize;
    cols = width/blockSize;
    snake = new Snake();
    pathFinder = new AStar();
}

function draw(){
    background('#333');
    if(!gameOver){
        switch(type){
            case AI_LEARNING:   
                population.showBest();
                if(!population.currentBestSnake.isAlive){
                    population.createNewGeneration();
                    while(!population.allSnakesDead){
                        population.runSimulation(false);
                        population.calcFitness();
                    }
                    handleText();
                }
                break;
    
            default:
                if(snake){
                    snake.run();
                    if(!snake.isAlive){
                        gameOverTriggered = true;
                    }
                    break;
                }    
        }
    }
    else{
        if(snake){
            snake.display();
        }
    }
    
    // Handle Game Paused
    pauseGameSetup();

    // Handle Game Over
    gameOverSetup();
}

function handleText(){
    highestScoreText.innerHTML = population.globalBestScore || 0;
    score.innerHTML = 3;
    generations.innerHTML = population.generations - 1;
}

function loadHighestScore(){
    let hs = localStorage.getItem("highestScore");
    if(hs != undefined){
        highestScoreText.innerHTML = hs;
    }
}

function setupText(){
    score = document.getElementById('score');
    stateLabel = document.getElementById('state-label');
    playButton = document.getElementById('play-again');
    highestScoreText = document.getElementById('highest-score');
    generations = document.getElementById('generation');
    generationText = document.getElementById('generation-text');
}

function pauseGameSetup(){
    if(pauseGameTriggered && !gamePaused){
        stateLabel.style.visibility = "visible";
        stateLabel.innerHTML = "Game Paused";
        playButton.style.visibility = "visible";
        playButton.innerHTML = "Resume";
        stateLabel.style.color = "red";

        gamePaused = true;
    }
}

// These are used for blinking text;
let counter = 1;
let textColor;
function gameOverSetup(){
    if(gameOverTriggered && !gameOver){
        stateLabel.style.visibility = "visible";
        stateLabel.innerHTML = "Game Over";
        playButton.style.visibility = "visible";
        playButton.innerHTML = "Play Again";

        // Handle Highest Score
        highestScore = localStorage.getItem("highestScore");
        if(highestScore != undefined){
            console.log(parseInt(highestScore), parseInt(score.innerHTML));
            if(parseInt(highestScore) < parseInt(score.innerHTML)){
                localStorage.setItem("highestScore", score.innerHTML);
                highestScoreText.innerHTML = score.innerHTML;
            }
        }
        else{
            highestScoreText.innerHTML = score.innerHTML;
            localStorage.setItem("highestScore", score.innerHTML);
        }

        gameOver = true;    
    }
    if(gameOver){
        console.log(counter, fRate);
        if(counter >= 1 && counter <= fRate/2){
            textColor = "red"
        }
        else{
            textColor = "white";
        }
        counter = (counter + 1) % fRate;
        stateLabel.style.color = textColor;
    }
}

// Change Direction of snake based on key Pressed
function keyPressed(){
    if(type == HUMAN_PLAYING){
        if(keyCode === UP_ARROW){
            snake.moveUp();
        }
        else if(keyCode === DOWN_ARROW){
            snake.moveDown();
        }
        else if(keyCode === LEFT_ARROW){
            snake.moveLeft();
        }
        else if(keyCode === RIGHT_ARROW){
            snake.moveRight();
        }
    }

    if(key === ' '){ // Space Bar
        if(gameOver || gamePaused){
            play();
        }
        else{
            pauseGameTriggered = true;
        }
    }

    if(key === 'q'){
        gameOverTriggered = true;
    }
}

function play(){
    stateLabel.style.visibility = "hidden";
    playButton.style.visibility = "hidden";

    if(gamePaused){
        gamePaused = false;
        pauseGameTriggered = false; 
    }
    else{
        score.innerHTML = 0;
        gameOverTriggered = false;
        gameOver = false;
        if(type != AI_LEARNING){
            if((type == AI_PLAYING && strategy == A_STAR) || type == HUMAN_PLAYING){
                snake = new Snake();
            }else if(type == AI_PLAYING && strategy == GENETIC_ALGORITHM){
                snake = new Snake(snakeBrain);
            }
            snake.type = type;
        }
    }
}

// These are directions where snake can see
let directions = [];
function createDirections(){
    let dirVectors = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1],[-1,1]];
    directions = [];
    for(let i = 0; i < 8; i++){
        dirVectors[i][0] *= blockSize;
        dirVectors[i][1] *= blockSize;
        directions.push(createVector(dirVectors[i][0], dirVectors[i][1]));
    }
}



// -------------------- Speed Slider -------------------------
var inputTimer;
var doneInterval = 300;

var slider = document.getElementById("myRange");
slider.oninput = function(){
    clearTimeout(inputTimer);
    inputTimer = setTimeout(newSpeed, doneInterval);
}

function newSpeed(){
    speed = slider.value
}

// ------------------ Saving And Loading ---------------------
function downloadBest(){
    let json1 = {"weights" : population.globalBestSnake.brain.weights, "bias" : population.bestOfAll.brain.bias};
    let json2 = {"weights" : population.currentBestSnake.brain.weights, "bias" : population.bestInCurrentGeneration.brain.bias}
    saveJSON({"global" : json1, "current" : json2}, "snakeData.json");
}

let snakeBrain;
function loadSnake(data){
    console.log(data);

    let weights = data.weights;
    let bias = data.bias;

    weights[0] = new Matrix(weights[0].rows, weights[0].cols, weights[0].data);
    weights[1] = new Matrix(weights[1].rows, weights[1].cols, weights[1].data);
    weights[2] = new Matrix(weights[2].rows, weights[2].cols, weights[2].data);

    bias[0] = new Matrix(bias[0].rows, bias[0].cols, bias[0].data);
    bias[1] = new Matrix(bias[1].rows, bias[1].cols, bias[1].data);
    bias[2] = new Matrix(bias[2].rows, bias[2].cols, bias[2].data);
    
    snakeBrain = new NeuralNetwork([24,16,16,4],0.1,weights,bias);
    snake = new Snake(snakeBrain);
    snake.type = AI_PLAYING;
}
