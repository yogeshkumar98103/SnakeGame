const OBSTACLE_COLOR = "#000";
const OBSTACLE_PROBABILITY = 0.3;
const OPEN_SET_COLOR = "#0F0";
const CLOSED_SET_COLOR = "#0FF";

class Node{
    constructor(i, j){
        this.i = i;
        this.j = j;
        this.isObstacle = false;

        this.g = null;
        this.h = null;

        this.inOpenSet = false;
        this.inClosedSet = false;
        this.previous = null;
    }

    f(){
        if(this.g !== null && this.h !== null){
            return this.g + this.h;
        }
        else{
            console.log(this,"g and h is null");
        }
    }

    display(color, size){
        noStroke();
        fill(color);
        rect(this.i * size , this.j * size, size, size);
    }

    copy(){
        let node = new Node(this.i, this.j);
        node.isObstacle = this.isObstacle;
        node.g = this.g;
        node.h = this.h;
        node.inOpenSet = this.inOpenSet;
        node.inClosedSet = this.inClosedSet;
        node.previous = this.previous;
        return node;
    }

    equals(node){
        return this.i === node.i && this.j === node.j;
    }
}
