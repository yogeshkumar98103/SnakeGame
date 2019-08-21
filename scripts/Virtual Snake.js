class VirtualSnake{
    constructor(head, body, food, velocity){
        this.velocity = velocity.copy();
        this.head = head.copy();
        this.body = [];
        for(let part of body){
            this.body.push(part);
        }

        this.food = food.clone();
        this.isAlive = true;

        this.reachedTarget = false;
    }

    findPathToFood(){
        let pathFinder = new AStar(this.head, this.food.position);
        pathFinder.grid.setObstacles(this.head, this.body);
        pathFinder.findPath();
        this.path = pathFinder.path;
        this.pathIndex = 0;
        this.pathToFoodExists = pathFinder.targetFound;
    }

    findEscapePath(){
        let tail = this.body[this.body.length - 1];
        let pathFinder = new AStar(this.head, tail);
        pathFinder.grid.setObstacles(this.head, this.body, true);
        pathFinder.findPath();
        this.escapePathExists = pathFinder.targetFound
    }

    move(){
        if(this.path.length !== 0 && this.pathIndex < this.path.length){
            let nextMove = this.path[this.pathIndex];
            let headI = this.head.x/blockSize;
            let headJ = this.head.y/blockSize;

            if(nextMove.i === headI + 1){
                this.moveRight();
            }
            else if(nextMove.i === headI - 1){
                this.moveLeft();
            }
            else if(nextMove.j === headJ - 1){
                this.moveUp();
            }
            else if(nextMove.j === headJ + 1){
                this.moveDown();
            }
            this.pathIndex++;
        }

        this.shiftBody();
    }

    eatFood(){
        // Increase the size of snake
        let len = this.body.length - 1;
        if(len >= 0) {
            this.body.push(this.body[len]);
        } else {
            this.body.push(this.head);
        }
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

    collideWithFood(){
        return this.food.position.equals(this.head);
    }

    checkIfDead(){
        if(this.collideWithBody(this.head) || this.collideWithWall(this.head)){
            this.isAlive = false;
        }
    }

}