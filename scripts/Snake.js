const blockSize = 20;
const learningRate = 0.2;

// ===============================================================================
//                                   SNAKE
// ===============================================================================

class Snake{
    constructor(brain = null, foodList = null){
        this.initialiseSnakePosition();
        this.velocity = createVector(blockSize,0);
        this.food = createVector();

        this.score = 1;
        this.body = [];

        this.fitness = 0;
        this.percentageFitness = 0;

        this.isAlive = true;
        this.age = 0;
        this.remainingLife = 200;

        if(brain !== null) this.brain = brain;
        else this.brain = new NeuralNetwork([24,16,16,4],learningRate);

        // It contains the input to Neural Network
        this.vision = [];

        if(foodList != null){
            this.replaySnake = true;
            this.foodList = foodList;
            this.foodCounter = 0;
        }
        else{
            this.replaySnake = false;
            this.foodList = [];
        }

        this.generateNewFood();
    }

    initialiseSnakePosition(){
        this.score = 3;
        this.head = createVector(440, 360);
        this.body[0] = createVector(this.head.x + blockSize, this.head.y);
        this.body[1] = createVector(this.head.x + blockSize, this.head.y);
    }


    // ===============================================================================
    //                          Simulation Controller
    // ===============================================================================

    runSimulation(displaySnake){
        if(this.isAlive && !pauseGameTriggered){
            this.see();
            this.think();
            this.move();
            this.checkIfDead();
        }

        if(displaySnake){
            this.display();
        }
    }

    display(){
        // Draw Food
        this.food.display();

        // Draw Snake
        fill(250);
        for(let i = 0; i < this.body.length; i++){
            rect(this.body[i].x, this.body[i].y, blockSize, blockSize);
        }

        rect(this.head.x, this.head.y ,blockSize,blockSize);
    }


    // ===============================================================================
    //                          Eat Food
    // ===============================================================================

    eatFood(){
        // This function is triggered when snake eats food

        // Increase the size of snake
        let len = this.body.length - 1;
        if(len >= 0) {
            this.body.push(createVector(this.body[len]));
        } else {
            this.body.push(createVector(this.head));
        }

        // Increase Remaining Life
        if(this.remainingLife < 500){
            if(this.remainingLife > 400){
                this.remainingLife = 500;
            }
            else{
                this.remainingLife += 100;
            }
        }

        // Update Score
        score.innerHTML = this.score;

        // Generate More Food
        this.generateNewFood();
    }

    generateNewFood(){
        if(replaySnake){
            this.food = this.foodList[this.foodCounter];
            this.foodCounter++;
        }
        else{
            let food = new Food();

            while(food.position.equals(this.head) || collideWithBody(food)){
                food = new Food();
            }

            this.food = food;
            this.foodList[this.foodCounter] = this.food;
        }
    }

    // ===============================================================================
    //                             Movement
    // ===============================================================================

    move(){
        this.age++;
        this.remainingLife--;
        
        if(collideWithFood(this.head)) {
            eatFood();
        }

        this.shiftBody();
    }

    shiftBody() { 
        let next, current;
        next = this.head.copy();
        this.head.add(this.velocity);
        for(let i = 0; i < this.body.length; i++) {
           current = this.body[i].copy();
           this.body[i] = next;
           next = current;
        } 
    }

    moveUp(){
        if(this.velocity.y !== blockSize){
            this.velocity.x = 0;
            this.velocity.y = -blockSize;
        }
    }

    moveDown(){
        if(this.velocity.y !== -blockSize){
            this.velocity.x = 0;
            this.velocity.y = blockSize;
        }
    }

    moveLeft(){
        if(this.velocity.x === blockSize){
            this.velocity.x = -blockSize;
            this.velocity.y = 0;
        }
    }

    moveRight(){
        if(this.velocity.x === -blockSize){
            this.velocity.x = blockSize;
            this.velocity.y = 0;
        }
    }

    // ===============================================================================
    //                             Collision
    // ===============================================================================
    collideWithBody(position){
        for(let i = 0; i < this.body.length; i++){
            if(this.body[i].equals(position)){
                return true;
            }
        }
        return false;
    }

    collideWithWall(position){
        return (position.x < 0 || position.x >= width || position.y < 0 || y >= position.height);
    }

    collideWithFood(position){
        return this.food.equals(position);
    }


    // ===============================================================================
    //                             Natural Selection
    // ===============================================================================

    calcFitness(){
        if(this.score < 10){
            this.fitness = Math.pow(this.age, 2) * Math.pow(2, this.score);
        }
        else{
            this.fitness = Math.pow(this.age, 2) * Math.pow(2, 10);
            this.fitness *= (this.score - 9);
        }
    }

    calcPercentageFitness(sum){
        this.percentageFitness = (this.fitness * 100)/sum;
    }

    // ===============================================================================
    //                              Decision Making
    // ===============================================================================

    think(){
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
        }
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
        let positionToSee = p5.Vector.add(this.head, direction);
        let distance = 1;
        let resultInThisDirection = [];
        let encounteredFood = false;
        let encounteredTail = false;

        resultInThisDirection[0] = 0;
        resultInThisDirection[1] = 0;

        // While we encounter wall in this direction
        while(!this.collideWithWall(positionToSee.x, positionToSee.y)){
            if(!encounteredFood && this.collideWithFood(positionToSee)){
                encounteredFood = true;
                if(this.replaySnake){
                    console.log("Saw food ", this.isAlive);
                }
                resultInThisDirection[0] = 1;
            }
            if(!encounteredTail && this.collideWithBody(positionToSee)){
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

    // ===============================================================================
    //                            Genetic Manipulation
    // ===============================================================================

    clone(replay = false){
        let clonedBrain = this.brain.clone();
        let clonedSnake;
        if(replay){
            clonedSnake = new Snake(clonedBrain, cloneVectorList(this.foodList));   
        }
        else{
            clonedSnake = new Snake(clonedBrain);
        }
        return clonedSnake;
    }

    crossOver(partner){
        let childBrain = this.brain.crossOver(partner.brain);
        let childSnake = new Snake(childBrain);
        return childSnake;
    }

    // ===============================================================================
    //                                  Game Over
    // ===============================================================================

    checkIfDead(){
        if(this.collideWithBody(this.head) || this.collideWithWall(this.head)){
            this.isAlive = false;
        }
        if(this.remainingLife <= 0){
            this.isAlive = false;
        }
    }
}