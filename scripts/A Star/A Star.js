const PATH_COLOR = "#EF2565"
const ROOT_TWO = 1.414;

class AStar{
    constructor(start, end){
        this.current;
        this.grid = new Grid(rows,cols);
        this.openSet = new BinaryHeap();

        this.finished = false;
        this.targetFound = false;
        this.canChooseDiagonals = false;
        this.pathCalculated = false;
        this.pathIndex = 0;
        this.path = [];

        if(start){
            this.startingPoint = start;
        }
        if(end){
            this.finishingPoint = end;
        }
    }

    set startingPoint(pos){
        let i = Math.floor(pos.x/blockSize);
        let j = Math.floor(pos.y/blockSize);
        this.start = this.grid.grid[i][j];
        this.start.isObstacle = false;
        this.start.g = 0;
        this.openSet.push(this.start);
    }

    set finishingPoint(pos){
        let i = Math.floor(pos.x/blockSize);
        let j = Math.floor(pos.y/blockSize);
        this.end = this.grid.grid[i][j];
        this.end.isObstacle = false;
        this.end.h = 0;
        this.start.h = this.estimateHeuristic(this.start);
    }

    findPath(){
        while(!this.finished){
            this.findStep();
        }
    }

    findStep(){
        // Path Finding
        if(!(this.openSet.isEmpty() || this.targetFound)){
            this.current = this.openSet.pop();
            this.current.inOpenSet = false;
            this.current.inClosedSet = true;
            
            if(this.current.equals(this.end)){
                // We have reached target
                this.targetFound = true
            }
            else{
                let neighbours = this.neighboursOf(this.current)
                for(let neighbour of neighbours){
                    if(neighbour.inClosedSet || neighbour.isObstacle) continue;

                    let currentG = this.calculateG(this.current.g);

                    if(!neighbour.inOpenSet){
                        neighbour.g = currentG;
                        neighbour.h = this.estimateHeuristic(neighbour);
                        neighbour.previous = this.current;

                        neighbour.inOpenSet = true;
                        this.openSet.push(neighbour);
                    }
                    else if(neighbour.g > currentG){
                        neighbour.g = currentG;
                        neighbour.previous = this.current;
                        this.openSet.riseUp(neighbour.indexInOpenSet);
                    }
                }
            }
        }
        else if(!this.pathCalculated){
            this.finished = true;
            this.calculatePathCoordinates();
        }
    }

    calculatePathCoordinates(){ 
        this.path = [];
        if(this.targetFound){
            let current = this.current.copy();

            while(current.previous !== null){
                // draw line b/w current and current.previous
                this.path.push(current);
                current = current.previous;
            }

            // Reverse path array
            let start = 0;
            let end = this.path.length - 1;
            let temp;
            while(start < end){
                temp = this.path[start];
                this.path[start] = this.path[end];
                this.path[end] = temp;
                start++;
                end--;
            }
            this.pathCalculated = true;
            this.pathIndex = 0;
        }
    }

    showAnimatedPath(){
        if(this.finished){
            for(let i = 0; i < this.pathIndex; i++){
                this.path[i].display(PATH_COLOR,blocksize);
            }

            if(this.pathIndex < this.path.length){
                this.pathIndex++;
            }
        }
    }
    
    showPath(){
        if(this.finished){
            for(let i = 0; i < this.pathIndex; i++){
                this.path[i].display(PATH_COLOR,blocksize);
            }
        } 
    }

    neighboursOf(node){
        let neighbours = [];
        let i = node.i;
        let j = node.j;
        if(i !== 0){
            neighbours.push(this.grid.grid[i - 1][j]);
        }
        if(i !== this.grid.cols -1){
            neighbours.push(this.grid.grid[i + 1][j]);
        }
        if(j !== 0){
            neighbours.push(this.grid.grid[i][j - 1]);
        }
        if(j !== this.grid.rows -1){
            neighbours.push(this.grid.grid[i][j + 1]);
        }

        return neighbours
    }

    estimateHeuristic(node){
        let dx = Math.abs(node.i - this.end.i);
        let dy = Math.abs(node.j - this.end.j);
        if(this.canChooseDiagonals){
            return  Math.min(dx, dy) * ROOT_TWO + Math.abs(dx-dy);
        }

        return dx + dy;
    }

    calculateG(val){
        if(this.diagonalNeighbours){
            return val + ROOT_TWO;
        }
        return val + 1;
    }
}