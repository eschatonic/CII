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

	var elevation = 0;
	for (var oct = 1; oct <= c.settings.map.elevationOctaves; oct++){
		var falloff = Math.pow(c.settings.map.elevationOctaveFalloff, oct);
		var octScale = scale * falloff;
		var elFirst = noise(y/octScale, x/octScale),
			elSecond = noise(y/octScale, (c.settings.mapX+x)/octScale),
			xProp = x/c.settings.mapX;
		elevation += ((elFirst * xProp) + (elSecond * (1 - xProp))) * falloff;
	}
	square.elevation = elevation;

	var temperature = 0;
	for (var oct = 1; oct <= c.settings.map.temperatureOctaves; oct++) {
		var falloff = Math.pow(c.settings.map.temperatureOctaveFalloff, oct);
		var octScale = scale * falloff;
		var tempNoise = noise((y + 1000) / (octScale / 2), (x + 1000) / (octScale / 2)),
			tempCurve = Math.cos(y / c.settings.mapY * 2 * Math.PI) * -1,
			tempNorm = (tempCurve + 1) / 2;
		temperature += ((tempNoise * c.settings.map.tempNoise) + (tempNorm * (1 - c.settings.map.tempNoise))) * falloff;
	}
	square.temperature = temperature;

	var precipitation = 0;
	for (var oct = 1; oct <= c.settings.map.precipitationOctaves; oct++) {
		var falloff = Math.pow(c.settings.map.precipitationOctaveFalloff, oct);
		var octScale = scale * falloff;
		var precNoise = noise((y + 1000) / (octScale / 3), (x + 1000) / (octScale / 3)),
			precCurve = Math.cos(y / c.settings.mapY * 4 * Math.PI),
			precNorm = (precCurve + 1) / 2;
		precipitation = (precNoise * c.settings.map.precNoise) + (precNorm * (1 - c.settings.map.precNoise));
	}
	square.precipitation = precipitation;

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