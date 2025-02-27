const prompt = require('prompt-sync')();
let Cardsuit = prompt("Name a Card Suit?(Hearts, Diamonds, Clubs, Spades) ");
let number = prompt("Now Name a Ace, 2, 3, 4, 5, 6, 7, 8, 9, 10 Jack, Queen, King? ");
let greeting = "You picked " + number + " of " + Cardsuit + "! Have Fun!";
console.log(greeting);

