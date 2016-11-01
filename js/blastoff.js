window.addEventListener("load", eventWindowLoaded, false);

function eventWindowLoaded() {
  canvasApp();
}

function canvasSupport() {
  return Modernizr.canvas;
}

function canvasApp() {
  if (!canvasSupport()) {
    return;
  }
  var canvas = document.getElementById("myCanvas");
  canvas.width = document.body.clientWidth; //document.width is obsolete
  canvas.height = window.innerHeight - 125; //125 is header height
  var height = canvas.height; //get the heigth of the canvas
  var width = canvas.width;  //get the width of the canvas
  var context = canvas.getContext("2d");  //get the context
  var then = Date.now();
  var stars = [];



  var game = {
    gameOver: false,
    time: 0,
    startTime: Date.now(),
    isPaused: false
  };
  var rocket = {
    xLoc: 0,
    yLoc: 0,
    xPoint: 0,
    yPoint: 0,
    score: 0,
    health: 5, //was 10 TODO
    speed: 2/3 * height, //400,
    maxSpeed: 800,
    turningSpeed: 600,
    minAngle: -.3,
    maxAngle: .3,
    angle: 0,
    targetAngle: 0,
    rotSpeed: 3,
    rotChange: 0,
    width: width *.1863,
    height: this.width * 1.36,
    xMin: -width / 2,
    xMax: width / 2
  };


  function Star() {
    //angle is in radians
    this.angle = Math.random() * 3.14 * 2;
    this.value;
    this.isRed;
    //10% of stars will be red
    this.isRed = Math.random() < .1;
    this.randNum = Math.random();
    //determines star value
    if (this.randNum > .5) {
      this.value = 1;
    }
    else if (this.randNum > .15) {
      this.value = 2;
    }
    else {
      this.value = 3;
    }

    var dLoc = height;
    var validLoc = false;
    this.radius = (4 - this.value) * 10;
    var tempXLoc;
    var tempYLoc;
    var counter = 0;
    //counter there to prevent infinite loop
    while (!validLoc && counter < 20) {
      counter++;
      validLoc = true;
      tempXLoc = dLoc - Math.random() * 2 * dLoc;
      tempYLoc = rocket.yLoc - height / 2 - Math.random() * height;
      if (stars.length > 0) {
        for (var i = 0; i < stars.length; i++) {
          var tempDist = getDistance(tempXLoc, tempYLoc, stars[i].xLoc, stars[i].yLoc);
          if (tempDist < this.radius * 4) {
            validLoc = false
          }
        }
      }
    }
    this.xLoc = tempXLoc;
    this.yLoc = tempYLoc;


    this.hasCollided = false;

    //anything else that shouldn't happen?

      this.draw = function () {
        if(validLoc){
        drawStar(this.xLoc, this.yLoc, this.radius*(1/600)*width, 5, .5, this.angle);
      }
    }

  }

  //var stars = new Array;

  var drawStars = function () {
    if (typeof stars !== 'undefined') {
      //console.log("working");
      for (var i = 0; i < stars.length; i++) {
        if (stars[i].hasCollided) {
          /*TODO stupid code fix redundancy*/
          if (stars[i].isRed) {
            context.save();
            context.fillStyle = "white";//"rgb(255,162,162)";
            context.strokeStyle = "red";
            stars[i].draw();
            context.lineWidth = 4;
            context.stroke();
            context.restore();
            context.strokeStyle = "rgb(80,80,80)";
            context.lineWidth = 1;
            context.fillStyle = "red";
            context.font = "30px Arial";
            context.fillText("-" + stars[i].value + "H", stars[i].xLoc, stars[i].yLoc);
            context.strokeText("-" + stars[i].value + "H", stars[i].xLoc, stars[i].yLoc);
          }
          else {
            context.save();
            context.fillStyle = "white"//"rgb(255,162,162)";
            context.strokeStyle = "yellow";
            stars[i].draw();
            context.lineWidth = 4;
            context.stroke();
            context.restore();
            context.strokeStyle = "rgb(80,80,80)";
            context.lineWidth = 1;
            context.fillStyle = "#6bf94f";
            context.font = "30px Arial";
            context.fillText("+" + stars[i].value, stars[i].xLoc, stars[i].yLoc);
            context.strokeText("+" + stars[i].value, stars[i].xLoc, stars[i].yLoc);
          };

        }
        else {
          if (stars[i].isRed) context.fillStyle = "red";
          else context.fillStyle = "yellow";
          stars[i].draw();
        }

      }
    }


  };

  var getDistance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
  };

  var updateStars = function () {
    var numStars = 50;
    while (stars.length < numStars) {
      stars[stars.length] = new Star();
    }
    for (var i = 0; i < stars.length; i++) {
      if (i == 0) {
        //console.log(tempDist);
      }
      if (stars[i].yLoc > rocket.yLoc + height * 2 / 3) {
        stars[i] = new Star();
      }
    }
  };

  var detectStarCollision = function () {
    for (var i = 0; i < stars.length; i++) {
      if (!stars[i].hasCollided && rocket.xLoc <= stars[i].xLoc + stars[i].radius && rocket.xLoc >= stars[i].xLoc - stars[i].radius
          && rocket.yLoc <= stars[i].yLoc + stars[i].radius && rocket.yLoc >= stars[i].yLoc - stars[i].radius) {
        stars[i].hasCollided = true;
        if (stars[i].isRed) rocket.health -= stars[i].value;
        else rocket.score += stars[i].value;

      }

    }
  };

  function drawRocket() {
    var angle = rocket.angle;
    var scale = rocket.width / 76;
    rocket.height = rocket.width / 76;

    var xPoint = rocket.xLoc;
    var yPoint = rocket.yLoc;

    var rwX = [xPoint + 17, xPoint + 38, xPoint + 17, xPoint + 17];
    var rwY = [yPoint + 73, yPoint + 66, yPoint + 29, yPoint + 73]; //rightwind
    var lwX = [xPoint - 17, xPoint - 38, xPoint - 17, xPoint - 17];
    var lwY = [yPoint + 73, yPoint + 66, yPoint + 29, yPoint + 73]; //leftwing

    var bX = [xPoint + 0, xPoint + 0, xPoint - 33, xPoint - 14, xPoint - 14, xPoint - 10, xPoint + 0, xPoint + 10, xPoint + 14, xPoint + 14, xPoint + 33, xPoint + 0, xPoint + 0]; // body
    var bY = [yPoint + 0, yPoint + 0, yPoint + 31, yPoint + 82, yPoint + 82, yPoint + 89, yPoint + 89, yPoint + 89, yPoint + 82, yPoint + 82, yPoint + 31, yPoint + 0, yPoint + 0];

    var nX = [xPoint + 0, xPoint + 0, xPoint - 8, xPoint - 14, xPoint - 10, xPoint - 5, xPoint + 0, xPoint + 5, xPoint + 10, xPoint + 14, xPoint + 8, xPoint + 0, xPoint + 0]; //nose
    var nY = [yPoint + 0, yPoint + 0, yPoint + 7, yPoint + 22, yPoint + 24, yPoint + 25, yPoint + 25, yPoint + 25, yPoint + 24, yPoint + 22, yPoint + 7, yPoint + 0, yPoint + 0];

    var xPoints = [rwX, lwX, bX, nX];
    var yPoints = [rwY, lwY, bY, nY];


    for (var j = 0; j < xPoints.length; j++) {
      for (var i = 0; i < xPoints[j].length; i++) {
        xPoints[j][i] -= rocket.xLoc;
        yPoints[j][i] -= rocket.yLoc + rocket.height / 2;
        //console.log("which height:"+this.height/2);

        xPoints[j][i] *= scale;
        yPoints[j][i] *= scale;

        var tempXVal = xPoints[j][i] * Math.cos(angle) - yPoints[j][i] * Math.sin(angle);
        var tempYVal = xPoints[j][i] * Math.sin(angle) + yPoints[j][i] * Math.cos(angle);

        xPoints[j][i] = tempXVal;
        yPoints[j][i] = tempYVal;

        xPoints[j][i] += rocket.xLoc;
        yPoints[j][i] += rocket.yLoc - rocket.height / 2;
        //xVals[i] = tempXVal + xLoc;
        //yVals[i] = tempYVal+yLoc;//+(yLoc+rHeight);
      }
    }


    //right wing point
    rocket.xPoint = bX[0];
    rocket.yPoint = bY[0];


    //right wing
    context.fillStyle = "rgb(0,0,255)";
    context.beginPath();
    context.moveTo(rwX[0], rwY[0]);
    context.lineTo(rwX[1], rwY[1]);
    context.lineTo(rwX[2], rwY[2]);
    context.lineTo(rwX[3], rwY[3]);
    context.fill();

    //left wing
    context.fillStyle = "rgb(0,0,255)";
    context.beginPath();
    context.moveTo(lwX[0], lwY[0]);
    context.lineTo(lwX[1], lwY[1]);
    context.lineTo(lwX[2], lwY[2]);
    context.lineTo(lwX[3], lwY[3]);
    context.fill();

    //body


    context.fillStyle = "rgb(156,0,0)";
    context.beginPath();
    context.moveTo(bX[0], bY[0]);//point
    context.bezierCurveTo(bX[1], bY[1], bX[2], bY[2], bX[3], bY[3]);//point to left
    context.bezierCurveTo(bX[4], bY[4], bX[5], bY[5], bX[6], bY[6]);//left to center
    context.bezierCurveTo(bX[7], bY[7], bX[8], bY[8], bX[9], bY[9]);//center to right
    context.bezierCurveTo(bX[10], bY[10], bX[11], bY[11], bX[12], bY[12]);//right to point
    context.fill();

    //nose

    context.fillStyle = "rgb(0,0,255)";
    context.beginPath();
    context.moveTo(nX[0], nY[0]);
    context.bezierCurveTo(nX[1], nY[1], nX[2], nY[2], nX[3], nY[3]); //point to left
    context.bezierCurveTo(nX[4], nY[4], nX[5], nY[5], nX[6], nY[6]);//left to center
    context.bezierCurveTo(nX[7], nY[7], nX[8], nY[8], nX[9], nY[9]);//center to right
    context.bezierCurveTo(nX[10], nY[10], nX[11], nY[11], nX[12], nY[12]);//right to point
    context.fill();


  }

  var world = {
    //pixels per second
    startTime: Date.now(),
    speed: 50,
    startX: width / 2,
    startY: height / 2,
    originX: 0,
    originY: 0,
    xDist: 0,
    yDist: 0,
    rotationSpeed: 20,
    angle: 0,
    distance: 0,
    calcOrigins: function () {
      world.originX = -world.distance * Math.sin(world.angle * Math.PI / 180);
      world.originY = -world.distance * Math.cos(world.angle * Math.PI / 180);
    }
  };

  var gameOver = function () {
    game.gameOver = true;
    rocket.speed = 0;
    rocket.maxSpeed = 0;
    rocket.health = 0;
  };

  var keysDown = {};

  addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  }, false);

  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);

  var update = function (modifier) {
    if (rocket.health < 1 && !game.gameOver) {
      gameOver();
    }
    if (game.gameOver && 82 in keysDown) {
      //console.log("restart");
      restart();
    }
    if (!game.gameOver) {
      detectStarCollision();
      game.time = Date.now() - game.startTime;
      if (rocket.speed < rocket.maxSpeed) rocket.speed = 350 + 450 * (game.time / 200000);
      if (37 in keysDown && !(39 in keysDown)) { // Player holding left
        if (rocket.xLoc > rocket.xMin) {
          rocket.xLoc -= rocket.turningSpeed * modifier;
          rocket.targetAngle = rocket.minAngle;
        }
        else {
          rocket.xLoc = rocket.xMin;
          rocket.targetAngle = 0;
        }

      }
      if (39 in keysDown && !(37 in keysDown)) { // Player holding right
        if (rocket.xLoc < rocket.xMax) {
          rocket.xLoc += rocket.turningSpeed * modifier;
          rocket.targetAngle = rocket.maxAngle;
        }
        else {
          rocket.xLoc = rocket.xMax;
          rocket.targetAngle = 0;
        }


      }
      if (!(37 in keysDown) && !(39 in keysDown)) {
        rocket.targetAngle = 0;
      }
      if ((37 in keysDown) && (39 in keysDown)) {
        rocket.targetAngle = 0;
      }

      if (rocket.targetAngle < rocket.angle) {
        if (rocket.angle > rocket.minAngle) rocket.angle -= rocket.rotSpeed * modifier;
        else rocket.angle = rocket.targetAngle;
      }
      if (rocket.targetAngle > rocket.angle) {
        if (rocket.angle < rocket.maxAngle) rocket.angle += rocket.rotSpeed * modifier;
        else rocket.angle = rocket.targetAngle;
      }
    }

    //rocket.turningSpeed = 1000*Math.sin(rocket.angle);


  };

  var restart = function () {
    //console.log("restarting");
    then = Date.now();
    rocket.speed = 400;
    rocket.maxSpeed = 800;
    rocket.angle = 0;
    rocket.xLoc = 0;
    game.gameOver = false;
    game.startTime = Date.now();
    stars = [];
    rocket.score = 0;
    rocket.health = 5; //was 10, just for testing TODO
    main();
  };


  var render = function (modifier) {
    context.clearRect(0 - width / 2, rocket.yLoc - height / 2, width, height);
    context.fillStyle = "black";
    context.fillRect(0 - width / 2, rocket.yLoc - height / 2, width, height);
    context.fillStyle = "#6bf94f";
    context.font = "40px Arial";
    var scoreString = rocket.score.toString();
    context.fillText(scoreString, 220, rocket.yLoc - 250); //write score
    var healthString = rocket.health.toString();
    context.fillStyle = "red";
    context.fillText(healthString, -220, rocket.yLoc - 250); //write score
    if (!game.gameOver) {
      var dY = (rocket.speed * modifier);
      //rocket.xLoc += dX;
      rocket.yLoc -= dY;
      window.yMax -= dY;
      window.yMin -= dY;
      //console.log("potential crash");
      updateStars();
    }
    drawStars();
    context.restore();
    context.translate(0, dY);
    //context.save();
    //context.translate(-rocket.pointX,-rocket.pointY);


    //context.translate(rocket.pointX,rocket.pointY);
    drawRocket(110);

    if (game.gameOver) {
      context.fillStyle = "white";
      context.fillRect(0 - width / 2, rocket.yLoc - height / 3, width, height / 4);
      context.font = "50PX Arial";
      context.fillStyle = "black";
      context.fillText("Game Over, type r to restart", 0 - width / 2, rocket.yLoc - height / 3 + 70, width);
    }


  };

  var drawStar = function (x, y, r, p, m, angle) {
    context.save();
    context.beginPath();
    context.translate(x, y);
    context.rotate(angle);
    context.moveTo(0, 0 - r);
    for (var i = 0; i < p; i++) {
      context.rotate(Math.PI / p);
      context.lineTo(0, 0 - (r * m));
      context.rotate(Math.PI / p);
      context.lineTo(0, 0 - r);
    }
    context.fill();
    context.restore();
  };

  function pause(){
    game.isPaused = true;
    document.getElementById("pause").innerHTML = "&#9654;";
  }
  function resume(){
    then = Date.now();
    game.isPaused = false;
    document.getElementById("pause").innerHTML = "&#9208;";
  }

  function showHelp(){
    document.getElementById("help_modal").className = "";
    pause();
  }

  function hideHelp(){
    document.getElementById("help_modal").className = "hidden";
  }

  document.getElementById("pause").onclick = function() {
    //pause
    if(!game.isPaused){
      pause();
    }
    //resume
    else{
      resume();
    }
  };
///todo have modal show up at start if user has never played
  //show help
  document.getElementById("help_button").onclick = function() {
    showHelp();
  };
  document.getElementById("close_help").onclick = function() {
    hideHelp();
  };

  // the game loop



  function main() {
    //console.log("in main");
    if(!game.isPaused){
      var now = Date.now();
      var delta = now - then;
      //console.log("calling update");
      update(delta / 1000);
      //console.log("calling render");
      render(delta / 1000);
      then = now;
    }

    //console.log("requesting animation frame");
    requestAnimationFrame(main);
  }
  var w = window;
  var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
  context.translate(width / 2, height / 2);

  console.log("about to call main for first   time");

  if (document.cookie.indexOf("visited") == 0) {
    hideHelp();
    main();
  } else {
    document.cookie = "visited";
    main();
    showHelp();
  }
  //main();


} //canvasApp()
