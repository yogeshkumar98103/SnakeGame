let population;
let mutationRate = 0.05;
let popCount = 2000;

let gameOver = false;
let pauseGameTriggered = false;
let gamePaused = false;
let gameOverTriggered = false;

let fRate = 20;
let speed = 1;

let score;
let stateLabel;
let playButton;
let highestScoreText;
let generations;

function setup(){
    let canvas = createCanvas(900,700);
    canvas.parent('snake-canvas');
    frameRate(fRate);
    createDirections();
    // generateFood();
    population = new Population(popCount, mutationRate);

    strokeWeight(4);
    stroke('#333');
    setupText();
    loadHighestScore();

     while(!population.allDead){
         population.run(false);
     }
    population.calcFitness();
    population.evaluate();
}

function draw(){
    background('#333');

    if(population.bestInCurrentGeneration){
        population.showBest();

        if(!population.bestInCurrentGeneration.isAlive){
            console.log("dead");
            population.createNewGeneration();
            while(!population.allDead){
                population.run(false);
            }
            population.calcFitness();
            let maxPercentage = population.population[0].percentageFitness;
            let maxIndex = 0;
            for(let i = 0; i < popCount; i++){
                if(maxPercentage < population.population[i].percentageFitness){
                    maxPercentage = population.population[i].percentageFitness;
                    maxIndex = i;
                }
            }
            console.log(maxIndex, maxPercentage);
            population.evaluate();
        }
    }
    // Handle Game Paused
    if(pauseGameTriggered && !gamePaused){
        pauseGameSetup();
    }
    // Handle Game Over
    gameOverSetup();
}

function loadHighestScore(){
    localStorage.setItem("highestScore","103");
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
}

function pauseGameSetup(){
    stateLabel.style.visibility = "visible";
    stateLabel.innerHTML = "Game Paused";
    // playButton.style.visibility = "visible";
    // playButton.innerHTML = "Resume";
    stateLabel.style.color = "red";

    gamePaused = true;
} 

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
    else if(keyCode === 32){ // Space Bar
        if(gameOver || gamePaused){
            play();
        }
        else{
            pauseGameTriggered = true;
        }
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

        snake = new Snake();
    }
}

// These are directions where snake can see
let directions = [];
function createDirections(){
    let dirVectors = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1],[-1,1]];

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
    let json1 = {"weights" : population.bestOfAll.brain.weights, "bias" : population.bestOfAll.brain.bias};
    let json2 = {"weights" : population.bestInCurrentGeneration.brain.weights, "bias" : population.bestInCurrentGeneration.brain.bias}
    saveJSON(json1, "overallBest.json");
    saveJSON(json2, "currentBest.json")
}
