//handles starting
function setup(){
	var $container = $('.container');
	$container.html("");

    initialDataSetup();
	setParams();
    var loaded = loadGame();
    
    if (!loaded){
        //start from scratch
        c.player = {
            name: "Sid Meier",
            seed: Math.random(),
			disableAutosave: false,
			version: c.version
        };
		seed(c.player.seed);
        c.world = new World();
		generateWorld(c.world);
    	c.world.civilisations[0] = new Civilisation(true,0);
    } else {
		//loaded
		Toast.info("Loaded saved game");
        seed(c.player.seed);
		setContains();
		versionCheck();
    }
	
	c.settings.squareSize = Math.floor(Math.min(($(document).width()-c.settings.interfaceWidth)/c.settings.mapX,$(document).height()/c.settings.mapY));
	c.settings.squareSize--;

	createCanvas(c.settings.squareSize * c.settings.mapX,windowHeight-4, $container[0]);
	
	c.ui = new Interface($container);
	c.ui.update(true);
	
	//c.player.name = prompt("What is your name?");
	//c.world.civilisations[0].name = prompt("Name your Civilisation");
	//c.world.civilisations[0].cities[0].name = prompt("Name your capital city");

	c.loop = requestAnimationFrame(loop);
}

//main loop
function loop(){
	draw();
	checkInput();

	var d = new Date().getTime();
	if (d > c.time + c.settings.tick){
		c.time = d;
		tick();
	}

	c.loop = requestAnimationFrame(loop);
}

//interface drawing
function draw(){
    clear();
	updateBlink(new Date().getTime());
    drawMap(c.world.map);
	for (var civilisation in c.world.civilisations){
		drawCivilisation(c.world.civilisations[civilisation]);
	}
	drawParticles();
    c.ui.update(false);
}

//main tick loop for incremental portions
//game functions
function tick(){
    c.timers.autoSave++;
    if (c.timers.autoSave >= c.settings.autoSave){
        saveGame("auto");
        c.timers.autoSave = 0;
    }
	for (var i=0;i<c.settings.mapY;i++){
		for (var j=0;j<c.settings.mapX;j++){
			var square = c.world.map.grid[i][j];
			if (square.owned > -1){
				//workers can work tiles (autoclick)
				if (square.worked){
					//first produce the tile's base resources
					for (var resource in c.params.terrain[square.terrain].production){
						produceResourcesFor(
							[i,j],
							c.world.map.grid[i][j].terrain,resource,
							c.params.terrain[c.world.map.grid[i][j].terrain].production[resource],
							true/*c.world.civilisations[c.world.map.grid[i][j].owned].tech["secondary"+resource]*/,
							c.world.map.grid[i][j].owned
						);
					}
					//then produce for the tile's improvements
					if (square.improvements.length > 0){
						for (var improvement in square.improvements){					
							for (var resource in c.params.resources){
								if (c.params.improvements[square.improvements[improvement]].bonus.hasOwnProperty(resource)){
									produceResourcesFor(
										[i,j],
										c.world.map.grid[i][j].terrain,resource,
										c.params.terrain[c.world.map.grid[i][j].terrain].production[resource],
										true/*c.world.civilisations[c.world.map.grid[i][j].owned].tech["secondary"+resource]*/,
										c.world.map.grid[i][j].owned);
								}
							}
						}
					}
				}
			}
			//cities slowly generate their own food for balance reasons. This should probably be changed at some point.
			if (square.containsCity) c.world.civilisations[square.owned].resources.food += 1;
		}
	}
}