//p5.js initialisation function
//handles starting
function setup(){
    setParams();
    var loaded = loadGame();
    
    if (!loaded){
        //start from scratch
        c.player = {
            name:"Sid Meier",
            seed:Math.floor(Math.random() * 99999999),
			disableAutosave:false,
			version:c.version
        }
        randomSeed(c.player.seed);
        noiseSeed(c.player.seed);
        c.world = new World();
		generateWorld(c.world)
    	c.world.civilisations[0] = new Civilisation(true,0);
    } else {
		//loaded
		Toast.info("Loaded saved game")
        randomSeed(c.player.seed);
        noiseSeed(c.player.seed);
		setContainsUnit();
		versionCheck();
    }
	
	c.settings.squareSize = Math.floor(Math.min(($(document).width()-c.settings.interfaceWidth)/c.settings.mapX,$(document).height()/c.settings.mapY));
	c.settings.squareSize--;
	
	createCanvas(c.settings.squareSize * c.settings.mapX,windowHeight-4);
	
	c.interface = new Interface();
	c.interface.update(true);
	
	//c.player.name = prompt("What is your name?");
	//c.world.civilisations[0].name = prompt("Name your Civilisation");
	//c.world.civilisations[0].cities[0].name = prompt("Name your capital city");
};

//p5.js main loop
//interface drawing
function draw(){
    background(0); //clear
    drawMap(c.world.map);
	for (var civilisation in c.world.civilisations){
		drawCivilisation(c.world.civilisations[civilisation]);
	}
    c.interface.update(false);
    checkInput();
    var d = new Date().getTime();
    if (d > c.time + c.settings.tick){
        c.time = d;
        tick();
    }
}

//main loop
//game functions
function tick(){
    c.timers.autoSave++
    if (c.timers.autoSave >= c.settings.autoSave){
        saveGame("auto");
        c.timers.autoSave = 0;
    }
	//tile improvements
	for (var i=0; i<c.settings.mapY; i++){
		for (var j=0; j<c.settings.mapX; j++){
			if (c.world.map.grid[i][j].owned){
				if (c.world.map.grid[i][j].improvements.length > 0){
					for (var improvement in c.world.map.grid[i][j].improvements){
						for (var resource in c.world.map.grid[i][j].improvements[improvement].bonus){
							c.world.civilisations[c.world.map.grid[i][j].owned].resources[resource] += c.world.map.grid[i][j].improvements[improvement].bonus[resource];
						}
					}
				}
			}
		}
	}
	for (var i=0;i<c.settings.mapY;i++){
		for (var j=0;j<c.settings.mapX;j++){
			var square = c.world.map.grid[i][j]
			//workers can work tiles (autoclick)
			if (square.worked){
				for (var resource in c.params.terrain[square.terrain].production){
					c.world.civilisations[square.owned].resources[resource] += c.params.terrain[square.terrain].production[resource];
				}
			}
			//workers can create improvements
			if (square.improvements.length > 0){
				if (square.owned > -1){
					for (var improvement in square.improvements){					
						for (var resource in c.params.resources){
							if (c.params.improvements[square.improvements[improvement]].bonus.hasOwnProperty(resource)){
								c.world.civilisations[square.owned].resources[resource] += c.params.improvements[square.improvements[improvement]].bonus[resource];
							}
						}
					}
				}
			}
			//cities slowly generate their own food
			if (square.containsCity) c.world.civilisations[square.owned].resources.food += 1;
		}
	}
}