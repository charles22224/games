// import prompt function
const promptsync = require('prompt-sync')();

// Game state variables
let playerName = "Sung Jin Woo"; // Protagonist name
let playerHealth = 100;
let playerAttack = 10; // Base attack power
let inventory = [];
let location = "city"; // Starting location
let gameOver = false;
let demonsDefeated = 0;
let endgame = !gameOver
function startGame() {
    console.log(`Welcome to the Dungeon Adventure, ${playerName}!`);
    console.log(`As Sung Jin Woo, you must fight your way through demons to save the world!`);
    gameLoop();
}
function quitcheck(p){
    if(p==='quit'){
        process.exit()
    }
    return p
}
function prompt(message){
    let answer=promptsync(message)
    quitcheck(answer)
    return answer
}


function gameLoop() {
    while (!gameOver) {
        console.log("\n--- Game Status ---");
        console.log(`Location: ${location}`);
        console.log(`Health: ${playerHealth}`);
        console.log(`Inventory: ${inventory.join(", ")}`);
        console.log(`Demons Defeated: ${demonsDefeated}`);

        if (location === "city") {
            cityPath();
        } else if (location === "forest") {
            forestPath();
        } else if (location === "dungeon") {
            dungeonPath();
        } else {
            console.log("You seem lost... Please make a decision.");
            gameOver = true; // End game if no valid location is found
        }
    }
    console.log("\nGame Over! Thanks for playing.");
}

function cityPath() {
    console.log("\nYou are in a bustling city, but there are rumors of demons lurking nearby.");
    let action = quitcheck(prompt("Do you want to fight demons, go to the forest, or check your inventory?"));

    if (action.toLowerCase() === "fight demons") {
        fightDemons();
    } else if (action.toLowerCase() === "forest") {
        console.log("You decide to head into the forest to find more demons.");
        location = "forest"; // Move to forest
    } else if (action.toLowerCase() === "check inventory") {
        console.log("You check your inventory, but it's empty for now.");
    } 
    else {
        console.log("Invalid action! Please choose 'fight demons', 'forest', or 'check inventory'.");
    }
}

function forestPath() {
    console.log("\nYou are in the forest. The trees are thick, and the air is heavy. You sense the presence of demons nearby.");
    let action = prompt("Do you want to fight demons, search the forest, or return to the city?");

    if (action.toLowerCase() === "fight demons") {
        fightDemons();
    } else if (action.toLowerCase() === "search the forest") {
        let foundItem = Math.random() < 0.5;
        if (foundItem) {
            console.log("You find a powerful sword in the forest!");
            inventory.push("Sword");
            playerAttack += 10;
        } else {
            console.log("You find nothing but trees and bushes.");
        }
    } else if (action.toLowerCase() === "city") {
        console.log("You head back to the city.");
        location = "city"; // Go back to city
    } else {
        console.log("Invalid action! Please choose 'fight demons', 'search the forest', or 'city'.");
    }
}

function dungeonPath() {
    console.log("\nYou enter a dark dungeon. The air is damp, and you hear the growls of demons nearby.");
    let action = prompt("Do you want to fight demons, search the dungeon, or return to the forest?");

    if (action.toLowerCase() === "fight demons") {
        fightDemons();
    } else if (action.toLowerCase() === "search the dungeon") {
        let foundPotion = Math.random() < 0.4; // 40% chance to find healing potion
        if (foundPotion) {
            console.log("You find a health potion!");
            inventory.push("Health Potion");
        } else {
            console.log("You find nothing but cobwebs.");
        }
    } else if (action.toLowerCase() === "forest") {
        console.log("You decide to return to the forest.");
        location = "forest"; // Go back to forest
    } else {
        console.log("Invalid action! Please choose 'fight demons', 'search the dungeon', or 'forest'.");
    }
}

function fightDemons() {
    console.log("\nA demon appears before you!");
    let demonHealth = 50; // Demon health
    let demonAttack = 8; // Demon attack power

    // Combat loop
    while (demonHealth > 0 && playerHealth > 0) {
        console.log("\n--- Fight ---");
        console.log(`Demon Health: ${demonHealth}`);
        console.log(`Your Health: ${playerHealth}`);
        let action = prompt("Do you want to attack, use an item, endgame, or equip the dagger?");


        if (action.toLowerCase() === "attack") {
            let damageDealt = Math.floor(Math.random() * playerAttack); // Random damage
            demonHealth -= damageDealt;
            console.log(`You attack the demon and deal ${damageDealt} damage.`);
        } else if (action.toLowerCase() === "use item") {
            if (inventory.includes("Health Potion")) {
                console.log("You use a Health Potion and restore 30 health.");
                playerHealth += 30;
                inventory = inventory.filter(item => item !== "Health Potion");
            } else {
                console.log("You don't have any items to use.");
            }
        } else if (action.toLowerCase() === "equip the dagger" && inventory.includes("Dagger")) {
            console.log("You equip the Dagger! It will deal 10 extra damage.");
            playerAttack = 10; // Dagger increases attack damage to 10 for the next fight
        }
    }
}

startGame()