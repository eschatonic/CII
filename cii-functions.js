//Functions
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
	};
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
		var unit = new Unit(civIndex,unitType,locY,locX);
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
			for (var u in c.world.map.grid[targetY][targetX].containsUnit){
				if (c.world.map.grid[targetY][targetX].containsUnit[u].interfaceActions.indexOf("unload") > -1 && c.world.map.grid[targetY][targetX].containsUnit[u].containsUnit.length == 0){
					return c.world.map.grid[targetY][targetX].containsUnit[u];
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
	focus(c.selected.location.y,c.selected.location.x);
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
function canBuild(improvement){
	var square = c.world.map.grid[c.selected.location.y][c.selected.location.x];
	return (square.owned == c.selected.civilisation && square.improvements.indexOf(improvement) == -1 && c.params.terrain[square.terrain].improvements.indexOf(improvement) > -1);
}

function produceResourcesFor(coords,tile,resource,amount,produceSecondary,civ){
	//c.world.civilisations[civ].resources[resource] += amount;
	var city;
	if (c.selected && c.selected.unitType === "undefined" && c.selected.civilisation == civ){
		city = c.selected;
	} else {
		city = getClosestCity(civ,coords);
	}
	if (city) city.resources[resource] += amount;
	if (produceSecondary){
		var secondary = c.params.resources[resource].secondary;
		if (secondary && amount > 0 && tile != "ocean"){
			produceResourcesFor(coords,tile,secondary,c.params.resources[resource].secondaryChance(amount),false,civ);
			if (!c.params.resources[secondary].active && c.world.civilisations[civ].resources[secondary] > 0) c.params.resources[secondary].active = true;
		}
	}
}

function getClosestCity(civ,coords){
	return c.world.civilisations[civ].cities[0];
	//TODO: MAKE THIS ACTUALLY GET THE CLOSEST CITY LATER
}

function countSettlers(civ){
	var pop = 0;
	pop += c.world.civilisations[civ].cities.length;
	for (var unit in c.world.civilisations[civ].units){
		if (c.world.civilisations[civ].units[unit].unitType == "settler") pop++
	}
	return pop;
}
function countWorkers(civ){
	var pop = 0;
	pop += c.world.civilisations[civ].cities.length;
	for (var unit in c.world.civilisations[civ].units){
		if (c.world.civilisations[civ].units[unit].unitType == "worker") pop++
	}
	for (var y=0;y<c.settings.mapY;y++){
		for (var x=0;x<c.settings.mapX;x++){
			if (c.world.map.grid[y][x].owned == civ){
				pop += c.world.map.grid[y][x].improvements.length;
			}
		}
	}
	return pop;
}

function purchase(civ,cost){
	//first check affordability
	for (var checkResource in cost){
		if (c.world.civilisations[civ].resources[checkResource] < cost[checkResource]()) return false;
	}
	//then pay
	for (var payResource in cost){
		c.world.civilisations[civ].resources[payResource] -= cost[payResource]();
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
			digitCount = 0,
			delimiter = "&#8239;"; //thin space is the ISO standard thousands delimiter. we need a non-breaking version

		//first split the string on the decimal point, and assign to the characteristic and mantissa
		var parts = output.split('.');
		if (typeof parts[1] === 'string') mantissa = '.' + parts[1]; //check it's defined first, and tack a decimal point to the start of it

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
			if (output != "") output += ", ";
			output += c.params.resources[resource].name.en;
			output += ": ";
			output += cost[resource]();
		}
		return output;
	}
}

function updateBlink(time){
	var BPM = (1000*60/125);
	c.blink = Math.floor(time/BPM) % 2;
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
	var player, settings, world;
	if (loadType == "import"){
		try {
			//console.log($('#impExpField').val());
			
			var compressed = document.getElementById('impExpField').value;
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
		
		seed(c.player.seed);
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

function sumResource(civ, resource){
	var output = 0;
	for (var city in c.world.civilisations[civ].cities){
		if (c.world.civilisations[civ].cities[city].resources[resource]) output += c.world.civilisations[civ].cities[city].resources[resource];
	}
	return output;
}
function spendResource(civ, resource, amount){
	var cityArray = [];
	for (var city in c.world.civilisations[civ].cities){
		cityArray.push([
			c.world.civilisations[civ].cities[city],
			c.world.civilisations[civ].cities[city].resources[resource]
		]);
	}
	cityArray.sort(function(a,b){
		return b[1] - a[1];
	});
	return cityArray;
}