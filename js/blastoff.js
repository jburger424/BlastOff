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
  /*initialize everything*/
  var canvas = document.getElementById("canvas");
  var headHeight = document.getElementById("head").clientHeight + 30;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - headHeight;
  //canvas will be a square unless on mobile-sized screens
  if (canvas.width > canvas.height) {
    canvas.width = canvas.height;
  }
  //sets head, the container of the controls, to the width of the screen
  document.getElementById("head").style.width = canvas.width + "px";

  var canvasHeight = canvas.height;
  var canvasWidth = canvas.width;

  var context = canvas.getContext("2d");
  var then = Date.now();
  var stars = [];
  var gamma = 0;
  var timerLocs = [];
  var timerStrings = ["3", "2", "1", "GO!"];

  var restartModal = document.getElementById("restart_modal");
  var pauseButton = document.getElementById("pause");
  var helpButton = document.getElementById("help_button");
  var closeHelpButton = document.getElementById("close_help");
  var helpModal = document.getElementById("help_modal");



  var game = {
    gameOver: false,
    time: 0,
    startTime: Date.now(),
    isPaused: false,
    yOrig: 0,
    countComplete: false,
    onMobile: false,
    maxStars: 50
  };
  var rocket = {
    yOffset: 100,
    xLoc: 0,
    yLoc: 100,
    //point location values are necessary due to the point of the rocket rotating and therefore not consistent with loc
    xPoint: 0,
    yPoint: 100,
    score: 0,
    startHealth: 10,
    health: 10,
    speed: 2 / 3 * canvasHeight,
    startSpeed: 2 / 3 * canvasHeight,
    maxSpeed: 800,
    turningSpeed: canvasWidth,
    minAngle: -.3,
    maxAngle: .3,
    angle: 0,
    targetAngle: 0,
    rotSpeed: 3,
    rotChange: 0,
    width: canvasHeight * .1863,
    height: canvasHeight * .2534,
    xMin: -2 * canvasWidth / 5,
    xMax: 2 * canvasWidth / 5
  };

  //modified from http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  //checks if user is on mobile by browser type
  game.onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  //will calculate correct y location for timer chars
  for (var i = 0; i < 4; i++) {
    timerLocs.push((rocket.startSpeed + 80) * (i + 1));
  }


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

    var validLoc = false;
    this.radius = (4 - this.value) * 10;
    var tempXLoc;
    var tempYLoc;
    var counter = 0;
    //counter there to prevent infinite loop
    while (!validLoc && counter < 20) {
      counter++;
      validLoc = true;
      tempXLoc = canvasHeight - Math.random() * 2 * canvasHeight;
      //start by generating stars onscreen , once countdown complete move offscreen
      //prevents stars from being clumped together at start
      if (game.countComplete) {
        tempYLoc = rocket.yLoc - canvasHeight - Math.random() * canvasHeight;
      }
      else {
        tempYLoc = rocket.yLoc - canvasHeight / 2 - Math.random() * canvasHeight;
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
      if (validLoc) {
        drawStar(this.xLoc, this.yLoc, this.radius * (1 / 600) * canvasWidth, 5, .5, this.angle);
      }
    }

  }
  //will draw a single star
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
//will draw all stars
  var drawStars = function () {
    if (typeof stars !== 'undefined') {
      //console.log("working");
      for (var i = 0; i < stars.length; i++) {
        var tempStarCol;
        var tempTextCol;
        var tempSym;
        var tempOpp;
//stars are opaque before countdown is complete
        if (!game.countComplete)
          tempOpp = .3;
        else
          tempOpp = 1;

        if (stars[i].isRed) {
          tempStarCol = tempTextCol = "rgba(255,0,0," + tempOpp + ")";
          tempSym = "-";
        }
        else{
          tempStarCol = "rgba(255,255,0," + tempOpp + ")";
          tempTextCol = "#6bf94f";
          tempSym = "+";
        }
//draws differently to indicate that it was hit along with printing the corresponding value
        if(stars[i].hasCollided) {
          context.save();
          context.fillStyle = "white";
          context.strokeStyle = tempStarCol;
          stars[i].draw();
          context.lineWidth = 4;
          context.stroke();
          context.restore();
          context.strokeStyle = "rgb(80,80,80)";
          context.lineWidth = 1;
          context.fillStyle = tempTextCol;
          context.font = "30px Arial";
          context.fillText(tempSym + stars[i].value, stars[i].xLoc, stars[i].yLoc);
          context.strokeText(tempSym + stars[i].value, stars[i].xLoc, stars[i].yLoc);
        }
        else {
          context.fillStyle = tempStarCol;
          stars[i].draw();
        }

      }
    }
  };

  var updateStars = function () {
    //builds up stars at start of game
    while (stars.length < game.maxStars) {
      stars[stars.length] = new Star();
    }
    for (var i = 0; i < stars.length; i++) {
      //will replace stars once they are off the screen
      if (stars[i].yLoc > rocket.yLoc + canvasHeight * 2 / 3) {
        stars[i] = new Star();
      }
    }

  };
  //checks whether rocket point collides with star by looking at radius
  //not fully accurate due to shape of star, treats it as if it is a circle
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


  var getDistance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
  };


//function will draw rocket vector
  function drawRocket() {
    var angle = rocket.angle;
    var scale = rocket.width / 76;
    rocket.height = rocket.width / 76;

    var xPoint = rocket.xLoc;
    var yPoint = rocket.yPoint;

    var rwX = [xPoint + 17, xPoint + 38, xPoint + 17, xPoint + 17];
    var rwY = [yPoint + 73, yPoint + 66, yPoint + 29, yPoint + 73]; //right wing
    var lwX = [xPoint - 17, xPoint - 38, xPoint - 17, xPoint - 17];
    var lwY = [yPoint + 73, yPoint + 66, yPoint + 29, yPoint + 73]; //left wing

    var bX = [xPoint, xPoint, xPoint - 33, xPoint - 14, xPoint - 14, xPoint - 10, xPoint, xPoint + 10, xPoint + 14, xPoint + 14, xPoint + 33, xPoint, xPoint]; // body
    var bY = [yPoint, yPoint, yPoint + 31, yPoint + 82, yPoint + 82, yPoint + 89, yPoint + 89, yPoint + 89, yPoint + 82, yPoint + 82, yPoint + 31, yPoint, yPoint];

    var nX = [xPoint, xPoint, xPoint - 8, xPoint - 14, xPoint - 10, xPoint - 5, xPoint, xPoint + 5, xPoint + 10, xPoint + 14, xPoint + 8, xPoint, xPoint]; //nose
    var nY = [yPoint, yPoint, yPoint + 7, yPoint + 22, yPoint + 24, yPoint + 25, yPoint + 25, yPoint + 25, yPoint + 24, yPoint + 22, yPoint + 7, yPoint, yPoint];

    var xPoints = [rwX, lwX, bX, nX];
    var yPoints = [rwY, lwY, bY, nY];

    for (var j = 0; j < xPoints.length; j++) {
      for (var i = 0; i < xPoints[j].length; i++) {
        xPoints[j][i] -= rocket.xLoc;
        yPoints[j][i] -= rocket.yLoc + rocket.height / 2;

        xPoints[j][i] *= scale;
        yPoints[j][i] *= scale;

        var tempXVal = xPoints[j][i] * Math.cos(angle) - yPoints[j][i] * Math.sin(angle);
        var tempYVal = xPoints[j][i] * Math.sin(angle) + yPoints[j][i] * Math.cos(angle);

        xPoints[j][i] = tempXVal;
        yPoints[j][i] = tempYVal;

        xPoints[j][i] += rocket.xLoc;
        yPoints[j][i] += rocket.yLoc - rocket.height / 2;
      }
    }
    //right wing point
    rocket.xPoint = bX[0];
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
      if (game.countComplete) {
        detectStarCollision();
      }

      game.time = Date.now() - game.startTime;
      if (rocket.speed < rocket.maxSpeed) rocket.speed = 350 + 450 * (game.time / 200000);
      //check if user tilting device left
      if (gamma < 0) {

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
      else if (gamma > 0) {
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

  };

  //will check if countdown is complete, if so will set countComplete var to true, otherwise will draw countdown
  var drawCountdown = function () {
    if (rocket.yLoc < game.yOrig - timerLocs[3] - 200) {
      game.countComplete = true
    }
    context.textAlign = "center";
    context.strokeStyle = "rgb(0,0,0)";
    context.lineWidth = 1;
    context.fillStyle = "rgb(255,255,255)";
    context.font = "80px Arial";

    for (var i = 0; i < 4; i++) {
      context.fillText(timerStrings[i], 0, game.yOrig - timerLocs[i]);
      context.strokeText(timerStrings[i], 0, game.yOrig - timerLocs[i]);
    }

  };

  var gameOver = function () {
    game.gameOver = true;
    rocket.speed = 0;
    rocket.maxSpeed = 0;
    rocket.health = 0;
  };
//resets neccesary values
  var restart = function () {
    restartModal.setAttribute("class", "hidden_modal");
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
    //timeout needed to account for animation
    setTimeout(function () {
      resume();
      main();
    }, 1000);

  };


//responsible for calling functions to render frame and keeping score and health up to date
  var render = function (modifier) {
    context.clearRect(0 - canvasWidth / 2, rocket.yLoc - canvasHeight / 2 - rocket.yOffset, canvasWidth, canvasHeight);
    context.fillStyle = "black";
    context.fillRect(0 - canvasWidth / 2, rocket.yLoc - canvasHeight / 2 - rocket.yOffset, canvasWidth, canvasHeight);
    document.getElementById("score").innerHTML = rocket.score.toString();
    document.getElementById("health").setAttribute("value", rocket.health.toString());
    if (!game.gameOver) {
      var dY = (rocket.speed * modifier);
      rocket.yLoc -= dY;
      rocket.yPoint -= dY;
      window.yMax -= dY;
      window.yMin -= dY;
      updateStars();
    }
    drawStars();
    //only draw countdown when it would be on the screen
    if (!game.countComplete) {
      drawCountdown();
    }

    context.restore();
    context.translate(0, dY);

    drawRocket(110);

    if (game.gameOver) {
      pause();
      restartModal.setAttribute("class", "");

    }

  };





  /*begin listeners*/
  var keysDown = {};
  //will keep current keys down in array*/
  addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
    //special case needed for space bar because once game is paused, game loop isn't running
    if (e.keyCode == 32) {
      if (!game.isPaused)
        pause();
      else
        resume();
    }
  }, false);

  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);

  pauseButton.onclick = function () {
    //pause
    if (!game.isPaused) {
      pause();
    }
    //resume
    else {
      resume();
    }
  };

  restartModal.onclick = function () {
    restart();
  };

  helpButton.onclick = function () {
    showHelp();
  };

  closeHelpButton.onclick = function () {
    hideHelp();
  };
  if(game.onMobile)
    window.addEventListener('deviceorientation', handleOrientation);

  if (game.onMobile) {
    var noSleep = new NoSleep();

    function enableNoSleep() {
      noSleep.enable();
      document.removeEventListener('touchstart', enableNoSleep, false);
    }

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
    document.addEventListener('touchstart', enableNoSleep, false);
  }
//places a cookie on local storage, if user has never visited will always show help at start
  if (document.cookie.indexOf("visited") != -1) {
    main();
    hideHelp();
  } else {
    document.cookie = "visited";
    main();
    showHelp();
  }
  /*end listeners*/


/*begin listener helper functions*/
  //from moz
  //will be 2/3 current + 1/3 past gamma, smoother movement
  function handleOrientation(event) {
    gamma = (gamma + 2 * event.gamma) / 3;
  }

  function pause() {
    game.isPaused = true;
    pauseButton.innerHTML = "&#9658;";
  }

  function resume() {
    then = Date.now();
    game.isPaused = false;
    pauseButton.innerHTML = "&#9208;";
  }

  function showHelp() {
    helpModal.className = "";
    pause();
  }

  function hideHelp() {
    helpModal.className = "hidden";
    resume();
  }
  /*end listener helper functions*/



  // the game loop


  function main() {
    //console.log("in main");
    if (!game.isPaused) {
      var now = Date.now();
      var delta = now - then;
      update(delta / 1000);
      render(delta / 1000);
      then = now;
    }

    requestAnimationFrame(main);
  }

  var w = window;
  var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
  //puts coordinate system in middle
  context.translate(canvasWidth / 2, canvasHeight / 2);







}
