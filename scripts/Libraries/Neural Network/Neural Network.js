class Placeholder{
    constructor(identifier){
        this.identifier = identifier;
        this.outputs = [];
        this.output;
    }
}
        
class Variable{
    constructor(initialValue){
        this.output = initialValue;
        this.outputs = [];
        this.output;
    }
}
        
class Operator{
    constructor(inputs){
        this.inputs = inputs;
        for(let ip of inputs){
            ip.outputs.push(this);
        }
    }
}

class add extends Operator{
    constructor(a, b){
        super([a,b]);
        this.outputs = [];
        this.output;
    }
        
    compute(){
        if(typeof(this.inputs[0].output) == "number"){
            this.output = this.inputs[0].output + this.inputs[0].output;
        }
        else if(this.inputs[0].output instanceof Matrix){
            this.output = Matrix.add(this.inputs[0].output, this.inputs[0].output); 
        }
    }
}


class multiply extends Operator{
    constructor(a, b){
        super([a,b]);
        this.outputs = [];
        this.output;
    }
        
    compute(){
        this.output = this.inputs[0].output * this.inputs[1].output;
    }
}

class matmul extends Operator{
    constructor(a, b){
        super([a,b]);
        this.outputs = [];
        this.output;
    }
        
    compute(){
        this.output = Matrix.multiply(this.inputs[0].output,this.inputs[1].output);
    }
}

class sigmoid extends Operator{
    constructor(a){
        super([a,]);
        this.outputs = [];
        this.output;
    }
        
    compute(){
        let x = this.inputs[0].output;
        if(typeof(x) == "number"){
            this.output = 1 / (1 + Math.exp(-x));
        }
        else if(x instanceof Matrix){
            x.map((val) => {
                return 1 / (1 + Math.exp(-val));
            })
            this.output = x;
        }
    }
}

class sign extends Operator{
    constructor(a){
        super([a,]);
        this.outputs = [];
        this.output;
    }
        
    compute(){
        x = this.inputs[0].output;
        if(x > 0){ 
            this.output = 1;
        }
        else{
            this.output = -1;
        }
    }
}

class Session{
    constructor(){
        this.postOrder = [];
    }
    
    postOrderTraversal(start){
        this.recurse(start);
    }
    
    recurse(current){
        if(current instanceof Operator){
            for(let ip of current.inputs){
                this.recurse(ip);
            }
        }
        this.postOrder.push(current);
    }

    run(output, feedDict = {}, recalculatePostOrder = True){
        if(recalculatePostOrder){
            this.postOrderTraversal(output);
        }

        for(let ele of this.postOrder){
            if(ele instanceof Operator){
                ele.compute();
            }
            else if(ele instanceof Placeholder){
                ele.output = feedDict[ele.identifier];
            }
        }
                
        return output.output;
    }
}

function randomArray(size = null, low = -1, high = 1){
    if(size == null){
        return (Math.random())*(high - low) + low;
    }
    else{
        let matrix = new Matrix(size[0], size[1]);
        matrix.map((value,i,j) => {
            return (Math.random())*(high - low) + low;
        });
        return matrix;
    }
}

// =======================================================
//                   Single Perceptron
// =======================================================

class Perceptron{
    constructor(numberOfInputs, learningRate = 0.1){
        this.numberOfInputs = numberOfInputs;
        this.learningRate = learningRate;
        this.sess = Session();

        this.weights;
        this.bias;

        this.ip;
        this.op;

        this.initialiseWeights();
        this.generateBoilerplate();
    }
    
    initialiseWeights(){
        // Randomly initialise wieghts
        this.weights = new Variable(randomArray([this.numberOfInputs, 1]));
        this.bias = new Variable(randomArray());
    }
    
    generateBoilerplate(){
        this.ip = new Placeholder("x");
        z = new add(new matmul(this.weights, this.ip), this.bias);
        this.op = sign(z);
        this.sess.postOrderTraversal(this.op);
    }
    
    guess(ip){
        return this.sess.run(this.op, {"x" : ip}, false);
    }

    train(inputs, labels, epochs = 1){
        for(let k = 0; k < epochs; k++){
            for(let i = 0; i < labels.length; i++){
                g = this.guess(inputs[i]);
                error = labels[i] - g;
                error *= this.learningRate;
                this.bias += error;

                for(let j = 0; j < this.numberOfInputs; j++){
                    this.weights.output[j] +=  error * inputs[i][j];
                }
            }
        }
    }
            
    predict(inputs){
        let results = [];
        for(let ip of inputs){
            g = this.guess(ip);
            results.push(g);
        }
        return results;
    }
       
    test(inputs, labels){
        let correct = 0;
        for(let i = 0; i < labels.length; i++){
            g = this.guess(inputs[i]);
            if(g == label){
                correct += 1;
            }
        }
            
        accuracy = (correct/labels.length) * 100;
        return {"accuracy" : accuracy};
    }
                
    getWeights(){
        return this.weights.output;
    }
    
    getBias(){
        return this.bias.output;
    }
}

// =======================================================
//                   Neural Network
// =======================================================

class NeuralNetwork{
    constructor(noNodes, learningRate, weights, bias){
        this.noNodes = noNodes;
        this.size = this.noNodes.length - 1;
        
        this.learningRate = learningRate;
        this.sess = new Session();
        
        if(weights){
            this.weights = weights;
            this.bias = bias;
        }
        else{
            this.setupWeightsAndBias();
        }

        this.setupBoilerPlate();
    }
      
    setupWeightsAndBias(){
        this.weights = [];
        for(let i = 0; i < this.size; i++){
            this.weights.push(randomArray([this.noNodes[i+1], this.noNodes[i]]));
        }
        
        this.bias = [];
        for(let i = 0; i < this.size; i++){
            this.bias.push(randomArray([this.noNodes[i+1],1]));
        }
    }
        
    setupBoilerPlate(){
        this.input = new Placeholder("x")
        this.output = []
        
        this.output.push(this.input);
        for(let i = 0; i < this.size; i++){
            this.output.push(new sigmoid(new add(new matmul(new Variable(this.weights[i]), this.output[i]), new Variable(this.bias[i]))))
        }
        this.sess.postOrderTraversal(this.output[this.size]);
    }
        
    feedforward(ip){
        return this.sess.run(this.output[this.size], {"x" : ip}, false);
    }
    
    train(inputData, labels, epochs = 1, batchSize = null){
        if(batchSize === null){
            batchSize = labels.length;
        }
        
        for(let k = 0; k < epochs; k++){
            let randomIndex = randomArray([1,batchSize], 0, labels.length);
            randomIndex.map((val) => {
                return Math.floor(val);
            });

            for(let idx of randomIndex.data[0]){
                let ip = Matrix.convertToVector(inputData[idx])
                let label = Matrix.convertToVector([labels[idx]])
                let guess = this.feedforward(ip);
                let error = Matrix.subtract(label,guess);

                for(let i = this.size -1; i > 0; i--){
                    this.output[i+1].output.map(this.sigmaDerivative); 
                    let gradient = Matrix.elementwiseProduct(this.output[i+1].output, error);
                    gradient.scale(this.learningRate);
                    this.bias[i].add(gradient);
                    this.weights[i].add(Matrix.multiply(gradient, Matrix.transpose(this.output[i].output)));
                    error = Matrix.multiply(Matrix.transpose(this.weights[i]), error);
                }
            }
        }
    }
    
    sigmaDerivative(x){
        return x*(1-x);
    }
        
    predict(inputData){
        let results = []
        
        for(let ip of inputData){
            ip = Matrix.convertToVector(ip);
            results.push(this.feedforward(ip));
        }
        return results;
    }

    makeDecision(input){
        let ip = Matrix.convertToVector(input);
        let result = this.sess.run(this.output[this.size], {"x" : ip}, false);
        result = Matrix.convertToArray(result);
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