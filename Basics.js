let playerName = "Sam"; // Player's name (string)
const maxLives = 3; // Maximum lives (number)
let playerScore = 1500; // Number (primitive)
let playerStats = { // Object (complex type)
  health: 100,
  strength: 50
};
let levels = ["Beginner", "Intermediate", "Expert"]; // Array (complex type)
 playerScore = 100;
playerScore += 50; // Add 50 to score (100 + 50)
let playerLives = 2;
let isGameOver = playerLives <= 0; // true if lives are 0 or less
let isPlayerAlive = true;

if (isPlayerAlive && playerLives > 0) {
  console.log("Player is alive!");
}
 playerName = "Tom";
console.log("Player: " + playerName); // Output: Player: Tom

 

let inventory = ["Sword", "Shield", "Potion"];
console.log(inventory.length); // Output: 3

inventory.push("Armor"); // Add new item
console.log(inventory); // Output: ["Sword", "Shield", "Potion", "Armor"]

let playerHealth = 50;

if (playerHealth > 75) {
  console.log("Player is healthy!");
} else if (playerHealth > 30) {
  console.log("Player is injured.");
} else {
  console.log("Player is in danger!");
}

 

 

let countdown = 5;

while (countdown > 0) {
  console.log(countdown);
  countdown--; // Decrease countdown by 1
}

function calculateScore(level, basePoints) {
    return level * basePoints;
  }
  
  let score = calculateScore(5, 200); // 5 * 200 = 1000
  console.log(score); // Output: 1000
  function startGame() {
    console.log("Game is starting...");
  }
  
  startGame(); // Call the function
  

  
  function fightMonster(attackPower) {
    if (attackPower > 10) {
      console.log("You defeated the monster!");
    } else {
      console.log("The monster is too strong!");
    }
 }
 // Call the function with a test value
 fightMonster(3);