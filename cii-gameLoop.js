//p5.js initialisation function
//handles starting
function setup(){
    setParams();
    var loaded = loadGame();
    
    if (!loaded){
        //start from scratch
        c.player = {
            name:"Sid Meier",
            seed:Math.floor(Math.random() * 99999999)
        }
        randomSeed(c.player.seed);
        noiseSeed(c.player.seed);
        c.world = new World();
		generateWorld(c.world)
    	c.world.civilisations[0] = new Civilisation(true,0);
    } else {
		//loaded
        randomSeed(c.player.seed);
        noiseSeed(c.player.seed);
		setContainsUnit();
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
					console.log(c.world.map.grid[i][j].improvements)
					for (var improvement in c.world.map.grid[i][j].improvements){
						for (var resource in c.world.map.grid[i][j].improvements[improvement].bonus){
							console.log(improvement,resource);
							c.world.civilisations[c.world.map.grid[i][j].owned].resources[resource] += c.world.map.grid[i][j].improvements[improvement].bonus[resource];
						}
					}
				}
			}
		}
	}
	
	
	
    //working tiles with worker units. change how this works later
    for (var civilisation in c.world.civilisations){
        for (var unit in c.world.civilisations[civilisation].units){
            var unit = c.world.civilisations[civilisation].units[unit]
            if (unit.unitType == "worker"){
                if (c.world.map.grid[unit.location.y][unit.location.x].owned == civilisation){
                    for (var resource in c.params.terrain[c.world.map.grid[unit.location.y][unit.location.x].terrain].production){
    					c.world.civilisations[civilisation].resources[resource] += c.params.terrain[c.world.map.grid[unit.location.y][unit.location.x].terrain].production[resource];
    				}
                }
            }
        }
    }
}