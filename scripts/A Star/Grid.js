class Grid{
    constructor(rows, cols, grid){
        this.rows = rows;
        this.cols = cols;

        this.grid = [];

        // Initialise Grid
        for(let i = 0; i < this.cols; i++){
            this.grid[i] = [];
            for(let j = 0; j < this.rows; j++){
                this.grid[i][j] = new Node(i,j);
            }
        }
    }

    reset(){
        if(this.head){
            let i = this.head.x/blockSize;
            let j = this.head.y/blockSize;
            this.grid[i][j].isObstacle = false;
        }
        if(this.body){
            let i,j;
            for(let part of this.body){
                i = part.x/blockSize;
                j = part.y/blockSize;
                this.grid[i][j].isObstacle = false;
            }
        }
    }

    setObstacles(head, body, excludeTail = false){
        this.head = head.copy();
        this.body = [];

        let i = head.x/blockSize;
        let j = head.y/blockSize;
        this.grid[i][j].isObstacle = true;
        for(let k = 0; k < body.length; k++){
            this.body.push(body[k].copy());
            i = body[k].x/blockSize;
            j = body[k].y/blockSize;
            this.grid[i][j].isObstacle = true;
            if(excludeTail && k === body.length - 1){
                this.grid[i][j].isObstacle = false;    
            }
        }
    }

    // ===============================================================
    //                       Setters and Getters
    // ===============================================================

    node(i,j){
        return this.grid[i][j];
    }
}

