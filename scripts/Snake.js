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

// ===============================================================================
//                                   SNAKE
// ===============================================================================

class Snake{
    constructor(isVirtualSnake = null){
        if(isVirtualSnake) return;

        this.velocity = createVector(blockSize,0);
        this.body = [];
        this.isAlive = true;
        this.score = 0;

        this.initialiseSnakePosition();
        this.generateNewFood();
    }

    initialiseSnakePosition(){
        this.head = createVector(440, 360);
        this.body[0] = createVector(this.head.x - blockSize, this.head.y);
        this.body[1] = createVector(this.head.x - 2*blockSize, this.head.y);
    }

    run(){
        if(this.isAlive && !gamePaused){
            this.move();
            this.checkIfDead();
        }
        this.display();
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
        // Increase the size of snake
        let len = this.body.length - 1;
        if(len >= 0) {
            this.body.push(this.body[len]);
        } else {
            this.body.push(this.head);
        }

        // Update Score
        score.innerHTML = ++this.score;

        // Generate More Food
        this.generateNewFood();
    }

    generateNewFood(){
        let food = new Food();

        while(food.position.equals(this.head) || this.collideWithBody(food.position)){
            food = new Food();
        }

        this.food = food;
    }

    // ===============================================================================
    //                             Movement
    // ===============================================================================

    move(){
        this.shiftBody();

        if(this.collideWithFood(this.head)) {
            this.eatFood();
        }
    }

    shiftBody() { 
        let next, current;
        next = this.head.copy();
        this.head.add(this.velocity);
        for(let i = 0; i < this.body.length; i++) {
           current = this.body[i]; // .copy();
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
        if(this.velocity.x !== blockSize){
            this.velocity.x = -blockSize;
            this.velocity.y = 0;
        }
    }

    moveRight(){
        if(this.velocity.x !== -blockSize){
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
        return (position.x < 0 || position.x >= width || position.y < 0 || position.y >= height);
    }

    collideWithFood(position){
        return this.food.position.equals(position);
    }


    // ===============================================================================
    //                                  Game Over
    // ===============================================================================

    checkIfDead(){
        if(this.collideWithBody(this.head) || this.collideWithWall(this.head)){
            this.isAlive = false;
        }
    }
}