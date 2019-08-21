// ===============================================================================
//                            Carnage Snake
// ===============================================================================

class CarnageSnake extends Snake{
    constructor(){
        super();
        this.moveIndex = 0;
        this.path = [];
        this.pathIndex = 0;
    }    
    
    run(){
        if(this.isAlive && !pauseGameTriggered){
            this.decideMove();
            this.move();
            this.checkIfDead();
        }
        this.display();
    }

    checkIsPathSafe(){
        this.virtualSnake = new VirtualSnake(this.head, this.body, this.food, this.velocity);
        this.virtualSnake.findPathToFood();
        
        if(!this.virtualSnake.pathToFoodExists){
            return false;
        }
        
        while(!this.virtualSnake.collideWithFood(this.virtualSnake.head)) {
            this.virtualSnake.move();
            // alert(this.virtualSnake.head);
            // alert(this.virtualSnake.food.position);
        }
        // alert(6);
        this.virtualSnake.eatFood();
        this.virtualSnake.findEscapePath();
        // alert(5);
        return this.virtualSnake.escapePathExists;
    }

    decideMove(){
        // AI Code Goes here
        if(this.pathIndex === this.path.length){
            if(this.checkIsPathSafe()){
                this.path = this.virtualSnake.path;
                this.pathIndex = 0;
            }
            else{
                // Chase Tail
                let tail = this.body[this.body.length - 1];
                let pathFinder = new AStar(this.head, tail);
                pathFinder.grid.setObstacles(this.head, this.body, true);
                pathFinder.findPath();
                if(pathFinder.targetFound){
                    this.path = pathFinder.path;
                    this.pathIndex = 0;
                }
                else{
                    // MARK :- Coil Around Till Safe Path is Found
                    this.coiling = true;
                }
            }
        }

        if(this.path.length !== 0 && !this.coiling){
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
    }
}

// ===============================================================================
//                             Virtual Snake
// ===============================================================================
class VirtualSnake extends Snake{
    constructor(head, body, food, velocity){
        super(true);
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
        // alert(this.path.length)
        // alert(this.pathIndex);
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
}