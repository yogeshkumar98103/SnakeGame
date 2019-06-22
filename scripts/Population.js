class Population{
    constructor(popCount, mutationRate){
        this.popCount = popCount;
        this.mutationRate = mutationRate;

        this.finished = false;
        this.population = [];
        this.bestInCurrentGeneration;
        this.bestOfAll;
        this.generations = 0;
        this.bestScore = 0;
        this.maxFitnessInCurrentGeneration = 0;

        this.allDead = false;

        this.initializePopulation()
    }

    initializePopulation(){
        for(let i = 0; i < this.popCount; i++){
            this.population[i] = new Snake(false, food);
        }
    }

    // This functions calculates stats related to fitness.
    calcFitness(){
        // Calculate max fitness and sum of fitness of all memebers
        let maxFitness = 0;
        let maxFitnessIndex = 0;
        let sum = 0;
        for(let i = 0; i < this.popCount; i++){
            this.population[i].calcFitness();
            sum += this.population[i].fitness;
            if(this.population[i].fitness > maxFitness){
                maxFitness = this.population[i].fitness;
                maxFitnessIndex = i;
            }
        }

        this.maxFitnessInCurrentGeneration = maxFitness;
        this.maxFitnessIndex = maxFitnessIndex;

        // Save the best member form current generation before creating next Generation
        let brain = this.population[this.maxFitnessIndex].brain.clone();
        let food = this.population[this.maxFitnessIndex].food;
        this.bestInCurrentGeneration = new Snake(false, food, brain);

        // Calculate the percentage of being selected as parent for next Generation
        for(let member of this.population){
            member.calcPercentageFitness(sum);
        }
    }

    // This function mates parents and adds that child to population
    createNewGeneration(){
        let newPopulation = [];
        
        newPopulation[0] = this.bestOfAll;
        for(let i = 1; i < this.popCount; i++){
            // Select parent
            let parent1 = this.chooseParent();
            let parent2 = this.chooseParent();

            // Clone Parent
            let child = parent1.crossOver(parent2);

            // Mutate Child
            child.brain.mutate();

            // Add this child to population
            newPopulation[i] = child;
        }
        this.population = newPopulation;
        generations.innerHTML = this.generations;
        score.innerHTML = 0;
        this.generations++;
        this.allDead = false;
        generateFood(true);
    }


    // This function return parent acoording to their probability of being selected by their fitness level
    chooseParent(){
        let index = Math.random()*100;
        let percentTillNow = 0;
        for(let i = 0; i < this.popCount; i++){
            percentTillNow += this.population[i].percentageFitness;
            if(index < percentTillNow){
                return this.population[i];
            }
        }
        return this.population[this.popCount - 1];
    }

    // This function checks if we have reached the target
    evaluate(){
        // Check if this generation can break records
        if(this.maxFitnessInCurrentGeneration > this.bestScore){
            this.bestScore = this.maxFitnessInCurrentGeneration;
            let brain = this.population[this.maxFitnessIndex].brain.clone();
            let food = this.population[this.maxFitnessIndex].food;
            this.bestOfAll = new Snake(false, food, brain);
        }
    }

    // This function runs the simulation
    run(showOnDisplay){
        this.allDead = true;
        for(let member of this.population){
            member.run(showOnDisplay);
            if(member.isAlive){
                this.allDead = false;
            }
        }
    }

    // This function displays the best memeber of previous generation
    showBest(){
        console.log(this.bestInCurrentGeneration.run(true));
    }
}