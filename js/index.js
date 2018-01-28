"use strict";
var playground = $('.playground');
var msg = $('.msg');
var score = $('.score');

var availablePixels;
var currentFood;
var BAD_MOVE = 1, 
	ACE_MOVE = 2, 
	GOOD_MOVE = 3;
var initialLength = 16;
var maxWidth = 40;
var gameInterval;
var timeStep, frameStep, currTime;
var gameRunning = false;

const ORIGIN_SPEED = 150;

for(var i = 0; i < maxWidth; i++){
  	for(var j = 0; j < maxWidth; j++){
    	var tmp = $('<div class="pixel" data-x="' + j + '" data-y="' + i + '"></div>');
    	playground.append(tmp);
  	}
}

var showMessage = function(ma, mb) {
    msg.find('.msg-a').text(ma);
    msg.find('.msg-b').text(mb);
};

var showScore = function(nowScore) {
	score.find('.now_score').text(nowScore);
}

var generateFoodRandomly = function(){
	var ap = availablePixels;
	if(ap.length === 0){
		return false;
	}
	var idx = Math.floor(Math.random() * ap.length);
	currentFood = ap.splice(idx, 1)[0].split('|');
	$('div.pixel[data-x="' + currentFood[0] + '"][data-y="' + currentFood[1] + '"]').addClass('taken');
	return true;
};

var cutTails = function(x, y){
    $('div.pixel[data-x="' + x + '"][data-y="' + y + '"]').removeClass('taken');
	availablePixels.push(x + '|' + y);
};


var tryAllocatingPixels = function(x, y){
	var ap = availablePixels;
	var p = x + '|' + y;
	var idx = ap.indexOf(p);
	if(idx !== -1){
		ap.splice(idx, 1);
        $('div.pixel[data-x="' + x + '"][data-y="' + y + '"]').addClass('taken');

		return true;
	}
	else{
		return false;
	}
};
var adjustSpeed = function(len) {
	if( len > 55){
		frameStep = ORIGIN_SPEED/3;
	}
	else if(len >= 45){
		frameStep = ORIGIN_SPEED/2.5;
	}
	else if(len >= 35){
		frameStep = ORIGIN_SPEED/2;
	}
	else if(len >= 25){
		frameStep = ORIGIN_SPEED/1.5;
	}
};


var snake = {
	direction: "dir_left",
	bodyPixels: [],
	move: function(){
		var head = this.bodyPixels[this.bodyPixels.length - 1];
		showScore(this.bodyPixels.length);
		
		var nextHead = [];
		if(this.direction == "dir_left"){
			nextHead.push(head[0] - 1);
		}
		else if(this.direction == "dir_right"){
			nextHead.push(head[0] + 1);
		}
		else{
			nextHead.push(head[0]);
		}
		if(this.direction == "dir_up"){
			nextHead.push(head[1] - 1);
		}
		else if(this.direction == "dir_down"){
			nextHead.push(head[1] + 1);
		}
		else{
			nextHead.push(head[1]);
		}
		if(nextHead[0] == currentFood[0] && nextHead[1] == currentFood[1]){
			this.bodyPixels.push(nextHead);

			adjustSpeed(this.bodyPixels.length);
			if(generateFoodRandomly()){
				return GOOD_MOVE;
			}
			else{
				return ACE_MOVE;
			}
		}
		else if(tryAllocatingPixels(nextHead[0], nextHead[1])){
			var tail = this.bodyPixels.splice(0, 1)[0];
			this.bodyPixels.push(nextHead);
			cutTails(tail[0], tail[1]);
			return GOOD_MOVE;
		}
		else{
			return BAD_MOVE;
		}
	}
};

var initializeGame = function(){
	frameStep = ORIGIN_SPEED;
	timeStep = 50;
	currTime = 0;
    $('.pixel').removeClass('taken');

	availablePixels = [];
	for(var i = 0; i < maxWidth; i++){
  		for(var j = 0; j < maxWidth; j++){
	    	availablePixels.push( i + '|' + j);
	  }
	}


	snake.direction = 'dir_left';
	snake.bodyPixels = [];
	for(var i = 29, end = 29 - initialLength; i > end; i--){
		tryAllocatingPixels(i, 25);
		snake.bodyPixels.push([i, 25]);
	}

	generateFoodRandomly();
};

var startMainLoop = function(){
	gameInterval = setInterval(function(){
		currTime += timeStep;
		//frameStep 決定蛇蛇的移動速度
		if(currTime >= frameStep){
			var m = snake.move();
			if(m === BAD_MOVE){
				clearInterval(gameInterval);
				gameRunning = false;
                showMessage('你輸了', '按空白鍵再挑戰一次');
			}
			else if(m === ACE_MOVE){
				clearInterval(gameInterval);
				gameRunning = false;
                showMessage("你全破了!", '按空白鍵再挑戰一次');            
			}
			currTime = 0;
		}
	}, timeStep);
	showMessage('', '');
};


$(window).keydown(function(e) {
	var action = e.which;
	//dir_up
	if(action === 38){
		e.preventDefault();
		if(snake.direction != "dir_down"){
			snake.direction = "dir_up";
		}	
	}
	//dir_down
	else if(action === 40){
		e.preventDefault();
		if(snake.direction != "dir_up"){
			snake.direction = "dir_down";
		}
		
	}
	//dir_right
	else if(action === 39){
		e.preventDefault();
		if(snake.direction != "dir_left"){
			snake.direction = "dir_right";
		}
		
	}
	//dir_left
	else if(action === 37){
		e.preventDefault();
		if(snake.direction != "dir_right"){
			snake.direction = "dir_left";
		}

	}
	//space
	else if(action === 32){
		e.preventDefault();
		if(!gameRunning){
			initializeGame();
			startMainLoop();
			gameRunning = true;
		}
	}
	//p
	else if(action === 80){
		if(gameRunning){
			//沒有計時器則重啟計時器
			if(!gameInterval){
				startMainLoop();
			}
			else{
			//有計時器則把計時器殺掉
			clearInterval(gameInterval);
			gameInterval = null;
			showMessage('暫停中', '');
			}
		}
		
	}
});
showMessage('貪食蛇', '按空白鍵開始遊戲');
