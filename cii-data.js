//this should only contain items that are part of the data structure
//constructors, objects, and methods for manipulating the data structure

var c = {
    //dynamic
	interface:false,
    selected:false,
	time:new Date().getTime(),
	timers:{
	    autoSave:0
	},
    
    //static
	settings:{
		lang:"en",
		delimiters:true,
		mapX:100,
		mapY:60,
		squareSize:10,
		interfaceWidth:300,
		map:{
            noiseScale:0.12,
			seaLevel:0.52,
			mountainHeight:0.7,
			tempNoise:0.17,
			precNoise:0.5,
			iceThreshold:0.12
		},
		toastDuration:1000,
		tick:1000,
		autoSave:60
	},
	params:{
	    arrays:{
	        land:["desert","savannah","woods","forest","rainforest","swamp","grassland","taiga","tundra","mountains","snowpeaks","ice"]
	    },
		resources:{},
		terrain:{},
		unitTypes:{},
		actions:{}
	}
};

function setParams(){
	c.params.resources.food = new Resource("Food",true,0);
	c.params.resources.wood = new Resource("Wood",true,30);
	c.params.resources.stone = new Resource("Stone",true,60);
	c.params.resources.skins = new Resource("Skins",false,90);
	c.params.resources.herbs = new Resource("Herbs",false,120);
	c.params.resources.ore = new Resource("Ore",false,150);
	c.params.resources.leather = new Resource("Leather",false,180);
	c.params.resources.piety = new Resource("Piety",false,210);
	c.params.resources.metal = new Resource("Metal",false,240);
	c.params.resources.gold = new Resource("Gold",false,270);
	
	c.params.terrain.ocean = new Terrain("Ocean", [0,0,255], 1, 0, 0, false);
	c.params.terrain.ice = new Terrain("Ice", [30,144,255], 0, 0, 0, false);
	c.params.terrain.desert = new Terrain("Desert", [255,255,0], 0, 0, 0, true);
	c.params.terrain.savannah = new Terrain("Savannah", [154,205,50], 1, 0, 0, true);
	c.params.terrain.woods = new Terrain("Woods", [73,128,0], 0, 1, 0, true);
	c.params.terrain.forest = new Terrain("Forest", [0,128,0], 0, 1, 0, true);
	c.params.terrain.rainforest = new Terrain("Rainforest", [0,84,0], 1, 1, 0, true);
	c.params.terrain.swamp = new Terrain("Swamp", [127,82,93], 0, 0, 0, true);
	c.params.terrain.grassland = new Terrain("Grassland", [50,205,50], 1, 0, 0, true);
	c.params.terrain.taiga = new Terrain("Taiga", [0,128,0], 0, 1, 0, true);
	c.params.terrain.tundra = new Terrain("Tundra", [245,255,250], 0, 0, 0, true);
	c.params.terrain.mountains = new Terrain("Mountains", [128,128,128], 0, 0, 1, true);
	c.params.terrain.snowpeaks = new Terrain("Snowcapped Mountains", [160,160,160], 0, 0, 1, true);
	
	//c.params.terrain.river = new Terrain("River", 2, 0, 0);
	//c.params.terrain.lake = new Terrain("Lake", 1, 0, 0);
	
	//c.params.terrain.ashwastes = new Terrain("Ash Wastes",0,0,0);
	//c.params.terrain.obsidianplains = new Terrain("Obsidian Plains",0,0,0);
	//c.params.terrain.icespires = new Terrain("Ice Spires",0,0,0);
	//c.params.terrain.lava = new Terrain("Lava",0,0,0);
	//c.params.terrain.brimstonepits = new Terrain("Brimstone Pits",0,0,0);
	//c.params.terrain.abyss = new Terrain("Abyss",0,0,0);
	//c.params.terrain.deadlands = new Terrain("Deadlands",0,0,0);
	//c.params.terrain.bloodocean = new Terrain("Blood Ocean",0,0,0);
	//c.params.terrain.saltflats = new Terrain("Salt Flats",0,0,0);
	//c.params.terrain.charnelfields = new Terrain("Charnel Fields",0,0,0);
	//c.params.terrain.shadowrealm = new Terrain("Shadow Realm",0,0,0);
	//c.params.terrain.boneyard = new Terrain("Boneyard",0,0,0);
	//c.params.terrain.twistedland = new Terrain("Twisted Lands",0,0,0);
	//c.params.terrain.ruins = new Terrain("Ruins",0,0,0);
	
	c.params.unitTypes.settler = new UnitType("Settler",{},c.params.arrays.land,["settle"]);
	c.params.unitTypes.worker = new UnitType("Worker",{},c.params.arrays.land,[]);
	c.params.unitTypes.explorer = new UnitType("Explorer",{},c.params.arrays.land,[]);
	c.params.unitTypes.soldier = new UnitType("Soldier",{},c.params.arrays.land,[]);
	c.params.unitTypes.boat = new UnitType("Boat",{},["ocean"],["unload"]);
	
	c.params.actions.settle = new SelectedAction("Found City",false,function(){
        if (c.params.terrain[c.world.map.grid[c.selected.location.y][c.selected.location.x].terrain].foundable){
            if (!c.world.map.grid[c.selected.location.y][c.selected.location.x].containsCity){
                var name = prompt("Name your city");
                if (name){
					var city = new City(c.selected.civilisation);
                    c.world.civilisations[c.selected.civilisation].cities.push(city);
                    foundCity(c.world.civilisations[c.selected.civilisation],city,name,c.selected,c.selected.location.y,c.selected.location.x);
                    select(city);
                }
            }
        }
	});
	c.params.actions.unload = new SelectedAction("Unload",function(){
		return c.selected.containsUnit;
	},function(){
	    if (c.selected.containsUnit){
    	    var currentY = c.selected.location.y;
    	    var currentX = c.selected.location.x;
            var from = c.selected;
    	    select(c.selected.containsUnit);
    	    c.selected.location = {
    	        y:currentY,
    	        x:currentX
    	    };
	    }
	});
	c.params.actions.createSettler = new SelectedAction("Build Settler",false,function(){
	    createUnitForCiv(c.selected.civilisation,"settler",c.selected.location.y,c.selected.location.x);
	});
	c.params.actions.createBoat = new SelectedAction("Build Boat",false,function(){
		createUnitForCiv(c.selected.civilisation,"boat",c.selected.location.y,c.selected.location.x);
	});
	c.params.actions.createWorker = new SelectedAction("Build Worker",false,function(){
	    createUnitForCiv(c.selected.civilisation,"worker",c.selected.location.y,c.selected.location.x);
	});
	c.params.actions.expandBorders = new SelectedAction("Expand Borders",false,function(){
	   if (c.world.civilisations[c.selected.civilisation].resources.food >= Math.pow(100,c.selected.borders)){
	       c.world.civilisations[c.selected.civilisation].resources.food -= Math.floor(Math.pow(100,c.selected.borders));
	       c.selected.borders++;
	       for (var i=0-c.selected.borders; i<c.selected.borders+1; i++){
	           for (var j=0-c.selected.borders; j<c.selected.borders+1; j++){
	               if (Math.sqrt(Math.pow(i,2)+Math.pow(j,2)) <= c.selected.borders + 0.5){
	                   c.world.map.grid[c.selected.location.y + i][c.selected.location.x + j].owned = c.selected.civilisation;
	                   explore(c.selected.location.y + i,c.selected.location.x + j);
	               }
	           }
	       }
	   }
	});
}

//Constructors
function Resource(en,active,xOffset){
	this.name = {
		en:en
	};
	this.active = active;
}
function Terrain(en,color,pfood,pwood,pstone,foundable){
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
}
function UnitType(en,cost,traverse,actions){
    this.name = {
        en:en
    }
    this.cost = cost;
    this.traverse = traverse;
    this.actions = actions;
}
function SelectedAction(name,condition,call){
	this.name = name;
	this.condition = condition;
    this.call = call;
}

function World(){
}
function Map(){
	this.grid = [];
	this.startingLocs = [];
}
function MapSquare(y,x){
	this.moveMod = 1;
	this.defMod = 1;
	this.explored = false;
	this.owned = -1;
	this.containsCity = false;
	this.containsUnit = false;
	
	this.improvements = {};
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
	for (var resource in c.params.resources){
        this.resources[resource] = 0;
	}
	this.cities = [];
	this.units = [];
	this.techs = [];
	
	this.startingLocation = c.world.map.startingLocs[Math.floor(random() * c.world.map.startingLocs.length)];
	this.units.push(new Unit(index,"settler",this.startingLocation[0],this.startingLocation[1]));
	if (isPlayer){
    	explore(this.startingLocation[0]+1,this.startingLocation[1]);
    	explore(this.startingLocation[0]-1,this.startingLocation[1]);
    	explore(this.startingLocation[0],this.startingLocation[1]+1);
    	explore(this.startingLocation[0],this.startingLocation[1]-1);
    	select(this.units[0]);
	}
}
function Tech(){
	this.requires = "";
}
function City(civ){
	this.civilisation = civ;
	this.interfaceActions = ["createSettler","createBoat","createWorker","expandBorders"];
}

function Production(){
	this.type = "";
	this.requires = "";
	this.cost = "";
	this.progress = "";
}

function Building(){
	this.value = 0;
	this.cost = [];
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
	this.containsUnit = false;
	
	c.world.map.grid[y][x].containsUnit = this;
}