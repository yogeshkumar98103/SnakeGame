selector = document.querySelector('.selector')
selector.selectedIndex = mode
selector.addEventListener('change', ()=>{
    mode = selector.selectedIndex;
    initialize();
    modeSetup();
})

// Overrride default dehaviour with keys
window.addEventListener("keydown", function(event) {
    // arrow key
    if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
});

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
    fRate = speed * 10;
    fRateChanged = true;
}
