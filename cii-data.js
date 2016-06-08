//this should only contain items that are part of the data structure
//constructors, objects, and methods for manipulating the data structure

var c;
function initialDataSetup() {
	c = {
		version: "0.1.0",
		//dynamic
		interface: false,
		selected: false,
		time: new Date().getTime(),
		timers: {
			autoSave: 0
		},

		//static
		settings: {
			lang: "en",
			delimiters: true,
			mapX: 100,
			mapY: 60,
			squareSize: 10,
			interfaceWidth: 300,
			map: {
				noiseScale: 0.32,
				elevationOctaves:5,
				elevationOctaveFalloff:0.55,
				temperatureOctaves:5,
				temperatureOctaveFalloff:0.55,
				precipitationOctaves:2,
				precipitationOctaveFalloff:0.65,
				seaLevel: 0.6,
				mountainHeight: 0.7,
				tempNoise: 0.17,
				precNoise: 0.5,
				iceThreshold: 0.13
			},
			toastDuration: 1000,
			tick: 1000,
			autoSave: 60
		},
		params: {
			arrays: {
				land: ["desert", "savannah", "woods", "forest", "rainforest", "swamp", "grassland", "taiga", "tundra", "mountains", "snowpeaks", "ice"]
			},
			resources: {},
			terrain: {},
			improvements: {},
			unitTypes: {},
			actions: {}
		}
	};
}

function setParams(){
	setResources(c.params.resources);
	setTerrain(c.params.terrain);
	setTileImprovements(c.params.improvements);
	setUnits(c.params.unitTypes);
	setUnitActions(c.params.actions);
	setCityActions(c.params.actions);
}
function setResources(r){
	r.food =		new Resource("Food", "/icons/food.png", true, "skins", function(amount){ return Math.round(amount * Math.random() * Math.random()); });
	r.wood =		new Resource("Wood", "/icons/wood.png", true, "herbs", function(amount){ return Math.round(amount * Math.random() * Math.random()); });
	r.stone =		new Resource("Stone", "/icons/stone.png", true, "ore", function(amount){ return Math.round(amount * Math.random() * Math.random()); });
	r.skins =		new Resource("Skins", "/icons/skins.png", false, false, false);
	r.herbs =		new Resource("Herbs", "/icons/herbs.png", false, false, false);
	r.ore =			new Resource("Ore", "/icons/ore.png", false, false, false);
	r.leather =		new Resource("Leather", "/icons/leather.png", false, false, false);
	r.piety =		new Resource("Piety", "/icons/piety.png", false, false, false);
	r.metal =		new Resource("Metal", "/icons/metal.png", false, false, false);
	r.gold =		new Resource("Gold", "/icons/gold.png", false, false, false);
}
function setTerrain(t){
	t.ocean =		new Terrain("Ocean", [0,0,255], 1, 0, 0, false, ["fishery"]);
	t.ice =			new Terrain("Ice", [30,144,255], 0, 0, 0, false, []);
	t.desert =		new Terrain("Desert", [255,255,0], 0, 0, 0, true, []);
	t.savannah =	new Terrain("Savannah", [154,205,50], 1, 0, 0, true, ["farm","mine"]);
	t.woods =		new Terrain("Woods", [73,128,0], 0, 1, 0, true, ["lumberCamp","mine"]);
	t.forest =		new Terrain("Forest", [0,128,0], 0, 1, 0, true, ["lumberCamp","mine"]);
	t.rainforest =	new Terrain("Rainforest", [0,84,0], 1, 1, 0, true, ["lumberCamp"]);
	t.swamp =		new Terrain("Swamp", [127,82,93], 0, 0, 0, true, []);
	t.grassland =	new Terrain("Grassland", [50,205,50], 1, 0, 0, true, ["farm","mine"]);
	t.taiga =		new Terrain("Taiga", [0,128,0], 0, 1, 0, true, ["lumberCamp","mine"]);
	t.tundra =		new Terrain("Tundra", [245,255,250], 0, 0, 0, true, ["mine"]);
	t.mountains =	new Terrain("Mountains", [128,128,128], 0, 0, 1, true, ["mine"]);
	t.snowpeaks =	new Terrain("Snowcapped Mountains", [160,160,160], 0, 0, 1, true, ["mine"]);
	/*
	//t.river =				new Terrain("River", 2, 0, 0);
	//t.lake =				new Terrain("Lake", 1, 0, 0);
	//t.icespires =			new Terrain("Ice Spires",0,0,0);
	//t.volcano =			new Terrain("Volcano",0,0,0);
	//t.nexus =				new Terrain("Planar Nexus",0,0,0);
	//t.saltflats =			new Terrain("Salt Flats",0,0,0);
	//t.ashwastes =			new Terrain("Ash Wastes",0,0,0);
	//t.obsidianplains =	new Terrain("Obsidian Plains",0,0,0);
	//t.lava =				new Terrain("Lava",0,0,0);
	//t.brimstonepits =		new Terrain("Brimstone Pits",0,0,0);
	//t.deadlands =			new Terrain("Deadlands",0,0,0);
	//t.bloodocean =		new Terrain("Blood Ocean",0,0,0);
	//t.charnelfields =		new Terrain("Charnel Fields",0,0,0);
	//t.shadowrealm =		new Terrain("Shadow Realm",0,0,0);
	//t.boneyard =			new Terrain("Boneyard",0,0,0);
	//t.twistedland =		new Terrain("Twisted Lands",0,0,0);
	//t.abyss =				new Terrain("Abyss",0,0,0);
	//t.ruins =				new Terrain("Void",0,0,0);
	//t.ruins =				new Terrain("Ruins",0,0,0);
	*/
}
function setTileImprovements(i){
	i.farm =		new Improvement("Farm",{food:1});
	i.lumberCamp =	new Improvement("Lumber Camp",{wood:1});
	i.mine =		new Improvement("Mine",{stone:1});
	i.fishery =		new Improvement("Fishery",{food:1});
}
function setUnits(u){
	u.settler = new UnitType("Settler",{ food:function(){ return Math.floor(56 * Math.pow(1.8,countSettlers(c.selected.civilisation))); } },c.params.arrays.land,["settle","disband"]);
	u.worker = new UnitType("Worker",{ food:function(){ return Math.floor(20 * Math.pow(1.05,countWorkers(c.selected.civilisation))); } },c.params.arrays.land,["work","buildFarm","buildMine","buildLumberCamp","disband"]);
	u.boat = new UnitType("Boat",{ food:function(){ return 10; } },["ocean"],["unload","buildFishery","disband"]);
}
function setUnitActions(a){
	a.disband = new SelectedAction("Disband",false,false,function(){
			disband(c.selected);
		});
	a.settle = new SelectedAction("Found City",function(){
			return (c.params.terrain[c.world.map.grid[c.selected.location.y][c.selected.location.x].terrain].foundable && !c.world.map.grid[c.selected.location.y][c.selected.location.x].containsCity);
		},false,function(){
			var name = prompt("Name your city");
			if (name){
				var city = new City(c.selected.civilisation);
				c.world.civilisations[c.selected.civilisation].cities.push(city);
				foundCity(c.world.civilisations[c.selected.civilisation],city,name,c.selected,c.selected.location.y,c.selected.location.x);
				select(city);
			}
		});
	a.work = new SelectedAction("Work Land",function(){
			return (c.world.map.grid[c.selected.location.y][c.selected.location.x].owned == c.selected.civilisation && !c.world.map.grid[c.selected.location.y][c.selected.location.x].worked);
		},false,function(){
			workLand(c.selected);
		});
	a.buildFarm = new SelectedAction("Build Farm",function(){
			return canBuild("farm");
		},false,function(){
			createImprovement("farm",c.selected);
		});
	a.buildMine = new SelectedAction("Build Mine",function(){
			return canBuild("mine");
		},false,function(){
			createImprovement("mine",c.selected);
		});
	a.buildLumberCamp = new SelectedAction("Build Lumber Camp",function(){
			return canBuild("lumberCamp");
		},false,function(){
			createImprovement("lumberCamp",c.selected);
		});
	a.buildFishery = new SelectedAction("Build Fishery",function(){
			return canBuild("fishery");
		},false,function(){
			createImprovement("fishery",c.selected);
		});
	a.unload = new SelectedAction("Unload",function(){
			return c.selected.containsUnit.length > 0;
		},false,function(){
			if (c.selected.containsUnit.length > 0){
				var currentY = c.selected.location.y;
			var currentX = c.selected.location.x;
				select(c.selected.containsUnit[0]);
				c.selected.location = {
					y:currentY,
					x:currentX
				};
			}
		});
}
function setCityActions(a){
	c.params.actions.createSettler = new SelectedAction("Build Settler",false,c.params.unitTypes["settler"].cost,function(){
			createUnitForCiv(c.selected.civilisation,"settler",c.selected.location.y,c.selected.location.x);
		});
	c.params.actions.createBoat = new SelectedAction("Build Boat",false,c.params.unitTypes["boat"].cost,function(){
			createUnitForCiv(c.selected.civilisation,"boat",c.selected.location.y,c.selected.location.x);
		});
	c.params.actions.createWorker = new SelectedAction("Build Worker",false,c.params.unitTypes["worker"].cost,function(){
			createUnitForCiv(c.selected.civilisation,"worker",c.selected.location.y,c.selected.location.x);
		});
	c.params.actions.expandBorders = new SelectedAction("Expand Borders",false,function(){
			return "Food: " + prettify(Math.pow(100,c.selected.borders));
		},function(){
			//if (sumResource(c.selected.civilisation, "food") >= Math.pow(100,c.selected.borders)){
			//spendResource(c.selected.civilisation, "food", Math.floor(Math.pow(100,c.selected.borders)))
			if (c.world.civilisations[c.selected.civilisation].resources.food >= Math.pow(100,c.selected.borders)){
				c.world.civilisations[c.selected.civilisation].resources.food -= Math.floor(Math.pow(100,c.selected.borders));
				c.selected.borders++;
				for (var i=0-c.selected.borders; i<c.selected.borders+1; i++){
					for (var j=0-c.selected.borders; j<c.selected.borders+1; j++){
						if (Math.sqrt(Math.pow(i,2)+Math.pow(j,2)) <= c.selected.borders + 0.5){
							c.world.map.grid[getTargetY(c.selected.location.y + i)][getTargetX(c.selected.location.x + j)].owned = c.selected.civilisation;
							explore(getTargetY(c.selected.location.y + i),getTargetX(c.selected.location.x + j));
						}
					}
				}
			}
			c.interface.update(true);
		});
}

//Constructors
function Resource(en,url,active,secondary,secondaryChance){
	this.name = {
		en:en
	};
	this.url = url;
	this.active = active;
	this.secondary = secondary;
	this.secondaryChance = secondaryChance;
}
function Terrain(en,color,pfood,pwood,pstone,foundable,improvements){
	this.name = {
		en:en
	};
	this.foundable = foundable;
	this.color = {
	    red:color[0],
	    green:color[1],
	    blue:color[2]
	};
	this.production = {
		food:pfood,
		wood:pwood,
		stone:pstone
	};
	this.improvements = improvements;
}
function UnitType(en,cost,traverse,actions){
    this.name = {
        en:en
    };
    this.cost = cost;
    this.traverse = traverse;
    this.actions = actions;
}
function SelectedAction(name,condition,cost,call){
	this.name = name;
	this.condition = condition;
	this.cost = cost;
    this.call = call;
}

function World(){
}
function Map(){
	this.grid = [];
	this.startingLocs = [];
}
function MapSquare(y,x){
	//this.moveMod = 1;
	//this.defMod = 1;
	this.explored = false;
	this.owned = -1;
	this.containsCity = false;
	this.containsUnit = [];
	
	this.improvements = [];
}
function Improvement(name,bonus){
	this.name = {
		en:name
	};
	this.bonus = bonus;
}

function Civilisation(isPlayer,index){
	this.index = index;
	this.isPlayer = isPlayer;
	this.name = "Civilisation";
	this.color = {
        red:200,
        green:200,
        blue:200
	};
	this.resources = {
	    gatherRate:1
	};
	this.cities = [];
	this.units = [];
	//this.techs = [];

	if (c.world.map.startingLocs.length === 0) throw new Error("No starting locations found. Seed: " + c.player.seed);
	this.startingLocation = c.world.map.startingLocs[Math.floor(random() * c.world.map.startingLocs.length)];
	this.units.push(new Unit(index,"settler",this.startingLocation[0],this.startingLocation[1]));
	if (this.isPlayer){
    	explore(this.startingLocation[0]+1,this.startingLocation[1]);
    	explore(this.startingLocation[0]-1,this.startingLocation[1]);
    	explore(this.startingLocation[0],this.startingLocation[1]+1);
    	explore(this.startingLocation[0],this.startingLocation[1]-1);
    	select(this.units[0]);
	}
}
function City(civ){
	this.civilisation = civ;
	this.resources = {};
	for (var resource in c.params.resources){
        this.resources[resource] = 0;
	}
	this.interfaceActions = ["createSettler","createBoat","createWorker","expandBorders"];
}
function Unit(civ,unitType,y,x){
    this.civilisation = civ;
    this.unitType = unitType;
	this.name = c.params.unitTypes[unitType].name.en;
	this.hidden = false;
	this.location = {
	    y:y,
	    x:x
	};
	this.interfaceActions = c.params.unitTypes[unitType].actions;
	this.container = -1;
	this.containsUnit = [];
	
	c.world.map.grid[y][x].containsUnit.push(this);
}

/*
 function Production(){
 this.type = "";
 this.requires = "";
 this.cost = "";
 this.progress = "";
 }
 */
/*
 function Building(){
 this.value = 0;
 this.cost = [];
 }
 */
/*
 function Tech(){
 this.requires = "";
 }
 */