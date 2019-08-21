class Population{
    constructor(populationCount, mutationRate){
        this.populationCount = populationCount;
        this.mutationRate = mutationRate;

        this.population = [];
        this.generations = 0;

        this.currentBestSnake;
        this.globalBestSnake;

        this.globalBestFitness = 0;
        this.currentBestFitness = 0;

        this.allSnakesDead = false;

        for(let i = 0; i < this.populationCount; i++){
            this.population[i] = new Snake();
            this.population[i].type = AI_LEARNING;
        }
    }

    // This function runs the simulation
    runSimulation(showOnDisplay){
        this.allSnakesDead = true;
        for(let member of this.population){
            member.runSimulation(showOnDisplay);
            if(member.isAlive){
                this.allSnakesDead = false;
            }
        }
    }

    // This functions calculates stats related to fitness.
    calcFitness(){
        // Calculate max fitness and sum of fitness of all memebers
        let maxFitness = 0;
        let index = 0;
        let sum = 0;
        for(let i = 0; i < this.populationCount; i++){
            this.population[i].calcFitness();
            sum += this.population[i].fitness;
            if(this.population[i].fitness > maxFitness){
                maxFitness = this.population[i].fitness;
                index = i;
            }
        }

        // Save the best member form current generation before creating next Generation
        this.currentBestFitness = maxFitness;
        this.currentBestSnake = this.population[index].clone(true);
    
        // Check if this generation can break records
        if(this.currentBestFitness > this.globalBestFitness){
            this.globalBestFitness = this.currentBestFitness;
            this.globalBestSnake = this.population[index].clone();
        }

        // Calculate the percentage of being selected as parent for next Generation
        for(let member of this.population){
            member.calcPercentageFitness(sum);
        }
    }

    // This function mates parents and adds that child to population
    createNewGeneration(){
        let newPopulation = [];
        
        newPopulation[0] = this.globalBestSnake.clone();
        for(let i = 0; i < this.populationCount; i++){
            // Select parent
            let parent1 = this.chooseParent();
            let parent2 = this.chooseParent();

            // Clone Parent
            let child = parent1.crossOver(parent2);

            // Mutate Child
            child.brain.mutate(this.mutationRate);

            // Add this child to population
            newPopulation[i] = child;
            newPopulation[i].type = AI_LEARNING;
        }
        this.population = newPopulation;
        this.generations++;
        this.allSnakesDead = false;
    }


    // This function return parent acoording to their probability of being selected by their fitness level
    chooseParent(){
        let index = Math.random()*100;
        let percentTillNow = 0;
        for(let i = 0; i < this.populationCount; i++){
            percentTillNow += this.population[i].percentageFitness;
            if(index < percentTillNow){
                return this.population[i];
            }
        }
        return this.population[this.populationCount - 1];
    }

    // This function displays the best memeber of previous generation
    showBest(){
        this.currentBestSnake.runSimulation(true);
    }
}