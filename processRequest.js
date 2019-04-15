/* CSC 220 final project
   this file exports processQuery function
   depends on the request
*/

// requiring node modules 
var fs = require('fs');
var utils = require('./utils.js');

function loadMainMenu(res){

}

function loadGamePlay(query, res){

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
        default:
            var errObj = {message: "Query not supported"}; 
            utils.sendJSONObj(res,500,errObj);
            break;
    } 
}