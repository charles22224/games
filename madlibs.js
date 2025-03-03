const prompt = require("prompt-sync")(); // Ask for user inputs
let gameCharacter = prompt("Enter a game character: ");
let weapon = prompt("Enter a weapon: ");
let story = "One time " + gameCharacter + " was on a mission to go fight Beru at Jeju island."
console.log(story);