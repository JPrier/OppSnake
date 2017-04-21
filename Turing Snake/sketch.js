
var player;
var pointBlock;
var snake;
var scl = 20;
var speed = 1;
var score = 0;
var canSize = 1000;

//TODO: allow proper adjustment of snake speed, add menu and gameover screens, 
//and use 263 algos to make super efficient (to allow more power to be used for ML)
//also allow the snake to grow for each point

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
}

//snake with 20 blocks,updates direction to follow the mouse
function Snake() {
	this.x = 0;
	this.y = 0;
	this.xspeed = 0;
	this.yspeed = 0;
	this.snakeLength = 1;
	this.body = [];

	//Creates snake, only called on start
	this.create = function() {

		for(var i = 0; i < this.snakeLength; i++) {
			this.body[i] = createVector(this.x + i, this.y);
			this.body[i].mult(scl);
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
		print(this.xspeed + ", " + this.yspeed + "\n");
		updates = [];
		//change location of vectors
		print("snakelength: " + this.snakeLength + ", " + this.body.length + "\n");
		if (this.snakeLength === this.body.length) {
			for(var i = 0; i < this.body.length - 1; i++) {
				this.body[i] = this.body[i+1];
				print(i + ": (" + this.body[i].x + "," + this.body[i].y + ")");
			}
		}

		this.x = this.x + this.xspeed*scl;
		this.y = this.y + this.yspeed*scl;

		this.x = constrain(this.x, 0, width-scl);
		this.y = constrain(this.y, 0, height-scl);

		this.body[this.snakeLength-1] = createVector(this.x, this.y);
	}
	
	//Redraws each of the rects on each of the vectors
	this.show = function() {
		fill(255);
		//Draw each vector in body with a rectangle
		for(var i = 0; i < this.snakeLength-1; i++) {
			rect(this.body[i].x, this.body[i].y, scl, scl);
		}
		fill(255);
		rect(this.x, this.y, scl, scl);
	}

	//Game over when snake touches (eats) player (maybe use a divide and conquer for this? dont know if that'll apply)
	this.eat = function() {
		for(var i = 0; i < this.snakeLength; i++) {
			var snakeDistance = floor(dist(this.body[i].x, this.body[i].y, player.x, player.y)/scl);
			if (snakeDistance < 1) {
				//GAMEOVER
				score = 0;
				this.snakeLength = 1;
				this.body = [];
				this.body[0] = this.body[this.body.length - 1];
				this.x = 0;
				this.y = 0;
				this.xspeed = 0;
				this.yspeed = 0;
				textSize(40);
				text("GAMEOVER", floor(canSize / 2), floor(canSize / 2));
			}
			else if (snakeDistance >= this.snakeLength) { break; }
		}
	}
}

function PointBlock() {
	this.x = 0;
	this.y = 0;
	this.vec;

	//Player collects point when it touches the block
	this.collectPoint = function() {
		var d = floor(dist(this.vec.x, this.vec.y, player.x, player.y)/scl);
		if (d < 1){
			score++;
			snake.snakeLength++;
			this.x = 0;
			this.y = 0;
			this.pickLocation();
			this.show();
			print("sLength: " + snake.snakeLength);
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

//function Player() {}

//function keyPressed() {}