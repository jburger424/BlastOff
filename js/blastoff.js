window.addEventListener("load",eventWindowLoaded, false);

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

    var theCanvas = document.getElementById("myCanvas");
    var height = theCanvas.height; //get the heigth of the canvas
    var width = theCanvas.width;  //get the width of the canvas
    var context = theCanvas.getContext("2d");  //get the context

    var then = Date.now();

    var bgImage = new Image();

    bgImage.onload = function() {
        context.translate(width/2,height/2);
        main();
    }



    var rocket = {
        score : 0,
        damage : 0,
        speed : 10,

        setScore : function(newScore){
            this.score = newScore;
        }
    }

    function Star(){
        var dLoc = 500;
        this.xLoc = world.xDist + dLoc - Math.random()*2*dLoc;
        //console.log(world.originX);
        this.yLoc = world.yDist + dLoc - Math.random()*2*dLoc;
        this.draw = function(){
            drawStar(this.xLoc,this.yLoc,20,5,.5);
        }
        this.getDistanceFromOrigin = function(){
            var tempDistance = getDistance(this.xLoc,this.yLoc,world.xDist,-world.yDist);
            return tempDistance;
        }
    }

    var stars = []

    var drawStars = function(stars){
        for(var i=0;i<stars.length;i++){
            stars[i].draw();
        }

    }

    var getDistance = function(x1,y1,x2,y2){
        var distance = Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2));
        return distance;
    }

    var updateStars = function(){
        var numStars = 50;
        while(stars.length<numStars){
            stars[stars.length] = new Star();
        }
        for(var i=0; i<stars.length; i++){
            var tempDist = stars[i].getDistanceFromOrigin();
            if(tempDist > 200){
                stars[i] = new Star();
            }
        }
    }

    function drawRocket(xLoc,yLoc, rWidth, rHeight){
        var xVals = [xLoc,xLoc+(rWidth/2),xLoc+(rWidth/2),xLoc-(rWidth/2),xLoc-(rWidth/2),xLoc];
        var yVals = [yLoc,yLoc+(rHeight/3),yLoc+rHeight,yLoc+rHeight,yLoc+(rHeight/3),yLoc]

        context.beginPath();
        context.moveTo(xVals[0],yVals[0])
        for(var i = 1; i < xVals.length; i++){
            context.lineTo(xVals[i],yVals[i]);
        }
        context.closePath();
        context.lineWidth = 5;
        context.strokeStyle = 'blue';
        context.stroke();

    }

    var world = {
        //pixels per second
        startTime: Date.now(),
        speed: 50,
        startX:width/2,
        startY:height/2,
        originX: 0,
        originY: 0,
        xDist: 0,
        yDist: 0,
        rotationSpeed: 20,
        angle: 0,
        distance: 0,
        calcOrigins : function(){
            world.originX = -world.distance*Math.sin(world.angle*Math.PI/180);
            world.originY = -world.distance*Math.cos(world.angle*Math.PI/180);
        }
    }

    var keysDown = {};

    addEventListener("keydown", function (e) {
	   keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
	   delete keysDown[e.keyCode];
    }, false);
    
    var update = function(modifier) {
        if (37 in keysDown) { // Player holding left
            world.angle += world.rotationSpeed * modifier;
            //console.log("left");
        }
        if (39 in keysDown) { // Player holding right
            world.angle -= world.rotationSpeed * modifier;
            //console.log("right");


        }


    }


    
    var render = function (modifier) {

        updateStars(stars);
        context.clearRect(world.xDist-width/2,world.yDist-height/2,width,height);
        context.fillStyle="black";
        context.fillRect(world.xDist-width/2,world.yDist-height/2,width,height);
        context.fillStyle="red";
        context.fillRect(world.xDist,world.yDist,10,10);

        context.save();

        context.translate(width/2,height/2);
        context.rotate(world.angle*Math.PI/180);



    // draw the image
    // since the context is rotated, the image will be rotated also
        //context.drawImage(bgImage,-bgImage.width/2,-bgImage.width/2);
        //context.fillStyle = "black";

        context.fillStyle="yellow";
        drawStars(stars);


    // we’re done with the rotating so restore the unrotated context
        //
        context.restore();

        world.distance += world.speed * modifier;
        world.originY -= world.speed * modifier;
        var dX = (world.speed*modifier)*Math.sin(world.angle);
        var dY = (world.speed*modifier)*Math.cos(world.angle);
        world.xDist += dX;
        world.yDist += dY;
        console.log(world.xDist+" "+world.yDist);
        context.translate(-dX,-dY);//dX,dY);



        drawRocket(world.xDist,world.yDist,50,200);





        //context.translate(0,world.speed * modifier);






    };

    function drawStar(x, y, r, p, m)
    {
        context.save();
        context.beginPath();
        context.translate(x, y);
        context.moveTo(0,0-r);
        for (var i = 0; i < p; i++)
        {
            context.rotate(Math.PI / p);
            context.lineTo(0, 0 - (r*m));
            context.rotate(Math.PI / p);
            context.lineTo(0, 0 - r);
        }
        context.fill();
        context.restore();
    }

   

    // the game loop

    function main(){
        requestAnimationFrame(main);


        var now = Date.now();
        var delta = now - then;

	   update(delta / 1000);
        //now = Date.now();
        //delta = now - then;
	   render(delta / 1000);

	   then = now;

	// Request to do this again ASAP


    }
    
    var w = window;
    var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame ||    w.mozRequestAnimationFrame;
    //start the game loop
    //gameLoop();

    //event listenters
    bgImage.src = "images/background.jpg";
    

    
} //canvasApp()
