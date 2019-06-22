const blockSize = 20;
const learningRate = 0.2;
const shouldBlink = false;
const addedLifeOnEating = 100;

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
let food = []
function generateFood(regenerateFood = false){
    if(regenerateFood){
        food = [];
    }
    for(let i = 0; i < 200; i++){
        let maxX = width/blockSize;
        let maxY = height/blockSize;
        let x = Math.floor(random(0,maxX)) * blockSize;
        let y = Math.floor(random(0,maxY)) * blockSize;
        x = constrain(x, 0, width - blockSize);
        y = constrain(y, 0, height - blockSize);

        let newFood = createVector(x,y);
        food.push(newFood);
    }
}

class Snake{
    constructor(generateOwnFood, food , brain){
        this.velocityX = 1;
        this.velocityY = 0;

        this.size = 1;
        this.tail = [];

        this.ateFood = false; 
        this.isAlive = true;

        this.fitness = 0;
        this.percentageFitness = 0;
        this.lifeTime = 0;
        this.lefttoLive = 200;

        this.alternateColor = 1;

        if(brain){
            this.brain = brain;
        }
        else{
            this.brain = new NeuralNetwork([24,16,16,4],learningRate);
        }

        // It contains the input to Neural Network
        this.vision = [];

        this.generateOwnFood = false;
        // this.randomSnakeLocation();
        this.snakeX = 440;
        this.snakeY = 360;
        this.size = 3;
        this.tail[0] = [420,360];
        this.tail[1] = [400,360];

        if(generateOwnFood){
            this.randomFoodLocation();
        }
        else{
            this.food = food;
            this.generateOwnFood = false;
            this.foodCounter = 0;
            this.nextFoodLocation();
        }
    }

    randomSnakeLocation(){
        let maxX = width/blockSize;
        let maxY = height/blockSize;
        let x = Math.floor(random(0.25*maxX, 0.75*maxX)) * blockSize;
        let y = Math.floor(random(0.25*maxY, 0.75*maxY)) * blockSize;
        
        this.snakeX = x;
        this.snakeY = y;
    }

    randomFoodLocation(){
        let maxX = width/blockSize;
        let maxY = height/blockSize;
        let x = Math.floor(random(0,maxX)) * blockSize;
        let y = Math.floor(random(0,maxY)) * blockSize;
        x = constrain(x, 0, width - blockSize);
        y = constrain(y, 0, height - blockSize);

        if(x === this.snakeX && y === this.snakeY || x === this.foodX && y === this.foodY){
            this.randomFoodLocation();
            return;
        }

        this.foodX = x;
        this.foodY = y;

        for(let i = 0; i < this.tail.length; i++){
            if(this.foodX === this.tail[i].x && this.foodY === this.tail[i].y){
                this.randomFoodLocation();
                return;
            }
        }
    }

    nextFoodLocation(){
        let x = this.food[this.foodCounter].x;
        let y = this.food[this.foodCounter].y;
        this.foodCounter++;
        if(this.foodCounter === this.food.length){
            generateFood();
        }

        if(x === this.snakeX && y === this.snakeY || x === this.foodX && y === this.foodY){
            this.nextFoodLocation();
            return;
        }

        this.foodX = x;
        this.foodY = y;

        for(let i = 0; i < this.tail.length; i++){
            if(this.foodX === this.tail[i].x && this.foodY === this.tail[i].y){
                this.nextFoodLocation();
                return;
            }
        }
    }

    run(drawToScreen){
        let x = "Initial"
        if(this.isAlive && !pauseGameTriggered){
            x = this.think();
            this.eatFood();
            this.update();
            if(this.isAlive){
                this.checkGameOver();
            }
        }

        if(drawToScreen){
            this.draw();
        }
        return x;
    }

    draw(){
        // Draw food
        fill(250,0,0);
        rect(this.foodX, this.foodY, blockSize, blockSize);

        // Draw Snake
        fill(250);
        if(gameOver && shouldBlink){
            // Alternate color of snake;
            if(this.alternateColor >= 1 && this.alternateColor <= fRate/2){
                fill(250,0,0);
            }
            else if(this.alternateColor > fRate/2 && this.alternateColor <= fRate){
                fill(250);
            }
            this.alternateColor = (this.alternateColor + 1) % fRate;
            
        }
        for(let i = 0; i < this.tail.length; i++){
            rect(this.tail[i].x, this.tail[i].y, blockSize, blockSize);
        }

        rect(this.snakeX,this.snakeY,blockSize,blockSize);
    }

    update(){
        if(!this.ateFood && this.tail.length > 0){
            let i;
            for(i = 0; i < this.tail.length - 1; i++){
                this.tail[i] = this.tail[i+1];
            }
            this.tail[i] = createVector(this.snakeX, this.snakeY);
        }
        else{
            this.ateFood = false;
        }

        this.snakeX += this.velocityX * blockSize;
        this.snakeY += this.velocityY * blockSize;

        this.lifeTime += 1;
        this.lefttoLive -= 1;
    }

    eatFood(){
        let dx = Math.abs(this.snakeX - this.foodX);
        let dy = Math.abs(this.snakeY - this.foodY);
        if((dx == 0 && dy == blockSize && this.velocityX == 0) || (dy == 0 && dx == blockSize && this.velocityY == 0)){
            // Snake can eat food;
            this.tail.push(createVector(this.snakeX, this.snakeY));
            this.lefttoLive += addedLifeOnEating;
            score.innerHTML = this.size - 3;
            this.size++;
            this.ateFood = true;
            if(this.generateOwnFood){
                this.randomFoodLocation();
            }
            else{
                this.nextFoodLocation();
            }
        }
    }

    lookForFood(position){
        return (position.x === this.foodX && position.y === this.foodY);
    }

    isLifeTimeOver(){
        // Useful to teach to eat
        if(this.lefttoLive <= 0){
            this.isAlive = false;
        }
        if(this.size === 15){
            addedLifeOnEating = 0;
        }
    }

    detectCollisionWithTail(x,y){
        for(let i = 0; i < this.tail.length; i++){
            if(this.tail[i].x === x && this.tail[i].y === y){
                // Sanke ate iteself
                return true;
            }
        }
        return false;
    }

    detectCollisionWithWall(x,y){
        return (x < 0 || x >= width || y < 0 || y >= height);
    }

    checkGameOver(){
        this.isAlive = !this.detectCollisionWithTail(this.snakeX, this.snakeY);
        this.isAlive = !this.detectCollisionWithWall(this.snakeX, this.snakeY);
        if(this.size <= 15){
            this.isLifeTimeOver();
        }
    }

    moveUp(){
        if(this.velocityY === 1){
            this.isAlive = false;
        }
        this.velocityX = 0;
        this.velocityY = -1;
    }

    moveDown(){
        if(this.velocityY === -1){
            this.isAlive = false;
        }
        this.velocityX = 0;
        this.velocityY = 1;
    }

    moveLeft(){
        if(this.velocityX === 1){
            this.isAlive = false;
        }
        this.velocityX = -1;
        this.velocityY = 0;
    }

    moveRight(){
        if(this.velocityX === -1){
            this.isAlive = false;
        }
        this.velocityX = 1;
        this.velocityY = 0;
    }

    calcFitness(){
        if(this.size < 5){
            this.fitness = Math.pow(this.lifeTime, 2) * Math.pow(4, this.size);
        }
        else{
            this.fitness = Math.pow(this.lifeTime, 2) * Math.pow(4, 10);
            this.fitness *= (this.size - 9);
        }
    }

    calcPercentageFitness(sum){
        this.percentageFitness = (this.fitness * 100)/sum;
    }

    see(){
        let i = 0;
        let result = [];
        for(let direction of directions){
            result = this.lookInDirection(direction);
            this.vision[i++] = result[0];
            this.vision[i++] = result[1];
            this.vision[i++] = result[2];
        }
    }

    lookInDirection(direction){
        let positionToSee = createVector(this.snakeX + direction.x, this.snakeY + direction.y);
        let distance = 1;
        let resultInThisDirection = [];
        let encounteredFood = false;
        let encounteredTail = false;

        resultInThisDirection[0] = 0;
        resultInThisDirection[1] = 0;

        // While we encounter wall in this direction
        while(!this.detectCollisionWithWall(positionToSee.x, positionToSee.y)){
            if(!encounteredFood && this.lookForFood(positionToSee)){
                encounteredFood = true;
                resultInThisDirection[0] = 1;
            }
            if(!encounteredTail && this.detectCollisionWithTail(positionToSee.x, positionToSee.y)){
                encounteredTail = true;
                resultInThisDirection[1] = 1/distance;
            }

            // Move forward in this direction
            distance += 1;
            positionToSee.add(direction);
        }

        // Set the distance from wall
        resultInThisDirection[2] = 1/distance;

        return resultInThisDirection;
    }

    think(){
        this.see();
        let decision = this.brain.makeDecision(this.vision);
        let maxIndex = 0;
        let maxValue = decision[0];
        for(let i = 1; i < 4; i++){
            if(decision[i] > maxValue){
                maxValue = decision[i];
                maxIndex = i;
            }
        }

        switch(maxIndex){
            case 0 : this.moveUp();         break; 
            case 1 : this.moveDown();       break;
            case 2 : this.moveLeft();       break;
            case 3 : this.moveRight();      break;
            default : console.log("DEFAULT");
        }
        return maxIndex;
    }

    clone(){
        let clonedBrain = this.brain.clone();
        let clonedSnake = new Snake(false, food, clonedBrain);
        return clonedSnake;
    }

    crossOver(partner){
        let childBrain = this.brain.crossOver(partner.brain);
        let childSnake = new Snake(false, food, childBrain);
        return childSnake;
    }
}