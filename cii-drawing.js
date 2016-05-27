//drawing
function drawMap(map){
	for (var y=0; y<c.settings.mapY; y++){
		for (var x=0; x<c.settings.mapX; x++){
			if (map.grid[y][x].explored){
				var terrain = map.grid[y][x].terrain;
				fill(c.params.terrain[terrain].color.red, c.params.terrain[terrain].color.green, c.params.terrain[terrain].color.blue);
				rect(c.settings.squareSize * (x - c.ui.settings.gridFocusX) * c.ui.settings.zoomLevel,
						c.settings.squareSize * (y - c.ui.settings.gridFocusY) * c.ui.settings.zoomLevel,
						c.settings.squareSize * c.ui.settings.zoomLevel,
						c.settings.squareSize * c.ui.settings.zoomLevel);
				if (map.grid[y][x].owned >= 0) drawBorders(y,x);
			}
		}
	}
}
function drawBorders(y,x){
	var owner = c.world.map.grid[y][x].owned;
	stroke(c.world.civilisations[owner].color.red,c.world.civilisations[owner].color.green,c.world.civilisations[owner].color.blue);
	if (c.world.map.grid[getTargetY(y-1)][getTargetX(x)].owned != owner) line(
		((x-c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y-c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((x + 1 - c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y-c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel
	);
	if (c.world.map.grid[getTargetY(y+1)][getTargetX(x)].owned != owner) line(
		((x-c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y + 1 - c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((x + 1 - c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y + 1 - c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel
	);
	if (c.world.map.grid[getTargetY(y)][getTargetX(x-1)].owned != owner) line(
		((x-c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y-c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((x-c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y + 1 - c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel
	);
	if (c.world.map.grid[getTargetY(y)][getTargetX(x+1)].owned != owner) line(
		((x + 1 - c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y-c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((x + 1 - c.ui.settings.gridFocusX)*c.settings.squareSize)*c.ui.settings.zoomLevel,
		((y + 1 - c.ui.settings.gridFocusY)*c.settings.squareSize)*c.ui.settings.zoomLevel
	);
	stroke(0,0,0);
}
function drawCivilisation(civ){
	for (var city in civ.cities){
		drawCity(civ.cities[city],civ.color);
	}
	for (var unit in civ.units){
		drawUnit(civ.units[unit],civ.color);
	}
}
function drawCity(city,color){
	var y = city.location.y;
	var x = city.location.x;
	if (c.world.map.grid[y][x].explored){
		textAlign("center");
		font("bold 20px sans-serif")
		fill(color.red,color.green,color.blue);
		text(
			city.name,
			((c.settings.squareSize) * (x + 0.5 - c.ui.settings.gridFocusX)) * c.ui.settings.zoomLevel,
			((c.settings.squareSize) * (y - 0.3 - c.ui.settings.gridFocusY)) * c.ui.settings.zoomLevel
		);
		if (city == c.selected && c.blink){
			stroke(255,255,0);
		}
		rect(
			(x-c.ui.settings.gridFocusX)*c.settings.squareSize*c.ui.settings.zoomLevel,
			(y-c.ui.settings.gridFocusY)*c.settings.squareSize*c.ui.settings.zoomLevel,
			c.settings.squareSize * c.ui.settings.zoomLevel,
			c.settings.squareSize * c.ui.settings.zoomLevel
		);
		stroke(0);
	}
}
function drawUnit(unit,color){
	if (!unit.hidden) {
		if (unit == c.selected && c.blink){
			stroke(255,255,0);
		} else {
			stroke(0);
		}
		fill(color.red,color.green,color.blue);
		circle(
			(unit.location.x-c.ui.settings.gridFocusX)*c.settings.squareSize*c.ui.settings.zoomLevel + c.settings.squareSize*c.ui.settings.zoomLevel/2,
			(unit.location.y-c.ui.settings.gridFocusY)*c.settings.squareSize*c.ui.settings.zoomLevel + c.settings.squareSize*c.ui.settings.zoomLevel/2,
			((c.settings.squareSize - 2) * c.ui.settings.zoomLevel)/2
		);
	}
}

function Particle(img,y,x,life){
	this.img = loadImage(img);
	this.y = y;
	this.x = x;
	this.lifetime = life;
	this.life = Math.random() * life;
	this.uid = Math.random();

	this.move = function(){
		this.life -= c.ui.particles.length;
		if (this.life < 0){
			c.ui.particles.splice(c.ui.particles.indexOf(this),1);
			return false;
		}
		this.y -= this.uid * 2;
		this.x += this.uid - 0.5;
	};
	this.draw = function(){
		imageMode(CENTER);
		if (this.life < this.lifetime / 2){
			tint(255,this.life/this.lifetime * 2 * 255);
		} else {
			tint(255,255);
		}
		image(this.img,this.x,this.y,18,18);
	}
}
function drawParticles(){
	for (var particle in c.ui.particles){
		c.ui.particles[particle].move();
		if (c.ui.particles[particle]) c.ui.particles[particle].draw();
	}
}