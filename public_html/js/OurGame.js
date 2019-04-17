/*
Log of what i've done: 
removed elements that have gravity, create the obstacles
adding functions movePlane and hitSides, under component
made orbs be able to fire (using 's' and up arrow keys), made "planes" move and stop at edge of canvas
centered canvas and put health bars in appropriate places 

Cite: 
https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
https://www.w3schools.com/graphics/game_intro.asp
https://stackoverflow.com/questions/5127937/how-to-center-canvas-in-html5
*/

var airplane1;
var airplane2;
var Orbs1 = []; //orbs shot by airplane 1 
var Orbs2 = []; //orbs shot by airplane 2
var myScore;
var left = false;
var right = false;
var left2 = false;
var right2 = false;
var shooting = false;
var shooting2 = false;


function startGame() {
    airplane1 = new component(30, 30, "red", 100, 120, 'A1');

    airplane2 = new component(30, 30, "blue", 100, 0, 'A2');


    
    //myScore = new component("30px", "Consolas", "black", 280, 40, "text");
    myGameArea.start();
}

//irrelevant now
function checkforclicks() {
    document.onkeydown = function(e) {
        switch (e.keyCode) {
            case 37:
                alert('left');
                break;
            case 38:
                alert('up');
                break;
            case 39:
                alert('right');
                break;
            case 40:
                alert('down');
                break;
        }
    };
}

//checkforclicks();
//_______________________________________________ EVENT HANDLERS FOR MOVEMENT
document.onkeydown = checkKey;
document.onkeyup = resetMovement

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        shooting = true;
    }
    else if (e.keyCode == '37') {
       // left arrow
       left = true;
    }
    else if (e.keyCode == '39') {
       // right arrow
       right = true;
    } else if (e.keyCode =='65') {
        //a 
        left2 = true;
    } else if (e.keyCode == '68') {
        //d
        right2 = true;
    } else if (e.keyCode == '83') {
        //s 
        shooting2 = true;
    }

}

function resetMovement(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        shooting = false;
    }
    else if (e.keyCode == '37') {
       // left arrow
       left = false;
    }
    else if (e.keyCode == '39') {
       // right arrow
       right = false;
    } else if (e.keyCode =='65') {
        //a 
        left2 = false;
    } else if (e.keyCode == '68') {
        //d
        right2 = false;
    } else if (e.keyCode == '83') {
        //s 
        shooting2 = false;
    }

}
//______________________________________________


//takes which airplane orb list needs to be added to 
function ShootEm(orbList, x, y) {
    if (everyinterval(10)) {
        orbList.push(new component(10, 10, "black", x, y, "orb"));
    }
}


var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        /*this.canvas.width = 480;
        this.canvas.height = 270;*/
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
}



function component(width, height, color, x, y, type) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 10;
    //this.speedY = 3;    
    this.x = x;
    this.y = y;
    this.right = false;
    this.left = false;
    
    this.update = function() {
        ctx = myGameArea.context;
        /*if (this.type == "text") { //If a text object do this 
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height); //this will be somewhat changed to accomadate the airplane size/space 
        }*/
        if (this.type == "A1" || this.type == "A2" ) {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height); //this will be somewhat changed to accomadate the airplane size/space 
        } else if (this.type == "orb") {
            ctx.fillStyle = color; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, 2*Math.PI);
            ctx.stroke();
        }
        
    }
    this.newPos = function() {
        this.movePlane(); //ADD THIS 
        this.hitSides(); //change hit bottom to check if hit sides of screen 
        this.isShooting();
    }

    this.isShooting = function() {
        //A1 is at the bottom, so needs to shoot upward
        if (shooting == true && this.type == "A1") {
            ShootEm(Orbs1, this.x + (this.width/2), this.y);
        } else if (shooting2 == true && this.type == "A2") {
            ShootEm(Orbs2, this.x + (this.width/2), this.y + (this.height));
        }
        //A2 at top so needs to shoot downward 
    }



    this.movePlane = function() {
         
        
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
        var canvasWidth = myGameArea.canvas.width - this.width;
        if (this.x > canvasWidth) {
            this.x = canvasWidth;
        } else if (this.x < 0) {
            this.x = 0;
        }
    }
    this.crashWith = function(otherobj) { //change to crash with and orb, i.e. if gets hit basically, basically change to top down 
        //orientation rather than left right orientation for checking for crash 
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
        return crash;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    /* obstacles
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            return;
        } 
        /*could use crash with to test/update whether airplanes have been hit by orbs 
    } */ 
    myGameArea.clear();
    
    myGameArea.frameNo += 1;

    /*
    this spits out the green obstacle rectangles 
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "green", x, 0));
        myObstacles.push(new component(10, x - height - gap, "green", x, height + gap));
    }
    obstacle checking, could be useful for checkign if hit by orbs 
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text="SCORE: " + myGameArea.frameNo;
    myScore.update();
    */
    //myGamePiece.newPos();
    //myGamePiece.update();

    for (i = 0; i < Orbs1.length; i++) { //1 is at the bottom
        Orbs1[i].y += -1;
        Orbs1[i].update(); //could get "fancy" and check when outside of win and delete them once they are 

    }
    for (i = 0; i < Orbs2.length; i++) { //1 is at the bottom
        Orbs2[i].y += 1;
        Orbs2[i].update(); 
    }

    airplane1.newPos();
    airplane1.update();

    airplane2.newPos();
    airplane2.update();
}


function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

/*
function accelerate(n) {
    myGamePiece.gravity = n;
}
*/