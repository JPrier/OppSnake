
var player;
//var pointBlock;
var pointBlocks = [];
var maxPoints = 2;
var snake;
var speed = 1;
var score = 0;
var canSize = 1000;
var scl = canSize * .02;
var startLength = 0;
var table = new p5.Table();
//var newRow;
var data = [];
var id = 0;
var snakeCount;

//TODO: add directional weights to snake, add data collection (location, direction (snake), and distance from player)

function setup() {

    var cnv = createCanvas(canSize, canSize);
	var x = floor((windowWidth - width) / 2);
	var y = floor((windowHeight - height) / 2);
	cnv.position(x, y);

	noCursor();

	//framerate changes speed (flawed)
	frameRate(120);

	//Create new Snake
	snake = new Snake();
	snake.create();

	snakeCount = 0;

    /* create new PointBlock 
	pointBlock = new PointBlock();
	pointBlock.pickLocation();*/

	//Array of PointBlocks
	for(var i = 0; i < maxPoints; i++){
		pointBlocks[i] = new PointBlock();
		pointBlocks[i].pickLocation();
	}


	//Create new Player vector
	player = createVector(mouseX, mouseY);

    var headers = ["id", "LocationX", 'LocationY', 'SpeedX', 'SpeedY'];//, 'Player Distance']
    data[0] = headers;


    // After thinking of this...if it creates an array of arrays for the file for every game its going to use so much more power than necessary
    // (This also needs to be in draw -- I dont think itll do anything in setup())
    //---------------------------------------------------------------
    // //getting file, reading from it and then adding it to data[]
   	// var file = document.getElementById("FileUpload").files[0];
   	// if (file) {
   	// 	var reader =  new FileReader();
   	// 	reader.readAsText(file, "utf-8");
   	// 	reader.onload = function (evt) {
   	// 		document.getElementById("fileContents").innerHTML = evt.target.result;
   	// 	}
   	// 	reader.onerror = function (evt) {
   	// 		document.getElementById("fileContents").innerHTML = "error reading file";
   	// 	}
   	// }
}

function draw() {
	background(51);

	//Update snake
	textSize(40);
	text("Points: " + score, floor((windowWidth - width) / 2), floor((windowHeight - height) / 2));
	
	//Create Player Vector and draw the player block
	player = createVector(floor(mouseX), floor(mouseY));
	fill(255);
	player.x = constrain(player.x, 0, width-scl);
	player.y = constrain(player.y, 0, height-scl);
	//console.log("x: " + player.x + " y: " + player.y);
	rect(player.x, player.y, scl, scl)

	//Update pointBlock
	//pointBlock.show();
	//pointBlock.collectPoint();

	//Update pointBlocks
	for(var i = 0; i < maxPoints; i++) {
		pointBlocks[i].show();
		pointBlocks[i].collectPoint();
	}
    
    if(snakeCount == 6) {
		snake.update();
		snakeCount = 0;
	}
	snake.show();
	snake.eat();
	snakeCount++;

    //set data points from this frame into an array and then add that array to the data array
    id++;

    if (snake.snakeLength > 0) { 
        frameData = [id, floor(snake.body[snake.snakeLength - 1].x), floor(snake.body[snake.snakeLength - 1].y), snake.xspeed, snake.yspeed];
    } else { 
        frameData = [id, 0, 0, snake.xspeed, snake.yspeed];
    }
    
    data[id] = frameData;


}

//Snake with the a block per point, follows the player's mouse
function Snake() {
	this.x = 0;
	this.y = 0;
	this.xspeed = 0;
	this.yspeed = 0;
	this.snakeLength = 0;
	this.body = [];
    this.dirY = 0;
    this.dirX = 0;
    this.currentScore = 0;

	//Creates snake, only called on start (useful if snake starts at lengths larger than 1) 
	this.create = function() {

		//empties the body list to make sure nothing is left when the game restarts
		this.body = [];

		//creates all the vectors for the snake body
		for(var i = 0; i < this.snakeLength; i++) {
			this.body[i] = createVector(this.x - i, this.y);
			this.body[i].mult(scl);
		}

		//If the snakeLength is not equal to the size of the array body then there is an ERROR
		if (this.snakeLength != this.body.length) {
			print("ERROR: create() -- " + this.snakeLength + " " + this.body.length);
		}

	}

	//Updates directional values
	this.dir = function() {

		//distX = floor(((mouseX - this.x) / scl) / speed);
		//distY = floor(((mouseY - this.y) / scl) / speed);


		/*Change X direction towards mouse location
		if (distX < 0) {
			this.xspeed = -speed;
		} else if (distX > 0) { 
			this.xspeed = speed;
		} else {
			this.xspeed = 0;
		}
		//Change Y direction towards mouse location
		if (distY < 0) {
			this.yspeed = -speed;
		} else if (distY > 0){
			this.yspeed = speed;
		} else {
			this.yspeed = 0;
		}*/

		this.xspeed = this.dirX * speed;
		this.yspeed = this.dirY * speed;
	}

	//Updates locations for all vectors in the snake
	this.update = function() {
		//update directions
		this.decideNext();
		this.dir();

		//change location of vectors
		if (this.snakeLength === this.body.length) {
			for(var i = 0; i < this.snakeLength - 1; i++) {
				this.body[i] = this.body[i+1];
			}
		}

		//Create a vector for the head
		if (this.snakeLength > 0){
			this.x = this.x + this.xspeed*scl;
			this.y = this.y + this.yspeed*scl;

			this.x = constrain(this.x, 0, width-scl);
			this.y = constrain(this.y, 0, height-scl);

			this.body[this.snakeLength-1] = createVector(this.x, this.y);
		}


		if (this.snakeLength != this.body.length) {
			print("ERROR: snakeLength is different than body.length -- " + this.snakeLength + " " + this.body.length);
		}
	}
	
	//Redraws each of the rects on each of the vectors
	this.show = function() {
		fill(255);
		//Draw each vector in body with a rectangle
		for(var i = 0; i < this.snakeLength; i++) {
			if (this.body[i] && (this.body[i].x >= 0 && this.body[i].y >= 0)){
				rect(this.body[i].x, this.body[i].y, scl, scl);
			} else if (this.snakeLength != this.body.length) {
				print("ERROR: snakeLength is larger than body.length -- " + this.snakeLength + " " + this.body.length);
			} else if (!this.body[i]) {
				print("ERROR: body[" + i + "] does not exist -- length: " + this.snakeLength + " body: " + this.body.length);
			}
		}
	}

	//Game over when snake touches (eats) player
	this.eat = function() {
		for(var i = 0; i < this.body.length; i++) {
			if(this.body[i]){
				var snakeDistance = floor(dist(this.body[i].x, this.body[i].y, player.x, player.y)/scl);
				if (snakeDistance < 1) {
					//GAMEOVER: reset all values and call create()


                    //save the data table
                    //createTable();


					score = 0;
					this.x = 0;
					this.y = 0;
					this.xspeed = 0;
					this.yspeed = 0;
					this.snakeLength = 0;
					this.create();
					for (var i = 0; i < maxPoints; i++) {
						pointBlocks[i].pickLocation();
						pointBlocks[i].show();
					}
					textSize(40);
					text("GAMEOVER", floor(canSize / 2), floor(canSize / 2));
				}
				//avoids extra checking when it isnt close enough
				else if (snakeDistance > this.snakeLength) { break; }
			}
		}
	}
	/*Use a heuristic to score move
		PUNISH FOR:
			- Crossing over itself
		REWARD FOR:
		    - Better trapping of opponent (idk how to do this)
		    - Decreasing distance of opponent
	*/
	this.moveScore = function() {
		function cross(snake) {
			for(var i = 1; i < snake.body.length; i++){
				if ((snake.body[i].x === snake.body[0].x + snake.xspeed) && (snake.body[i].y === snake.body[0].y + snake.yspeed)){
					return -1;
				}
			}
			return 0;
		}

		function distPlayer(snake) {
			xsnake = snake.x + (snake.dirX * speed);
			ysnake = snake.y + (snake.dirY * speed);
			xsnake = constrain(xsnake, 0, width-scl);
			ysnake = constrain(ysnake, 0, height-scl);
			
			distX = floor(((player.x - xsnake) / scl) / speed);
			distY = floor(((player.y - ysnake) / scl) / speed);
			//console.log("distX: " + distX + ", " + mouseX + ", " + snake.x);
			//console.log("distY: " + distY);
			return (distX + distY);
		}
		dists = distPlayer(this);
		return dists + 200*(cross(this));
	}

	//Decides the best move off of what direction scores the best
	this.decideNext = function() {
		//console.log(1);
		curDir = [this.dirX, this.dirY];
		curScore = this.moveScore();

		maxScore = -Infinity;
		bestDir = [];
		dirs = this.getDirs();
		//dirs = [[0, 1], [1, 1], [1, 0], [0, -1], [-1, -1], [-1, 0]];
		for (var i = 0; i < dirs.length; i++) {
			this.dirX = dirs[i][0];
			this.dirY = dirs[i][1];
			tempScore = this.moveScore();
			if (tempScore > maxScore) {
				maxScore = tempScore;
				bestDir = dirs[i];
			}
			//console.log("dir: " + dirs[i] + " -> " + tempScore);
		}
		if (curScore > maxScore) {
			bestDir = curDir;
		}
		this.dirX = bestDir[0];
		this.dirY = bestDir[1];

		console.log("Score: " + maxScore);
		console.log("curScore: " + curScore);
		console.log(bestDir);
	}

	this.getDirs = function() {
		
		dirs = [];

		if (this.y != 980) {
			append(dirs, [0, 1]);

			if (this.x != 0) {
				append(dirs, [-1, 1]);
			}
			if (this.x != 980) {
				append(dirs, [1, 1]);
			}
		}

		if (this.y != 0) {
			append(dirs, [0, -1]);

			if (this.x != 0) {
				append(dirs, [-1, -1]);
			}
			if (this.x != 980) {
				append(dirs, [1, -1]);
			}
		}

		if (this.x != 0) {
			append(dirs, [-1, 0]);
		}
		if (this.x != 980) {
			append(dirs, [1, 0]);
		}
		/*
		if (this.body[0] != null) {
			for (var i = 0; i < dirs.length; i++) {
				headtemp = this.body[0];
				//console.log(headtemp);
				headtemp.x += dirs[i][0] * this.xspeed;
				headtemp.y += dirs[i][1] * this.yspeed;

				for (var j = 1; j < this.body.length; j++) {
					//console.log(headtemp + "   " + this.body[j]);
					if (headtemp.x === this.body[j].x || headtemp.y === this.body[j].y) {
						//console.log("hello");
						splice(dirs, i);
					}
				}
			}
		}*/
		return dirs;
	}
}

//Point Blocks that add to the score when moved over
function PointBlock() {
	this.x = 0;
	this.y = 0;
	this.vec;
	//this.left;
	//this.right;
	//this.parent;

	//Gets a new random location for the point block
	this.pickLocation = function() {
		this.x = floor(random(floor(width/scl)));
		this.y = floor(random(floor(height/scl)));

		this.x = constrain(this.x, 0, width-scl);
		this.y = constrain(this.y, 0, height-scl);
	}

	//Draws the point block
	this.show = function() {
		this.vec = createVector(this.x, this.y);
		this.vec.mult(scl);
		fill(200);
		rect(this.vec.x, this.vec.y, scl, scl);
	}

	//Player collects point when it touches the block
	this.collectPoint = function() {

		//get distance
		var d = dist(this.vec.x, this.vec.y, player.x, player.y)/scl;

		//If distance is less than 1 then collect the point and change the variables
		if (d < 1.05){
			
			//increments score and snakelength (can probably just use score to set snakeLength)
			score++;
			snake.snakeLength++;

			//reset coordinates for this point block
			this.x = 0;
			this.y = 0;
			this.pickLocation();

			//update the point block on the canvas
			this.show();

			//if the score is 1 then create the snake (this way allows for any size snake to be made from start)
			if (score == 1) {
				snake.snakeLength += startLength;
				snake.create();
			} 
			//if the score is higher than 1 call update for each collected point to make sure the snakeLength is not larger than body.length
			else { snake.update(); }		
		}
	}
}


//Pretty much a useless data structure (may attempt it again later but it really doesnt change the runtime by much)
//PointBlock BST -- Still doesn't really work and overall barely changes runtime due to show() needing to be called maxPoint times no matter what
function PointBlockBST() {

	this.root;

	//Create the tree (should only be called once per round)
	this.createTree = function() {

		var block;

		//creates new pointblocks into the tree
		for(var i = 0; i < maxPoints; i++) {
			block = new PointBlock();
			block.pickLocation();
			this.insert(block);
			block.show();
		}
	}

	this.show = function(block) {

		if (!block) {
			return;
		}
		else {
			this.show(block.left);
			block.show();
			this.show(block.right);
		}
	}

	//Insert into the tree
	this.insert = function(block) {

		//Parent
		var par;

		//If the tree is empty set the root to 
		if (!this.root) {
			this.root = block;
		} else {
			var curr = this.root;
			while (curr) {
				par = curr;

				if (curr.x >= block.x) {
					curr = curr.left;
				} else {
					curr = curr.right;
				}
			}
			curr = block;
		}
		block.parent = par;
	}

	//Returns the succesor of the given block (the left most node in the right subtree)
	this.succesor = function(block) {
		var curr = block.right;
		while(curr.left) {
			curr = curr.left;
		}
		
		return curr;
	}

	this.replace = function(oldBlock, newBlock) {

		if (!oldBlock.parent) {
			this.root = newBlock;
		}
		else if (oldBlock === oldBlock.parent.left) {
			oldBlock.parent.left = newBlock;
		}
		else { oldBlock.parent.right = newBlock; }

		if (newBlock && newBlock.parent) {
			newBlock.parent = oldBlock.parent;
		}
	}

	//Delete the block from the tree (put its succesor into its place)
	this.delete = function(block) {
		//find block, then find it's succesor, then replace block with it's succesor?
		if (!block.right) {

			this.replace(block, block.left);

		} else if (!block.left) {

			this.replace(block, block.right);

		} else {
			var suc = this.succesor(block);

			if (suc.parent != block) {
				this.replace(suc, suc.right);
				suc.right = block.right;
				suc.right.parent = suc;
			}

			this.replace(block, suc);
			suc.left = block.left;
			suc.left.parent = suc;
		}
	}

	//search through the tree for player.x
	this.collectPoint = function() {
	var curr = this.root;
	var foundx = false;
	while (curr) {
		if (curr.x === floor(player.x/scl)) {
			foundx = true;
			if (curr.y === floor(player.y/scl)) {
				var temp = curr;
				this.delete(curr);
				temp.parent = undefined;
				temp.left = undefined;
				temp.right = undefined;
				temp.collectPoint();
				this.insert(temp);
				this.show(temp);
				curr = undefined;
			}
		}
		else if (curr.x <= player.x) {curr = curr.left; }
		
		else if (!foundx) { curr = curr.right; }
		//if x is found then if player.x is more than curr.x then there is no point on the player
		else { curr = undefined; }
		}
	}
}

//Creates a table off of the data array
function createTable() {


    //Attempting in native JS
    var csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function(infoArray, index){

    	dataString = infoArray.join(",");
    	csvContent += dataString + "\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Snake_Data_Native.csv");
    document.body.appendChild(link);

    link.click();


}