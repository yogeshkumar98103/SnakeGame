let mode = AI;
let learning = false;

let speed = 1;
let fRate;
let fRateChanged;

// ==============================================
//                  Setup Modes
// ==============================================

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

    initialize();
    modeSetup();
}

function initialize(){
    gameOver = false;
    pauseGameTriggered = false;
    gamePaused = false;
    gameOverTriggered = false;
    fRateChanged = false;
    score.innerHTML = 0;
    stateLabel.style.visibility = "hidden";
    playButton.style.visibility = "hidden";
}

function modeSetup(){
    switch(mode){
        case HUMAN:
            fRate = 15;
            snake = new Snake();
            generationText.style.display = "none";
            break;

        case AI:
            createDirections(); 
            if(learning){
                population = new Population(popCount, mutationRate);
                while(!population.allSnakesDead){
                    population.runSimulation(false);
                }
                population.calcFitness();
            }
            else{
                loadSnake(data);
                snake = new AISnake(snakeBrain);
            }
            fRate = 100;
            break;
            
        case CARNAGE:
            rows = height/blockSize;
            cols = width/blockSize;
            snake = new CarnageSnake();
            pathFinder = new AStar();
            fRate = 100;
            break;
    }

    frameRate(fRate);
}

// ==============================================
//                  Game Loop
// ==============================================

function draw(){
    background('#333');
    if(fRateChanged){
        frameRate(fRate);
        fRateChanged = false;
    }
    if(!gameOver){
        if(learning){
            population.showBest();
            if(!population.currentBestSnake.isAlive){
                population.createNewGeneration();
                while(!population.allSnakesDead){
                    population.runSimulation();
                    population.calcFitness();
                }
                handleText();
            }
        }
        else if(snake){
            snake.run();
            if(!snake.isAlive) gameOverTriggered = true;
        }
    }
    else if(snake){
        snake.display();
    }
    
    // Handle Game Paused
    pauseGameSetup();

    // Handle Game Over
    gameOverSetup();
}

// ==============================================
//                 Key Press Events
// ==============================================

function keyPressed(){
    if(mode == HUMAN){
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
        if(!learning){
            switch(mode){
                case HUMAN:     snake = new Snake();                break;
                case AI:        snake = new AISnake(snakeBrain);    break;
                case CARNAGE:   snake = new CarnageSnake();         break;
            }
        }
    }
}


// ------------------ Saving And Loading ---------------------
function downloadBest(){
    if(learning){
        let json1 = {"weights" : population.globalBestSnake.brain.weights, "bias" : population.bestOfAll.brain.bias};
        let json2 = {"weights" : population.currentBestSnake.brain.weights, "bias" : population.bestInCurrentGeneration.brain.bias}
        saveJSON({"global" : json1, "current" : json2}, "snakeData.json");
    }
}

function loadSnake(data){
    if(!snakeBrain){
        let weights = data.weights;
        let bias = data.bias;

        weights[0] = new Matrix(weights[0].rows, weights[0].cols, weights[0].data);
        weights[1] = new Matrix(weights[1].rows, weights[1].cols, weights[1].data);
        weights[2] = new Matrix(weights[2].rows, weights[2].cols, weights[2].data);

        bias[0] = new Matrix(bias[0].rows, bias[0].cols, bias[0].data);
        bias[1] = new Matrix(bias[1].rows, bias[1].cols, bias[1].data);
        bias[2] = new Matrix(bias[2].rows, bias[2].cols, bias[2].data);

        snakeBrain = new NeuralNetwork([24,16,16,4],0.1,weights,bias);
    }
}
