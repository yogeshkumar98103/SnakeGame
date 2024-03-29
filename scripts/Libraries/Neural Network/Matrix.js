class Matrix{
    constructor(m,n, data){
        this.rows = m;
        this.cols = n;
        
        if(data){
            this.data = data;
        }
        else{
            this.data = [];
            // Initialise Matrix to 0
            for(let i = 0; i < m; i++){
                this.data.push([]);
                for(let j = 0; j < n; j++){
                    this.data[i].push(0);
                }
            }
        }
    }

    map(func){
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                let val = this.data[i][j];
                this.data[i][j] = func(val, i, j)
            }
        }
    }

    randomize(){
        this.map((val, i, j) => {
            return (Math.random()*2 - 1);
        })
    }

    static multiply(mat1, mat2){
        if(mat1.cols === mat2.rows){
            let matrix = new Matrix(mat1.rows, mat2.cols);
            for(let i = 0; i < matrix.rows; i++){
                for(let j = 0; j < matrix.cols; j++){
                    let sum = 0;
                    for(let k = 0; k < mat1.cols; k++){
                        sum += (mat1.data[i][k] * mat2.data[k][j]);
                    }
                    matrix.data[i][j] = sum;
                }
            }

            return matrix;
        }
    }

    static add(mat1, mat2){
        if(mat1.rows === mat2.rows && mat1.cols === mat2.cols){
            let matrix = new Matrix(mat1.rows, mat1.cols);
            for(let i = 0; i < matrix.rows; i++){
                for(let j = 0; j < matrix.cols; j++){
                    matrix.data[i][j] = mat1.data[i][j] + mat2.data[i][j];
                }
            }

            return matrix;
        }
        else{
            console.log("Matrix are not compatible for addition")
        }
    }

    static convertToVector(arr){
        let vector = new Matrix(arr.length,1);
        for(let i = 0; i < arr.length; i++){
            vector.data[i][0] = arr[i];
        }
        
        return vector;
    }

    static convertToArray(vector){
        let arr = [];
        for(let i = 0; i < vector.rows; i++){
            arr.push(vector.data[i][0]);
        }
        
        return arr;
    }

    // ===============================================================================
    //                            Genetic Manipulation
    // ===============================================================================

    clone(){
        let clonedMatrix = new Matrix(this.rows, this.cols);
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                clonedMatrix.data[i][j] = this.data[i][j];
            }
        }
        return clonedMatrix;
    }

    crossOver(partner){
        let childMatrix = new Matrix(this.rows, this.cols);
      
        let randR = Math.floor(Math.random() * this.rows);
        let randC = Math.floor(Math.random() * this.cols);
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0;  j < this.cols; j++) {
                if((i  < randR) || (i == randR && j <= randC)) {
                    childMatrix.data[i][j] = this.data[i][j]; 
                } else {
                    childMatrix.data[i][j] = partner.data[i][j];
                }
            }
        }
        return childMatrix;
    }

    mutate(mutationRate, amount){
        this.map((val) => {
            if(Math.random() < mutationRate){
                let newVal = val + randomGaussian(0,amount);

                if(newVal > 1) newVal = 1;
                else if(newVal < -1) newVal = -1;

                return newVal;
            }
            return val;
        })
    }
}