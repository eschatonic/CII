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
}

function getTargetY(y){
	var output = y;
	if (output < 0) output = 0;
	if (output >= c.settings.mapY) output = c.settings.mapY - 1;
	return output;
}
function getTargetX(x){
	var output = x;
	if (output < 0) output += c.settings.mapX;
	if (output >= c.settings.mapX) output -= c.settings.mapX;
	return output;
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
			c.world.map.grid[getTargetY(settler.location.y + i)][getTargetX(settler.location.x + j)].owned = settler.civilisation;
		}
	}
	c.world.map.grid[settler.location.y][settler.location.x].containsCity = city;
	c.world.map.grid[settler.location.y][settler.location.x].containsUnit.splice(c.world.map.grid[settler.location.y][settler.location.x].containsUnit.indexOf(settler),1);
	
	civ.units.splice(civ.units.indexOf(settler),1);
}

//units

function createUnitForCiv(civIndex,unitType,locY,locX){
	if (purchase(civIndex,c.params.unitTypes[unitType].cost)){
		var unit = new Unit(civIndex,unitType,locY,locX)
		c.world.civilisations[civIndex].units.push(unit);
		select(unit);
	}
}
function disband(unit){
	if (unit == c.selected) select(false);
	c.world.map.grid[unit.location.y][unit.location.x].containsUnit.splice(c.world.map.grid[unit.location.y][unit.location.x].containsUnit.indexOf(unit),1);
	c.world.civilisations[unit.civilisation].units.splice(c.world.civilisations[unit.civilisation].units.indexOf(unit),1);
}
function moveUnit(unit,dy,dx,keepCurrent){	
	function canMoveTo(unit,dy,dx){
		for (var terrain in c.params.unitTypes[unit.unitType].traverse){
			if (c.params.unitTypes[unit.unitType].traverse[terrain] == c.world.map.grid[getTargetY(unit.location.y + dy)][getTargetX(unit.location.x + dx)].terrain) return true;
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
		if (c.world.map.grid[targetY][targetX].containsUnit.length > 0){
			for (var unit in c.world.map.grid[targetY][targetX].containsUnit){
				if (c.world.map.grid[targetY][targetX].containsUnit[unit].interfaceActions.indexOf("unload") > -1 && c.world.map.grid[targetY][targetX].containsUnit[unit].containsUnit.length == 0){
					return c.world.map.grid[targetY][targetX].containsUnit[unit];
				}
			}
		}
		return false;
	}
	
	if (canMoveTo(unit,dy,dx)){
		if (!keepCurrent) c.world.map.grid[unit.location.y][unit.location.x].containsUnit.splice(c.world.map.grid[unit.location.y][unit.location.x].containsUnit.indexOf(unit),1);
		var fromY = unit.location.y;
		var fromX = unit.location.x;
		
		unit.location.y += dy;
		unit.location.x += dx;
		
		if (unit.location.y < 0) unit.location.y = 0;
		if (unit.location.y >= c.settings.mapY) unit.location.y = c.settings.mapY - 1;
		if (unit.location.x < 0) unit.location.x += c.settings.mapX;
		if (unit.location.x >= c.settings.mapX) unit.location.x -= c.settings.mapX;
		
		c.world.map.grid[unit.location.y][unit.location.x].containsUnit.push(unit);
		explore(unit.location.y,unit.location.x);
		
		if (unit.hidden){
			for (var containerUnit in c.world.map.grid[fromY][fromX].containsUnit){
				if (c.world.map.grid[fromY][fromX].containsUnit[containerUnit].containsUnit.indexOf(unit) > -1){
					c.world.map.grid[fromY][fromX].containsUnit[containerUnit].containsUnit.splice(c.world.map.grid[fromY][fromX].containsUnit[containerUnit].containsUnit.indexOf(unit),1)
				}
			}
			unit.container = -1;
			unit.hidden = false;
		}
	} else {
		var load = canLoadTo(unit,dy,dx); //value used later if truthy
		if (load) {
			unit.hidden = true;
			unit.container = c.world.civilisations[unit.civilisation].units.indexOf(load);
			c.world.map.grid[unit.location.y][unit.location.x].containsUnit.splice(c.world.map.grid[unit.location.y][unit.location.x].containsUnit.indexOf(unit),1);
			load.containsUnit.push(unit);
			select(load);
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

function workLand(worker){
	c.world.map.grid[worker.location.y][worker.location.x].worked = true;
	c.world.civilisations[worker.civilisation].units.splice(c.world.civilisations[worker.civilisation].units.indexOf(worker),1);
	select(false);
}
function createImprovement(improvement,worker){
	c.world.map.grid[worker.location.y][worker.location.x].improvements.push(improvement);
	c.world.map.grid[worker.location.y][worker.location.x].containsUnit.splice(c.world.map.grid[worker.location.y][worker.location.x].containsUnit.indexOf(worker),1);
	c.world.civilisations[worker.civilisation].units.splice(c.world.civilisations[worker.civilisation].units.indexOf(worker),1);
	select(false);
}

function purchase(civ,cost){
	//first check affordability
	for (var resource in cost){
		if (c.world.civilisations[civ].resources[resource] < cost[resource]) return false;
	}
	//then pay
	for (var resource in cost){
		c.world.civilisations[civ].resources[resource] -= cost[resource];
	}
	return true;
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
function costToString(cost){
	if (typeof(cost) == "function") {
		return cost();
	} else {
		var output = "";
		for (var resource in cost){
			if (!output == "") output += ", ";
			output += c.params.resources[resource].name.en;
			output += ": ";
			output += cost[resource];
		}
		return output;
	}
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
	if (saveType == "export"){
		var string = '[' + JSON.stringify(c.player) + ',' + JSON.stringify(c.settings) + ',' + JSON.stringify(c.world) + ']';
		var compressed = LZString.compressToBase64(string);
		console.log('Compressing Save');
		console.log('Compressed from ' + string.length + ' to ' + compressed.length + ' characters');
		document.getElementById('impExpField').value = compressed;
		Toast.info('Exported. Keep your code safe!');
	} else {
		if (saveType == "auto" && c.player.disableAutosave) return false;
		
		localStorage.setItem("player",JSON.stringify(c.player));
		localStorage.setItem("settings",JSON.stringify(c.settings));
		localStorage.setItem("world",JSON.stringify(c.world));
		
		if (saveType == "auto") Toast.info("Autosaved");
		if (saveType == "manual") Toast.info("Saved Game");
	}
	_gaq.push(['_trackEvent', 'CivClicker II', 'Save', saveType]);
}
function loadGame(loadType){
	var player, setttings, world;
	if (loadType == "import"){
		try {
			//console.log($('#impExpField').val());
			
			var compressed = $('#impExpField').val();
			var decompressed = LZString.decompressFromBase64(compressed);
			var revived = JSON.parse(decompressed);
			player = revived[0];
			settings = revived[1];
			world = revived[2];
			Toast.info('Imported saved game');
			
		} catch (err){
			Toast.error('Could not import string');
			return false;
		}
		if (player) c.player = player;
		if (settings) c.settings = settings;
		if (world) c.world = world;
		
		randomSeed(c.player.seed);
        noiseSeed(c.player.seed);
		setContains();
		versionCheck();
	} else {
		player = JSON.parse(localStorage.getItem("player"));
		settings = JSON.parse(localStorage.getItem("settings"));
		world = JSON.parse(localStorage.getItem("world"));
		
		if (player) c.player = player;
		if (settings) c.settings = $.extend(true,c.settings,settings);
		if (world) c.world = $.extend(true,c.world,world);
	}
		
	return (player && settings && world);
}
function setContains(){
	//map
	//first clear all
	for (var y=0; y<c.settings.mapY; y++){
        for (var x=0; x<c.settings.mapX; x++){
            c.world.map.grid[y][x].containsUnit = [];
			c.world.map.grid[y][x].containsCity = false;
        }
    }
	//then assign all units
	for (var civilisation in c.world.civilisations){
		for (var unit in c.world.civilisations[civilisation].units){
			var thisUnit = c.world.civilisations[civilisation].units[unit];
			thisUnit.containsUnit = []; //clear contained units
			if (!thisUnit.hidden){
				c.world.map.grid[thisUnit.location.y][thisUnit.location.x].containsUnit.push(thisUnit);
			} else {
				//unit must be contained
				if (thisUnit.container > -1) c.world.civilisations[civilisation].units[thisUnit.container].containsUnit.push(thisUnit);
			}
		}
		for (var city in c.world.civilisations[civilisation].cities){
			var thisCity = c.world.civilisations[civilisation].cities[city];
			c.world.map.grid[thisCity.location.y][thisCity.location.x].containsCity = thisCity;
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
function toggleAutosave(){
	if (c.player.disableAutosave){
		c.player.disableAutosave = false;
		Toast.info("Autosave enabled");
		$('#autosaveToggle').text("Disable Autosave");
	} else {
		c.player.disableAutosave = true;
		Toast.info("Autosave disabled");
		$('#autosaveToggle').text("Enable Autosave");
	}
}

function versionCheck(){
	var currentVersion = parseVersion(c.version);
	var playerVersion = parseVersion(c.player.version);
	if (currentVersion[0] >= playerVersion[0]){
		if (currentVersion[1] >= playerVersion[1]){
			if (currentVersion[2] > playerVersion[2]){
				runUpdates(playerVersion);
			}
		}
	}
}
function parseVersion(versionStr){
	try{
		var output = versionStr.split(".");
		for (var i=0;i<output.length;i++){
			output[i] = parseInt(output[i]);
		}
		return output;
	} catch(err){
		return [0,0,0];
	}
}
function runUpdates(playerVersion){
	//run version updates here
	//finally update version
	c.version.player = c.version;
}