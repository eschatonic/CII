//constants - TODO: need to tidy references to these
const CENTER = "center";
const windowHeight = window.innerHeight;

const ARROW_UP = 38;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;
const NUMPAD_DOWN_LEFT = 97;
const NUMPAD_DOWN = 98;
const NUMPAD_DOWN_RIGHT = 99;
const NUMPAD_LEFT = 100;
const NUMPAD_RIGHT = 102;
const NUMPAD_UP_LEFT = 103;
const NUMPAD_UP = 104;
const NUMPAD_UP_RIGHT = 105;
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
	if (typeof green === "undefined" && typeof blue === "undefined"){
		green = red;
		blue = red;
	}
	c.ctx.strokeStyle = "rgb(" + red + "," + green + "," + blue + ")";
}
function fill(red, green, blue){
	if (typeof green === "undefined" && typeof blue === "undefined"){
		green = red;
		blue = red;
	}
	c.ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
}

//Drawing functions
function rect(x, y, dx, dy, stroke){
	c.ctx.fillRect(x, y, dx, dy);
	if (stroke) c.ctx.strokeRect(x, y, dx, dy);
}
function line(x, y, dx, dy){
	c.ctx.beginPath();
	c.ctx.moveTo(x, y);
	c.ctx.lineTo(dx, dy);
	c.ctx.stroke();
}
function circle(x, y, r, stroke){
	c.ctx.beginPath();
	c.ctx.arc(x, y, r, 0, Math.PI * 2);
	c.ctx.fill();
	if (stroke) c.ctx.stroke();
}

//Text functions
function textAlign(alignment){
	c.ctx.textAlign = alignment;
}
function font(font){
	c.ctx.font = font;
}
function text(text, x, y, stroke){
	c.ctx.fillText(text, x, y);
	if (stroke) c.ctx.strokeText(text, x, y);
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