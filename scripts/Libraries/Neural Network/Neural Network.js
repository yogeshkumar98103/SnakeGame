// =======================================================
//                   Neural Network
// =======================================================

class NeuralNetwork{
    constructor(noNodes, learningRate, weights, bias){
        this.noNodes = noNodes;
        this.size = this.noNodes.length - 1;
        
        this.learningRate = learningRate;
        
        if(weights){
            this.weights = weights;
            this.bias = bias;
        }
        else{
            this.setupWeightsAndBias();
        }
    }
      
    setupWeightsAndBias(){
        this.weights = [];
        for(let i = 0; i < this.size; i++){ 
            this.weights[i] = new Matrix(this.noNodes[i+1], this.noNodes[i]);
            this.weights[i].randomize();
        }
        
        this.bias = [];
        for(let i = 0; i < this.size; i++){
            this.bias[i] = new Matrix(this.noNodes[i+1],1)
            this.bias[i].randomize();
        }
    }
    
    reLu(x){
        return Math.max(0,x);
    }

    makeDecision(input){
        let ip = Matrix.convertToVector(input);
        let output = ip;
        for(let i = 0; i < this.size; i++){
            output = Matrix.add(Matrix.multiply(this.weights[i], output), this.bias[i]);
            output.map(this.reLu);
        }
        let result = Matrix.convertToArray(output);
        return result;
    }

    clone(){
        let weights = [];
        let bias = [];
        for(let weight of this.weights){
            weights.push(weight.clone());
        }
        for(let b of this.bias){
            bias.push(b.clone());
        }
        let newNet = new NeuralNetwork(this.noNodes, this.learningRate, weights, bias);
        return newNet;
    }

    crossOver(partner){
        let childWeights = [];
        let childBias = [];
        for(let i = 0; i < this.weights.length; i++){
            childWeights[i] = this.weights[i].crossOver(partner.weights[i]);
            childBias[i] = this.bias[i].crossOver(partner.bias[i]);
        }
        let childBrain = new NeuralNetwork(this.noNodes, this.learningRate, childWeights, childBias);
        return childBrain;
    }

    mutate(mutationRate){
        for(let weight of this.weights){
            weight.mutate(mutationRate, this.learningRate);
        }
        for(let b of this.bias){
            b.mutate(mutationRate, this.learningRate);
        }
    }
}