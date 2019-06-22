class Food{
    constructor(){
        let maxX = width/blockSize;
        let maxY = height/blockSize;
        let x = Math.floor(random(0,maxX)) * blockSize;
        let y = Math.floor(random(0,maxY)) * blockSize;
        x = constrain(x, 0, width - blockSize);
        y = constrain(y, 0, height - blockSize);

        this.position = createVector(x,y);
    }

    display(){
        fill(250,0,0);
        rect(this.position.x, this.position.y , blockSize, blockSize);
    }

    clone() {
        let clonedFood = new Food();
        clonedFood.position.x = this.position.x;
        clonedFood.position.y = this.position.y;
        
        return clonedFood;
     }
}