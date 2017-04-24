
var player;
var pointBlock;
var pointBlocks = [];
var maxPoints = 100;
var snake;
var speed = 1;
var score = 0;
var canSize = 1000;
var scl = canSize * .02;
var startLength = 0;

//TODO: ADD ML, get point blocks to spawn away from edges, and somehow make the pointblocks more efficient
//going to put the point blocks into a BST so that collectpoint isnt getting called maxPoint times (which lags when it is a higher number)

function setup() {
	var cnv = createCanvas(canSize, canSize);
	var x = floor((windowWidth - width) / 2);
	var y = floor((windowHeight - height) / 2);
	cnv.position(x, y);

	noCursor();

	//framerate changes speed (flawed)
	frameRate(30);

	//Create new Snake
	snake = new Snake();
	snake.create();

	//create new PointBlock (maybe make an array of these)
	pointBlock = new PointBlock();
	pointBlock.pickLocation();

	//Array of PointBlocks
	for(var i = 0; i < maxPoints; i++){
		pointBlocks[i] = new PointBlock();
		pointBlocks[i].pickLocation();
	}

	//Create new Player vector
	player = createVector(mouseX, mouseY);
}

function draw() {
	background(51);

	//Update snake
	textSize(40);
	text("Points: " + score, floor((windowWidth - width) / 2), floor((windowHeight - height) / 2));
	snake.update();
	snake.eat();
	snake.show();

	//Create Player Vector and draw the player block
	player = createVector(floor(mouseX), floor(mouseY));
	fill(255);
	player.x = constrain(player.x, 0, width-scl);
	player.y = constrain(player.y, 0, height-scl);
	rect(player.x, player.y, scl, scl)

	//Update pointBlock
	pointBlock.show();
	pointBlock.collectPoint();

	//Update pointBlocks
	for(var i = 0; i < maxPoints; i++) {
		pointBlocks[i].show();
		pointBlocks[i].collectPoint();
	}
}

//Snake with the a block per point, follows the player's mouse
function Snake() {
	this.x = 0;
	this.y = 0;
	this.xspeed = 0;
	this.yspeed = 0;
	this.snakeLength = 0;
	this.body = [];

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

		distX = floor(((mouseX - this.x) / scl) / speed);
		distY = floor(((mouseY - this.y) / scl) / speed);


		//Change X direction towards mouse location
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
		}
	}

	//Updates locations for all vectors in the snake
	this.update = function() {
		//update directions
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


		if (this.snakeLength < this.body.length) {
			print("ERROR: snakeLength is smaller than body.length -- " + this.snakeLength + " " + this.body.length);
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
					score = 0;
					this.x = 0;
					this.y = 0;
					this.xspeed = 0;
					this.yspeed = 0;
					this.snakeLength = 0;
					this.create();
					pointBlock.pickLocation();
					textSize(40);
					text("GAMEOVER", floor(canSize / 2), floor(canSize / 2));
				}
				//avoids extra checking when it isnt close enough
				else if (snakeDistance > this.snakeLength) { break; }
			}
		}
	}
}

//Point Blocks that add to the score when moved over
function PointBlock() {
	this.x = 0;
	this.y = 0;
	this.vec;
	this.left;
	this.right;

	//Player collects point when it touches the block
	this.collectPoint = function() {

		//get distance
		var d = floor(dist(this.vec.x, this.vec.y, player.x, player.y)/scl);

		//If distance is less than 1 then collect the point and change the variables
		if (d < 1){
			
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
}

//PointBlock BST (attempted to be easy to change into AVL) -- need to add parent attribute
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
		}
	}

	//Insert into the tree
	this.insert = function(block) {

		//If the tree is empty set the root to 
		if (!this.root) {
			this.root = block;
		}
		var curr = this.root;
		while (curr) {
			if (curr.x >= block.x) {
				curr = curr.left;
			} else {
				curr = curr.right;
			}
		}
		curr = block;
	}

	//search through the tree for player.x !!!!!TODO!!!!!! -- need to add delete and adapt pointBlock.collectpoint to not find the distance
		this.collectPoint = function() {
		var curr = this.root;
		var foundx = false;
		while (curr) {
			if (curr.x === player.x) {
				if (curr.y === player.y) {
					this.delete(curr);
					curr.collectpoint();
				}
			}
		}
	}
}