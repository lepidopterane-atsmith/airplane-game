/* CSC 220 final project
   this file exports processQuery function
   depends on the request
*/

// requiring node modules 
var fs = require('fs');
var utils = require('./utils.js');

var currentId = 0;
var players = [];
var keyValues = [40, 37, 38, 39];

// generates an array of action for CPU
function spawnActions(round){
    var actionArr = [];
    for (var i = 0; i < round; i++){
        var action = Math.floor(Math.random()*3);
        actionArr.push(keyValues[action]);
    }
    return actionArr;
}

function loadMainMenu(res){
    // we're gonna start by loading the page set up for main menu!
    
}

function loadGamePlay(query, res){
   // we're gonna start by loading the page set up for gameplay!
}

// this sets up each player!
function registerPlayer(res){
    var newPlayer = {};
    newPlayer.health = 20;
    newPlayer.movement = [];

    var answer = {};
    players[currentId] = newPlayer;
    answer.id = currentId++;
    utils.sendJSONObj(res,200,answer);
}

// when motion is polled, there goes the opponent...
function moveComputer(){
    var answer = {};
    answer.data = spawnActions(10);
    utils.sendJSONObj(res, 200, answer);
}

// export the processQuery function
exports.processQuery= function(query, res) { 
    // call different functions 
    // based on the request attr of query 
    switch (query.request) {
        case "mainMenu": 
            loadMainMenu(res); 
            break;
        case "gamePlay": 
            loadGamePlay(query,res); 
            break;
        case "gameStart":
            registerPlayer(res);
            break;
        case "pollMotion":
            moveComputer(query, res);
            break;
        default:
            var errObj = {message: "Query not supported"}; 
            utils.sendJSONObj(res,500,errObj);
            break;
    } 
}