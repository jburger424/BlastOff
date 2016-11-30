window.addEventListener("load", eventWindowLoaded, false);
//TODO don't let it get wider than a square
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
  var canvas = document.getElementById("canvas");
  var headHeight = document.getElementById("head").clientHeight + 30;
  //canvas.width = document.body.clientWidth;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - headHeight;
  if(canvas.width > canvas.height){
    canvas.width = canvas.height;
  }
  document.getElementById("head").style.width = canvas.width+"px";
  var height = canvas.height; //get the heigth of the canvas
  var width = canvas.width;  //get the width of the canvas
  var context = canvas.getContext("2d");  //get the context
  var then = Date.now();
  var stars = [];
  var gamma = 0;
  var timerLocs = [];
  var timerStrings = ["3","2","1","GO!"];



  var game = {
    gameOver: false,
    time: 0,
    startTime: Date.now(),
    isPaused: false,
    yOrig: 0,
    countComplete: false,
    onMobile: false
  };
  var rocket = {
    yOffset: 100,
    xLoc: 0,
    yLoc: 100,
    xPoint: 0,
    yPoint: 100,
    score: 0,
    startHealth: 3,//TODO 10,
    health: 3, //was 10 TODO
    speed: 2/3 * height, //400,
    startSpeed: 2/3 * height,
    maxSpeed: 800, //todo fix
    turningSpeed: width, //600,
    minAngle: -.3,
    maxAngle: .3,
    angle: 0,
    targetAngle: 0,
    rotSpeed: 3,
    rotChange: 0,
    width: height * .1863,
    height: height * .2534,
    xMin: -2*width / 5,
    xMax: 2*width / 5
  };


  function Star() {
    //angle is in radians
    this.angle = Math.random() * 3.14 * 2;
    //10% of stars will be red
    this.isRed = Math.random() < .1;
    this.randNum = Math.random();
    //determines star size/value
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
    this.radius = (4 - this.value) * (1/60)*width;
    var tempXLoc;
    var tempYLoc;
    var counter = 0;
    //counter there to prevent infinite loop
    while (!validLoc && counter < 20) {
      counter++;
      validLoc = true;
      tempXLoc = dLoc - Math.random() * 2 * dLoc;
      if(game.countComplete){
        tempYLoc = rocket.yLoc - height - Math.random() * height;
      }
      else{
        tempYLoc = rocket.yLoc - height / 2 - Math.random() * height;
      }


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
        if(game.countComplete){
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
            }

          }
          else {
            if (stars[i].isRed) context.fillStyle = "red";
            else context.fillStyle = "yellow";
            stars[i].draw();
          }

        }
        else{
          if (stars[i].isRed) context.fillStyle = "rgba(255,0,0,.3)";
          else context.fillStyle = "rgba(255,255,0,.3)";
          stars[i].draw();
        }

      }
    }


  };

  var getDistance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
  };
  var updateStars = function () {
    //wait an extra half second
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
      if (!stars[i].hasCollided &&
          rocket.yLoc >= stars[i].yLoc - stars[i].radius &&
          rocket.yLoc <= stars[i].yLoc + stars[i].radius &&
          rocket.xLoc <= stars[i].xLoc + stars[i].radius &&
          rocket.xLoc >= stars[i].xLoc - stars[i].radius
          ) {
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
    var yPoint = rocket.yPoint;

    //console.log("yPoint:"+rocket.yPoint + "yLoc:"+rocket.yLoc);

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
    //rocket.yPoint = bY[0];


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

  var gameOver = function () {
    game.gameOver = true;
    rocket.speed = 0;
    rocket.maxSpeed = 0;
    rocket.health = 0;
  };

  var keysDown = {};

  addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
    if(e.keyCode == 32){
      if(!game.isPaused)
        pause();
      else
        resume();
    }
  }, false);

  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);

  var update = function (modifier) {
    //console.log(roundedAngle);
    if (rocket.health < 1 && !game.gameOver) {
      gameOver();
    }
    if (game.gameOver && 82 in keysDown) {
      //console.log("restart");
      restart();
    }
    if (!game.gameOver) {
      //don't count collisions prior to the timer being finished
      if(game.countComplete){
        detectStarCollision();
      }

      game.time = Date.now() - game.startTime;
      if (rocket.speed < rocket.maxSpeed) rocket.speed = 350 + 450 * (game.time / 200000);
      //check if user tilting device left
      if (gamma < 0){

        if (rocket.xLoc > rocket.xMin) {
          rocket.xLoc -= rocket.turningSpeed * (Math.abs(gamma) / 30) * modifier;
          rocket.angle = rocket.minAngle * (Math.abs(gamma) / 30);
          rocket.targetAngle = rocket.angle;
        }
        else {
          rocket.xLoc = rocket.xMin;
          rocket.targetAngle = 0;
        }

      }
      //check if user tilting device right
      else if (gamma > 0){
        if (rocket.xLoc < rocket.xMax) {
          rocket.xLoc += rocket.turningSpeed * (Math.abs(gamma) / 30) * modifier;
          rocket.angle = rocket.maxAngle * (Math.abs(gamma) / 30);
          rocket.targetAngle = rocket.angle;
        }
        else {
          rocket.xLoc = rocket.xMax;
          rocket.targetAngle = 0;
        }

      }

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
      //or if player is angling phone to left (gamma negative)


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
      if (!(37 in keysDown) && !(39 in keysDown) && gamma == 0) {
        rocket.targetAngle = 0;
      }
      if ((37 in keysDown) && (39 in keysDown)) {
        rocket.targetAngle = 0;
      }

      if (rocket.targetAngle < rocket.angle) {
        if (rocket.angle > rocket.minAngle)
          rocket.angle -= rocket.rotSpeed * modifier;
        else rocket.angle = rocket.targetAngle;
      }
      if (rocket.targetAngle > rocket.angle) {
        if (rocket.angle < rocket.maxAngle) {
          rocket.angle += rocket.rotSpeed * modifier;
        }
        else rocket.angle = rocket.targetAngle;
      }

    }

    //rocket.turningSpeed = 1000*Math.sin(rocket.angle);


  };

  var restart = function () {
    document.getElementById("restart_modal").setAttribute("class","hidden_modal");
    then = Date.now();
    rocket.speed = 400;
    rocket.maxSpeed = 800;
    rocket.angle = 0;
    rocket.xLoc = 0;
    game.yOrig = rocket.yLoc;
    game.gameOver = false;
    game.startTime = Date.now();
    game.countComplete = false;
    stars = [];
    rocket.score = 0;
    rocket.health = rocket.startHealth;
    setTimeout(function () {
      resume();
      main();
    }, 1000);

  };

  var drawCountdown = function() {
    if(rocket.yLoc < game.yOrig - timerLocs[3] - 200){
      game.countComplete = true
    }
    context.textAlign="center";
    context.strokeStyle = "rgb(0,0,0)";
    context.lineWidth = 1;
    context.fillStyle = "rgb(255,255,255)";
    context.font = "80px Arial";

    for(var i = 0; i < 4; i++){
      context.fillText(timerStrings[i], 0,game.yOrig - timerLocs[i]);
      context.strokeText(timerStrings[i], 0,game.yOrig - timerLocs[i]);
    }

  };


  var render = function (modifier) {
    context.clearRect(0 - width / 2, rocket.yLoc - height / 2 - rocket.yOffset, width, height);
    context.fillStyle = "black";
    //draw background
    context.fillRect(0 - width / 2, rocket.yLoc - height / 2 - rocket.yOffset, width, height);
    document.getElementById("score").innerHTML = rocket.score.toString();
    document.getElementById("health").setAttribute("value",rocket.health.toString());
    if (!game.gameOver) {
      var dY = (rocket.speed * modifier);
      rocket.yLoc -= dY;
      rocket.yPoint -= dY;
      window.yMax -= dY;
      window.yMin -= dY;
      updateStars();
    }
      drawStars();
    if(!game.countComplete){
      drawCountdown();
    }








    context.restore();
    context.translate(0, dY);

    drawRocket(110);

    if (game.gameOver) {
      pause();
      document.getElementById("restart_modal").setAttribute("class","");

    }


  };

  var drawStar = function (x, y, r, p, m, angle) {
    //console.log("y val: "+y);
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
    document.getElementById("pause").innerHTML = "&#9658;";
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
    resume();
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

  document.getElementById("restart_modal").onclick = function() {
    restart();
  };

  document.getElementById("help_button").onclick = function() {
    showHelp();
  };

  document.getElementById("close_help").onclick = function() {
    hideHelp();
  };


  //from moz
  //will be 2/3 current + 1/3 past gamma, smoother movement
  function handleOrientation(event) {
    gamma = (gamma + 2*event.gamma)/3;
  }

  //from http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  //only add the tilt listener if on mobile
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    window.addEventListener('deviceorientation', handleOrientation);
    game.onMobile = true;
  }


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

    requestAnimationFrame(main);
  }
  var w = window;
  var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
  context.translate(width / 2, height / 2);


  //will calculate correct y location for timer chars
  for(var i = 0; i < 4; i++){
    timerLocs.push((rocket.startSpeed + 80)*(i+1));
  }

  if (document.cookie.indexOf("visited") != -1) {
    main();
    hideHelp();
  } else {
    document.cookie = "visited";
    main();
    showHelp();
  }

  if(game.onMobile){
    var noSleep = new NoSleep();

    function enableNoSleep() {
      noSleep.enable();
      document.removeEventListener('touchstart', enableNoSleep, false);
    }

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
    document.addEventListener('touchstart', enableNoSleep, false);
  }

}
