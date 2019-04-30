/*
Cite: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations
https://stackoverflow.com/questions/109086/stop-setinterval-call-in-javascript
https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
https://www.w3schools.com/graphics/game_intro.asp
https://stackoverflow.com/questions/5127937/how-to-center-canvas-in-html5
https://stackoverflow.com/questions/14012768/html5-canvas-background-image

Order of things in this file: 
- variables
- startgame function 
- a few server listeners
- component function/object creation
- update game fucntion
- couple other minor functions 
- event listeners for appropriate key presses 
- a few query stringifiers

UI implemented by Joarvi
Server communication implemented by Sarah

*/

var playerID = -1; // we're going to mimic HW5 a little here w/P2P fun
var cpuVsPlayer = true;

//Game canvas and contexts
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
//health bar canvases and contexts
var hbar1 = document.getElementById("hbar1");
var hbar2 = document.getElementById("hbar2");
var ctx1 = hbar1.getContext("2d");
var ctx2 = hbar2.getContext("2d");

var background = new Image();
var A1 = new Image();
var A2 = new Image();
var orb1Img = new Image();
var orb2Img = new Image();
var frameNo = 0;
var gameOver = false;
var winner = "";
var orbSpeed = 5;
//---------Airplane variables/booleans----------
var airplane1;
var airplane2;
var Orbs1 = []; //orbs shot by airplane 1 
var Orbs2 = []; //orbs shot by airplane 2
var health1 = 500; //total health of airplane 1
var health2 = 500; //total health of airplane 2 

/*each airplane has these booleans determining if it should be 
traveling left, right, or shooting */ 
var left = false;
var right = false;
var shooting = false;
var left2 = false;
var right2 = false;
var shooting2 = false;

function startGame() {
    //airplane components are    the hit boxes for the planes 
    airplane1 = new component(100, 15, 40,75, "red", "A1"); //A1 is red and at top
    airplane2 = new component(100, 400, 40, 75, "blue", "A2"); //A2 at bottom

    cpuVsPlayer = window.confirm("Do you want to play against the CPU? Click OK to do that, or Cancel to play against a friend on the same computer.");

    //Add sources for plane and background pics
    A1.src = "opponentPlane.png";
    A2.src = "playerPlane.png";
    background.src = "background.png";
    orb1Img.src = "opponentOrb.png";
    orb2Img.src = "playerOrb.png";

    intervalID = setInterval(updateGame, 20); 

    // Server registration time!!
    var xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.onload = initOnload;
    xmlHttpRequest.onerror = function () {console.log(
        "Error registering to the server")};
    var data = {};
    data.request = "gameStart";
    msg = queryObjectToString(data);
    xmlHttpRequest.open("GET","http://localhost:8080/?"+msg);
    xmlHttpRequest.send();
    
}

// if registering w/server went ok, reassigns ID + begins polling
function initOnload() {
    if (this.status == 200) {
        response = JSON.parse(this.responseText);
        playerID = response.id;
        // console.log(playerID);
        if (cpuVsPlayer){
            setTimeout(sendPollRequest, 1000);
        } else {
            document.getElementById("helpBlurb").innerHTML = "Move the red plane with the A and D keys, and use the S key to shoot energy orbs!";
        }
    }
}

// recursively polls the server for updates!
function sendPollRequest(){
    // we will first prepare the opponent motion request
    var xmlHttpMovesRequest = new XMLHttpRequest();
    xmlHttpMovesRequest.onload = pollMotionOnload;
    xmlHttpMovesRequest.onerror = function () {console.log(
        "Error polling the server for moves")};
    var moveData = {};
    moveData.request = 'pollMotion';
    moveData.id = playerID;
    moveData.where = airplane1.x;
    moveMsg = queryObjectToString(moveData);  
    xmlHttpMovesRequest.open("GET", "http://localhost:8080/?"+moveMsg);
    xmlHttpMovesRequest.send();

    setTimeout(sendPollRequest, 1000);
}

function pollMotionOnload(){
    if (this.status == 200) {
        // console.log("\nresponse text "+this.responseText);
        response = JSON.parse(this.responseText);
        cpuMoves = response.data;
        // console.log(cpuMoves);
        cpuMoves.forEach(dispatchKeys);
    }
}

function dispatchKeys(move){
    checkKey(move);
    setTimeout(resetMovement, 1000, move); 
}

function component(x, y, width, height, color, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;
    this.speedX = 5;
    //if the plane is moving right, left, or shooting these will = true
    
    
    this.update = function () {
        ctx = c.getContext("2d");
        if (this.type == "A1") {
            /*
            UN-COMMENT THIS TO VISUALLY SEE HITBOXES
            ctx.fillStyle = "white";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            */
            ctx.drawImage(A1, this.x-30, this.y-10);
        } else if (this.type == "A2") {
            /*
            UN-COMMENT THIS TO VISUALLY SEE HITBOXES
            ctx.fillStyle = "white";
            ctx.fillRect(this.x, this.y, this.width, this.height); 
            */
            ctx.drawImage(A2, this.x-30, this.y-15);
        } else if (this.type == "orb1") {
            /*
            ctx.fillStyle = this.color; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, 2*Math.PI);
            ctx.stroke();
            */
            ctx.drawImage(orb1Img, this.x - 10, this.y, 18, 33);
        } else if (this.type == "orb2" ) {
            ctx.drawImage(orb2Img, this.x-10, this.y, 18, 33);
        }
        //update health bars
        perc1 = health1 / 500; 
        perc2 = health2 / 500;
        //Health Bar 1
        ctx1.fillStyle = "chartreuse";
        ctx1.fillRect(0,0, (hbar1.width * perc1), hbar1.height);
        //Health Bar 2 
        ctx2.fillStyle = "chartreuse";
        ctx2.fillRect(0, 0, (hbar2.width * perc2), hbar2.height);
    }

    this.newPos = function() {
        this.movePlane(); //see if plane should be moved
        this.hitSides(); //see if plane is hitting sides of canvas
        this.isShooting(); //see if plane should be shooting
    }
    this.movePlane = function() {
        //uses booleans to determine whether should be moving right or left 
        
        if (this.type =="A1") {
            if (left) {
                this.x = this.x - this.speedX;
            } else if (right) {
                this.x = this.x + this.speedX;
            } 
        } else if (this.type == "A2") {
            if (left2) {
                this.x = this.x - this.speedX;
            } else if (right2) {
                this.x = this.x + this.speedX;
            }
        }
        
    }
    this.hitSides = function() {
        //checks if it hits sides of the canvas 
        var canvasWidth = c.width;
        if ((this.x+this.width) >= canvasWidth) {
            this.x = canvasWidth-this.width;
        } else if (this.x < 0) {
            this.x = 0;
        }
    }
    this.isShooting = function() {
        //A1 is at the bottom, so needs to shoot upward
        //A2 at top so needs to shoot downward 
        if (shooting == true && this.type == "A1") { 
            AddOrbs(Orbs1, this.x + (this.width/2), this.y + (this.height)); //pass addOrbs specific coordinates so it appears to shoot from center
        } else if (shooting2 == true && this.type == "A2") {
            AddOrbs(Orbs2, this.x + (this.width/2), this.y);
            
        }
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        /*
        if ((mytop < otherbottom) && (myleft > otherleft) && (myright < otherright)) {
            crash = true;
        }*/
        return crash;
    }

}

function updateGame() {
    //this function is called by setInterval, is the core of the "animation"
    frameNo += 1; 
    clearGameArea();

    if (gameOver == false) {
        //check if either of the two planes is crashing with any orbs
        for (i = 0; i < Orbs2.length - 1; i++) {
            if (airplane1.crashWith(Orbs2[i])) {
                //Orbs2.splice[i, 1];
                health1 -= .2;
                health1 = Math.floor(health1);
                if (health1 <= 0) {  //if health falls below zero, game over
                    gameOver = true;
                    winner = "Blue wins!"
                    
                }
                //console.log(health1);
            }
        }
        for (i = 0; i < Orbs1.length - 1; i++) {
            if (airplane2.crashWith(Orbs1[i])) {
                //Orbs2.splice[i, 1];
                //console.log("hittinggg");
                health2 -= .2;
                health2 = Math.floor(health2);
                //console.log(health2);
                if (health2 <= 0) {  //if health falls below zero, game over
                    gameOver = true;
                    winner = "Red wins!"
                    
                }
            }
        }
        //Update/animate the orbs shooting
        for (i = 0; i < Orbs1.length; i++) { //1 is at the top, so needs to shoot downwards
            Orbs1[i].y += orbSpeed;
            Orbs1[i].update(); //could get "fancy" and check when outside of win and delete them once they are 
        }
        for (i = 0; i < Orbs2.length; i++) { //2 is at the bottom, so needs to shoot upwards
            Orbs2[i].y += -orbSpeed;
            Orbs2[i].update();
        }
        //update/animate the planes
        airplane1.update();
        airplane1.newPos();
        airplane2.update();
        airplane2.newPos();

    } else if (gameOver) {
        //Put up font in myCanvas that the game is over! 
        ctx.font = "40px Arial";
        //ctx.fillStyle(winner.color);
        ctx.fillText(winner, 100, 100);
        clearInterval(intervalID); //stop SetInterval from continuing to run
    }

}

function AddOrbs(orbList, x, y) {
    //the 1st if statement makes it so that the orbs are spaced out 
    
    if ((frameNo / 10) % 1 == 0) {
        if (orbList == Orbs1) {
            orbList.push(new component(x, y, 15, 15, "black", "orb1"));
            //console.log("ADDING A1 orbs");
        } else if (orbList == Orbs2) {
            orbList.push(new component(x, y, 15, 15, "black", "orb2"));
            //console.log("adding A2 orbs");
        }
    }
    //orbList.push(new component(x, y, 10, 10, "black", "orb"));
}

//Need to clear in order to help with the "animation"
function clearGameArea() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx1.clearRect(0, 0, hbar1.width, hbar1.height);
    ctx2.clearRect(0,0, hbar2.width, hbar2.height);
    ctx.drawImage(background, 0,0,c.width,c.height);
}


//_________________________BELOW ARE EVENT LISTENERS FOR KEYS & THEIR FUNCTIONS______________________________________

document.onkeydown = checkKey;
document.onkeyup = resetMovement; 

function checkKey(e) {
    
    e = e || window.event;
    
    if (e.keyCode == '38') {
        // up arrow
        shooting2 = true;
        //console.log("up arrow being pressed");
    }
    else if (e.keyCode == '37') {
       // left arrow
       left2 = true;
    }
    else if (e.keyCode == '39') {
       // right arrow
       right2 = true;
    } else if (e.keyCode =='65') {
        console.log("CHECKING LEFT"); 
        left = true;
    } else if (e.keyCode == '68') {
        //d
        right = true;
        console.log("CHECKING RIGHT");
    } else if (e.keyCode == '83') {
        //s 
        shooting = true;
        console.log("CHECKING ORBS");
    }

}

//once the key is lifted, the appropriate boolean should be changed back to being false 
function resetMovement(e) {
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        //console.log("undone");
        shooting2 = false;
    }
    else if (e.keyCode == '37') {
       // left arrow
       left2 = false;
    }
    else if (e.keyCode == '39') {
       // right arrow
       right2 = false;
    } else if (e.keyCode =='65') {
        //a 
        left = false;
        console.log("RESETTING LEFT");
    } else if (e.keyCode == '68') {
        //d
        right = false;
        console.log("RESETTING RIGHT");
    } else if (e.keyCode == '83') {
        //s 
        shooting = false;
        console.log("RESETTING ORBS");
    }

}

// From HW5:
//////////////////////////////////////////////////////////

// stringifies query objects, this function doesn't mess around
function queryObjectToString(query) {
    // console.log(query);
    var properties = Object.keys(query);
    var arrOfQueryStrings = properties.map(prop => prop+"="+handleSpaces(query[prop].toString()));
    // console.log(arrOfQueryStrings.join('&'));
    return(arrOfQueryStrings.join('&'));
 }

// helper function for whitespace encountered in queryObjectToString
function handleSpaces(str) {
    var newStr = "";
    for (k = 0; k < str.length; k++) {    
        
        if (str[k] == " ")
            newStr += "+";
        else
            newStr += str[k];    
    }
    return newStr;
}

startGame();



