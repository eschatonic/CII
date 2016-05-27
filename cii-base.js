//constants - TODO: need to tidy references to these
const BOLD = "";
const NORMAL = "";
const CENTER = "";
const windowHeight = window.innerHeight;
const UP_ARROW = 38;
const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const RETURN = 13;

//Canvas stuff
function createCanvas(x, y, appendTo){
	c.canvas = document.createElement('canvas');
	c.canvas.id = 'cii-canvas';
	c.canvas.width = x;
	c.canvas.height = y;
	appendTo ? appendTo.appendChild(c.canvas) : document.body.appendChild(c.canvas);
	c.ctx = c.canvas.getContext("2d");
}
function clear(){
	fill(0, 0, 0);
	rect(0, 0, c.canvas.width, c.canvas.height);
}

//Colour settings
function stroke(red, green, blue){
	c.ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
}
function fill(red, green, blue){
	c.ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
}

//Drawing functions
function rect(x, y, dx, dy, stroke){
	c.ctx.fillRect(x, y, dx, dy);
	if (stroke) c.ctx.strokeRect(x, y, dx, dy);
}
function line(x, y, dx, dy){
	throw new NotImplementedError();
}
function circle(x, y, r, stroke){
	c.ctx.beginPath();
	c.ctx.arc(x, y, r, 0, Math.PI * 2);
	c.ctx.closePath();
	c.ctx.fill();
	if (stroke) c.ctx.stroke();
}

//Text functions
function textAlign(alignment){
	throw new NotImplementedError();
}
function textStyle(style){
	throw new NotImplementedError();
}
function textSize(size){
	throw new NotImplementedError();
}
function text(text, x, y){
	throw new NotImplementedError();
}

//Image functions
function loadImage(image){
	throw new NotImplementedError();
}
function imageMode(mode){
	throw new NotImplementedError();
}
function tint(unknownVariable1, unknownVariable2){
	throw new NotImplementedError();
}
function image(image, x, y, dx, dy){ //draws image
	throw new NotImplementedError();
}

//Error/debug
function NotImplementedError(message) {
	this.name = "NotImplementedError";
	this.message = (message || this.stack || "");
}
NotImplementedError.prototype = Error.prototype;