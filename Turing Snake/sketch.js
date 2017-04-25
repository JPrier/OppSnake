
var player;
//var pointBlock;
var bullet;
var pointBlocks = [];
var maxPoints = 2;
var snake;
var speed = 1;
var score = 0;
var canSize = 1000;
var scl = canSize * .02;
var startLength = 0;

//TODO: add directional weights to snake, maybe give snake features when certain points are reached? (bullets)

function setup() {
	var cnv = createCanvas(canSize, canSize);
	var x = floor((windowWidth - width) / 2);
	var y = floor((windowHeight - height) / 2);
	cnv.position(x, y);

	noCursor();

	//framerate changes speed (flawed)
	frameRate(20);

	//Create new Snake
	snake = new Snake();
	snake.create();

	//bullet = new Bullet();
	//bullet.create(canSize/2,canSize/2,0);

	//create new PointBlock (maybe make an array of these)
	//pointBlock = new PointBlock();
	//pointBlock.pickLocation();

	//Array of PointBlocks
	for(var i = 0; i < maxPoints; i++){
		pointBlocks[i] = new PointBlock();
		pointBlocks[i].pickLocation();
	}

	//pointBlockss = new PointBlockBST();
	//pointBlockss.createTree();

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

	bullet.update();

	//Create Player Vector and draw the player block
	player = createVector(floor(mouseX), floor(mouseY));
	fill(255);
	player.x = constrain(player.x, 0, width-scl);
	player.y = constrain(player.y, 0, height-scl);
	rect(player.x, player.y, scl, scl)

	//Update pointBlock
	//pointBlock.show();
	//pointBlock.collectPoint();

	//Update pointBlocks
	for(var i = 0; i < maxPoints; i++) {
		pointBlocks[i].show();
		pointBlocks[i].collectPoint();
	}

	//pointBlockss.collectPoint();
	//pointBlockss.show(pointBlockss.root);
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
}

function Bullet() {
	this.x;
	this.y;
	this.vec;
	//direction of the bullet
	this.dir;
	//travels 2 blocks a frame
	this.speed = 2 * scl;

	this.create = function(x, y, dir) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.vec = createVector(this.x, this.y);
	}

	this.update = function() {
		this.x += (speed * this.dir);
		this.y += (speed * this.dir);
		if (this.x < 0 || this.x > canSize || this.y < 0 || this.y > canSize) {
			//Remove the bullet
			this.vec = undefined; //?
		}
		else { this.show(); }
	}

	this.show = function() {
			fill(25);
			ellipse(this.x, this.y, scl/2);
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