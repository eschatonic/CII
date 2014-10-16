//Functions

function generateWorld(world){
	world.date = 0;
	
	world.map = new Map();
	generateMap(world.map);
	
	world.civilisations = [];
}
function generateMap(map){
	for (var y=0;y<c.settings.mapY;y++){
		map.grid[y] = [];
		for (var x=0;x<c.settings.mapX;x++){
			map.grid[y][x] = new MapSquare(y,x);
			generateMapSquare(map,y,x);
		}
	}
}
function generateMapSquare(map,y,x){
	var square = map.grid[y][x];
	var scale = c.settings.mapX * c.settings.map.noiseScale;
	
	var elFirst = noise(y/scale,x/scale),
		elSecond = noise(y/scale,(c.settings.mapX+x)/scale),
		xProp = x/c.settings.mapX;
	square.elevation = (elFirst * (xProp)) + (elSecond * (1 - xProp));
	
	var tempNoise = noise((y+1000)/(scale/2),(x+1000)/(scale/2)),
		tempCurve = Math.cos(y / c.settings.mapY * 2 * Math.PI) * -1,
		tempNorm = (tempCurve + 1)/2;
	square.temperature = (tempNoise * c.settings.map.tempNoise) + (tempNorm * (1 - c.settings.map.tempNoise));
	
	var precNoise = noise((y+1000)/(scale/3),(x+1000)/(scale/3)),
		precCurve = Math.cos(y / c.settings.mapY * 4 * Math.PI),
		precNorm = (precCurve + 1)/2;
	square.precipitation = (precNoise * c.settings.map.precNoise) + (precNorm * (1 - c.settings.map.precNoise));
	
	if (square.elevation < c.settings.map.seaLevel){
		//sea
		if (square.temperature > c.settings.map.iceThreshold){
			square.terrain = "ocean";
		} else {
			square.terrain = "ice"
		}
	} else if (square.elevation < c.settings.map.mountainHeight) {
		//lowlands
		if (square.temperature < 0.2){
			square.terrain = "tundra";
		} else {
			//mark as potential starting location
			c.world.map.startingLocs.push([y,x]);
			if (square.precipitation < 0.3){
				if (square.temperature - square.precipitation < 0.3){
					square.terrain = "grassland";
				} else {
					square.terrain = "desert";
				}
			} else {
				if (square.temperature < 0.5){
					square.terrain = "taiga";
				} else if (square.temperature < 0.75){
					if (square.precipitation < 0.5){
						square.terrain = "woods";
					} else if (square.precipitation < 0.7) {
						square.terrain = "forest";
					} else {
						square.terrain = "swamp";
					}
				} else {
					if (square.precipitation < 0.5){
						square.terrain = "savannah";
					} else if (square.precipitation < 0.7){
						square.terrain = "forest";
					} else {
						square.terrain = "rainforest";
					}
				}
			}
		}
	} else {
		//high elevation
		if (square.elevation < c.settings.map.mountainHeight + 0.05){
			square.terrain = "mountains";
		} else {
			square.terrain = "snowpeaks";
		}
	}
	for (var resource in c.params.resources){
		//tiles initially generate with no improvements
		square.improvements[resource] = 0;
	}
}

//cities

function foundCity(civ,city,name,settler){
	city.name = name;
	city.location = {
		y:settler.location.y,
		x:settler.location.x
	}
	city.borders = 1;
	city.production = [];
	city.buildings = [];
	
	explore(settler.location.y+1,settler.location.x);
	explore(settler.location.y-1,settler.location.x);
	explore(settler.location.y,settler.location.x+1);
	explore(settler.location.y,settler.location.x-1);
	
	for (var i=-1; i<2; i++){
		for (var j=-1; j<2; j++){
			c.world.map.grid[settler.location.y + i][settler.location.x + j].owned = settler.civilisation;
		}
	}
	c.world.map.grid[settler.location.y][settler.location.x].containsCity = city;
	c.world.map.grid[settler.location.y][settler.location.x].containsUnit = false;
	
	civ.units.splice(civ.units.indexOf(settler),1);
}

//units

function createUnitForCiv(civIndex,unitType,locY,locX){
	var unit = new Unit(civIndex,unitType,locY,locX)
	c.world.civilisations[civIndex].units.push(unit);
	select(unit);
}
function moveUnit(unit,dy,dx,keepCurrent){	
	function canMoveTo(unit,dy,dx){
		var targetY = unit.location.y + dy;
		var targetX = unit.location.x + dx;
		if (targetY < 0) targetY = 0;
		if (targetY >= c.settings.mapY) targetY = c.settings.mapY - 1;
		if (targetX < 0) targetX += c.settings.mapX;
		if (targetX >= c.settings.mapX) targetX -= c.settings.mapX;
		for (var terrain in c.params.unitTypes[unit.unitType].traverse){
			if (c.params.unitTypes[unit.unitType].traverse[terrain] == c.world.map.grid[targetY][targetX].terrain) return true;
		}
		return false;
	}
	function canLoadTo(unit,dy,dx){
		var targetY = unit.location.y + dy;
		var targetX = unit.location.x + dx;
		if (targetY < 0) targetY = 0;
		if (targetY >= c.settings.mapY) targetY = c.settings.mapY - 1;
		if (targetX < 0) targetX += c.settings.mapX;
		if (targetX >= c.settings.mapX) targetX -= c.settings.mapX;
		if (c.world.map.grid[targetY][targetX].containsUnit){
			if (c.world.map.grid[targetY][targetX].containsUnit.interfaceActions.indexOf("unload") > -1 && !c.world.map.grid[targetY][targetX].containsUnit.containsUnit){
				return [targetY,targetX];
			}
		}
		return false;
	}
	
	if (canMoveTo(unit,dy,dx)){
		if (!keepCurrent) c.world.map.grid[unit.location.y][unit.location.x].containsUnit = false;
		var fromY = unit.location.y;
		var fromX = unit.location.x;
		
		unit.location.y += dy;
		unit.location.x += dx;
		
		if (unit.location.y < 0) unit.location.y = 0;
		if (unit.location.y >= c.settings.mapY) unit.location.y = c.settings.mapY - 1;
		if (unit.location.x < 0) unit.location.x += c.settings.mapX;
		if (unit.location.x >= c.settings.mapX) unit.location.x -= c.settings.mapX;
		
		c.world.map.grid[unit.location.y][unit.location.x].containsUnit = unit;
		explore(unit.location.y,unit.location.x);
		
		if (unit.hidden){
			c.world.map.grid[fromY][fromX].containsUnit.containsUnit = false;
			unit.hidden = false;
		}
	} else {
		var load = canLoadTo(unit,dy,dx); //value used later if truthy
		if (load) {
			unit.hidden = true;
			c.world.map.grid[unit.location.y][unit.location.x].containsUnit = false;
			c.world.map.grid[load[0]][load[1]].containsUnit.containsUnit = unit;
			select(c.world.map.grid[load[0]][load[1]].containsUnit);
		}
	}
}
function explore(fromY,fromX){
    for (var toY = fromY-1; toY<=fromY+1; toY++){
        for (var toX = fromX-1; toX<=fromX+1; toX++){
            var y = toY, x = toX;
            
            if (y < 0) y = 0;
            if (y >= c.settings.mapY) y = c.settings.mapY -1;
            
            if (x < 0){
                x += c.settings.mapX;
            } else if (x >= c.settings.mapX){
                x -= c.settings.mapX;
            }
            
            if (!c.world.map.grid[y][x].explored){
                c.world.map.grid[y][x].explored = true;
            }
        }
    }
}

//utility

function prettify(input){
	var output = '';
	if (c.settings.delimiters){
		output = input.toString();
		var characteristic = '', //the bit that comes before the decimal point
			mantissa = '', //the bit that comes afterwards
			digitCount = 0;
			delimiter = "&#8239;"; //thin space is the ISO standard thousands delimiter. we need a non-breaking version

		//first split the string on the decimal point, and assign to the characteristic and mantissa
		var parts = output.split('.');
		if (typeof parts[1] === 'string') var mantissa = '.' + parts[1]; //check it's defined first, and tack a decimal point to the start of it

		//then insert the commas in the characteristic
		var charArray = parts[0].split(""); //breaks it into an array
		for (var i=charArray.length; i>0; i--){ //counting backwards through the array
			characteristic = charArray[i-1] + characteristic; //add the array item at the front of the string
			digitCount++;
			if (digitCount == 3 && i!=1){ //once every three digits (but not at the head of the number)
				characteristic = delimiter + characteristic; //add the delimiter at the front of the string
				digitCount = 0;
			}
		}
		output = characteristic + mantissa; //reassemble the number
	} else {
		output = input;
	}
	return output;
}

//Debug
function revealAll(){
    for (var y=0; y<c.settings.mapY; y++){
        for (var x=0; x<c.settings.mapX; x++){
            explore(y,x);
        }
    }
}

//save/load
function saveGame(saveType){
    localStorage.setItem("player",JSON.stringify(c.player));
	localStorage.setItem("settings",JSON.stringify(c.settings));
    localStorage.setItem("world",JSON.stringify(c.world));
	if (saveType == "auto") Toast.info("Autosaved");
	if (saveType == "manual") Toast.info("Saved Game");
}
function loadGame(){
    var player = JSON.parse(localStorage.getItem("player"));
	var settings = JSON.parse(localStorage.getItem("settings"));
	var world = JSON.parse(localStorage.getItem("world"));
    
    if (player) c.player = player;
	if (settings) c.settings = $.extend(true,c.settings,settings);
    if (world) c.world = $.extend(true,c.world,world);
	
	return (player && settings && world);
}
function setContainsUnit(){
	//first clear all
	for (var y=0; y<c.settings.mapY; y++){
        for (var x=0; x<c.settings.mapX; x++){
            c.world.map.grid[y][x].containsUnit = false;
        }
    }
	//then assign all non-hidden units
	for (var civilisation in c.world.civilisations){
		for (var unit in c.world.civilisations[civilisation].units){
			var thisUnit = c.world.civilisations[civilisation].units[unit];
			if (!thisUnit.hidden){
				c.world.map.grid[thisUnit.location.y][thisUnit.location.x].containsUnit = thisUnit;
			}
		}
	}
}
function deleteSave(){
    if (confirm("Are you sure you wish to delete your saved game? This cannot be recovered.")){
        localStorage.removeItem("player");
		localStorage.removeItem("settings");
		localStorage.removeItem("world");
    }
}