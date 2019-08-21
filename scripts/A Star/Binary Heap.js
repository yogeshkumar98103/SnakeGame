class BinaryHeap{
    constructor(){
        this.heap = []; 
        this.size = 0;
    }

    // ========================================
    //             Main Operations
    // ========================================
    
    push(val){
        this.heap[this.size] = val;
        this.riseUp(this.size++);
    }

    pop(){
        if(this.size > 0){
            let popped = this.heap[0];
            --this.size;
            if(this.size !== 0){
                this.heap[0] = this.heap[this.size];
                this.percolateDown(0);
            }
            return popped;
        }
        else{
            console.log("Empty");
        }
    }

    min(){
        return this.heap[0].copy();
    }

    has(){

    }

    isEmpty(){
        return (this.size === 0);
    }

    // ========================================
    //             Helper Functions
    // ========================================

    percolateDown(current){
        let leftChild, rightChild, min;
        this.heap[current].indexInOpenSet = current;
        
        while(true){
            leftChild = this.leftChildIndex(current);
            rightChild = this.rightChildIndex(current);
            min = current;

            if(leftChild < this.size && this.heap[min].f() > this.heap[leftChild].f()){
                min = leftChild;
            }
    
            if(rightChild < this.size && this.heap[min].f() > this.heap[rightChild].f()){
                min = rightChild;
            }
            if(min === current){
                break;
            }

            this.swap(current,min);
            current = min;
        }
    }

    riseUp(current){
        this.heap[current].indexInOpenSet = current;
        let parent = this.parentIndex(current);
        while(parent >= 0 && this.heap[parent].f() > this.heap[current].f()){
            this.swap(parent, current);
            current = parent;
            parent = this.parentIndex(current);
        }
    }

    // ========================================
    //        Helper of Helper Functions
    // ========================================
    
    leftChildIndex(parent){
        return 2 * parent + 1
    }

    rightChildIndex(parent){
        return 2 * parent + 2;
    }

    parentIndex(child){
        return Math.floor((child - 1)/2);
    }

    swap(x,y){
        let temp = this.heap[x];
        this.heap[x] = this.heap[y];
        this.heap[y] = temp;
        this.heap[x].indexInOpenSet = x;
        this.heap[y].indexInOpenSet = y;
    }
}