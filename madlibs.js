const prompt = require("prompt-sync")(); // Ask for user inputs
let gameCharacter = prompt("Enter a game character: ");
let place = prompt("Enter a Place: ");
let weapon = prompt("Enter a weapon: ");
let story = "One time " + gameCharacter + " was on a mission to go fight Beru at " + place + " with a " + weapon +
console.log(story);