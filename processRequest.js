/* CSC 220 final project
   this file exports processQuery function
   depends on the request
*/

// requiring node modules 
var fs = require('fs');
var utils = require('./utils.js');

var currentId = 0;
var players = [];
var allKeyValues = [0, 65, 65, 83, 83, 83, 83, 68, 68];

// generates an array of action for CPU
function spawnActions(round, place){
    var actionArr = [];
    for (var i = 0; i < round; i++){
        var action = {};
        var index = Math.floor(Math.random()*9);
        if (index >= 9){
            index = 8;
        }
        console.log(place);
        switch (place){
            case "0":
                action.keyCode = 68;
                console.log("moving right");
                break;
            case "500":
                action.keyCode = 65;
                console.log("moving left");
                break;
            default:
                action.keyCode = allKeyValues[index];
                break;
        }
             
        console.log(action.keyCode);
        if (action.keyCode != 83 ){
            for (var i = 0; i< 21; i++){
                actionArr.push(action);
            }
        } else {
            actionArr.push(action); 
        } 
        
    }
    // console.log(actionArr);
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
function moveComputer(query, res){
    console.log(query.where);
    var answer = {};
    answer.data = spawnActions(20, query.where);
    // console.log(answer.data);
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