
// ===============================================================================
//                              AI Snake
// ===============================================================================

class AISnake extends Snake{
    constructor(brain){
        super();

        // It contains the input to Neural Network
        this.vision = [];
        this.brain = brain;
    }

    run(){
        console.log("AI Snake")
        if(this.isAlive && !pauseGameTriggered){
            this.see();
            this.think();
            this.move();
            this.checkIfDead();
        }
        
        this.display();
    }


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
        this.vision = [];
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
        while(!this.collideWithWall(positionToSee)){
            if(!encounteredFood && this.collideWithFood(positionToSee)){
                encounteredFood = true;
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
}

// ===============================================================================
//                            Learner Snake
// ===============================================================================

class LearnerSnake extends AISnake{
    constructor(brain){
        super(brain);
        this.foodList = []
        this.age = 0;
        this.remainingLife = 300;
        this.fitness = 0;
        this.percentageFitness = 0;
    }

    generateNewFood(){
        super.generateNewFood();
        this.foodList.push(this.food);
    }

    run(){
        if(this.isAlive && !pauseGameTriggered){
            this.see();
            this.think();
            this.move();
            this.checkIfDead();
        }
    }

    eatFood(){
        super.eatFood();

        // Increase Remaining Life
        if(this.remainingLife < 600){
            if(this.remainingLife > 500){
                this.remainingLife = 600;
            }
            else{
                this.remainingLife += 200;
            }
        }
    }


    
    // ------------------------- Genetic Manipulation -------------------------
    
    clone(requiredForReplay){
        let clonedBrain = this.brain.clone();
        if(requiredForReplay){
            return new ReplaySnake(clonedBrain, this.foodList);
        }
        else{
            return new LearnerSnake(clonedBrain);
        }
        
    }

    crossOver(partner){
        let childBrain = this.brain.crossOver(partner.brain);
        let childSnake = new LearnerSnake(childBrain);
        return childSnake;
    }

    move(){
        this.age++;
        this.remainingLife--;

        super.move();
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

    checkIfDead(){
        if(this.collideWithBody(this.head) || this.collideWithWall(this.head) || this.remainingLife <= 0){
            this.isAlive = false;
        }
    }
}

// ===============================================================================
//                           Replay Snake
// ===============================================================================
class ReplaySnake extends AISnake{
    constructor(brain, foodList){
        super(brain);
        this.foodList = foodList;
        this.foodCounter = 0;
        this.remainingLife = 300;
    }

    move(){
        this.remainingLife--;
        super.move();
    }

    
    eatFood(){
        super.eatFood();

        // Increase Remaining Life
        if(this.remainingLife < 600){
            if(this.remainingLife > 500){
                this.remainingLife = 600;
            }
            else{
                this.remainingLife += 200;
            }
        }
    }

    generateNewFood(){
        this.food = this.foodList[this.foodCounter];
        this.foodCounter++;
    }

    checkIfDead(){
        if(this.collideWithBody(this.head) || this.collideWithWall(this.head) || this.remainingLife <= 0){
            this.isAlive = false;
        }
    }
}

