//Interface constructor
function Interface(){
    var interface = document.createElement("div");
    interface.id = "interface";
    document.body.appendChild(interface);
    $('#interface').width(c.settings.interfaceWidth);
    $('#interface').height(c.settings.mapY * c.settings.squareSize);
	
	$('#interface').append("<div id='tab-container'></div>");
	
	$('#tab-container').append("<div class='tab tab-selected' id='tab-game'>Game</div>");
	$('#tab-container').append("<div class='tab' id='tab-options'>Options</div>");
	$('#tab-container').append("<div class='tab' id='tab-about'>About</div>");
	
	$('#interface').append("<div id='pane-game' class='pane pane-selected'></div>");
	$('#interface').append("<div id='pane-options' class='pane'></div>");
	$('#interface').append("<div id='pane-about' class='pane'></div>");
	
	var tabWidth = c.settings.interfaceWidth / document.getElementsByClassName("tab").length;
	$('.tab').css("width",tabWidth + "px");
	
	$('#pane-game').append("<table class='resources'></table>");
    $('#pane-game').append("<div class='focus'></div>");
    $('#pane-game').append("<div class='selected'></div>");
	
	$('#pane-options').append("<div>&nbsp;</div>");
	$('#pane-options').append("<div><button onclick='saveGame(\"manual\")'>Save</button>&nbsp;<button onclick='deleteSave()'>Delete Save</button>");
	$('#pane-options').append("<div id='impExp'></div>");
	$('#pane-options').append("<div>&nbsp;</div>");
	$('#pane-options').append("<div>Seed: " + c.player.seed + "</div>");
	
	$('#impExp').append('<textarea id="impExpField"></textarea>');
	$('#impExp').append('<button class="export" onclick="saveGame(\'export\');">Export Save</button>');
	$('#impExp').append('<button class="import" onclick="loadGame(\'import\');">Import Save</button>');
    
	$('#pane-about').append("<h1>CivClicker II</h1><div>&copy;2014 dhmholley</div>");
	$('#pane-about').append("<div>version " + c.version + "</div>");
	$('#pane-about').append("<div>&nbsp;</div>");
	$('#pane-about').append("<div><s><a href=''>Frequently Asked Questions</a></s></div>");
	$('#pane-about').append("<div><s><a href=''>Latest Updates</a></s></div>");
	$('#pane-about').append("<div><a href='https://www.passle.net/p/2fkw/civclicker-ii-development-blog'>Development Blog</a></div>");
	$('#pane-about').append("<div><a href='https://trello.com/b/eWHaPNWU/civclicker-ii'>Development Roadmap</a></div>");
	$('#pane-about').append("<div>&nbsp;</div>");
	$('#pane-about').append("<div><a href='http://www.reddit.com/r/civclicker'>/r/CivClicker</a></div>");
	$('#pane-about').append("<div><a href='http://civ-clicker.wikia.com/wiki/Civ_Clicker_Wiki'>Unofficial Wiki</a></div>");
	$('#pane-about').append("<div>&nbsp;</div>");
	$('#pane-about').append("<div><a href='http://dhmholley.co.uk/civclicker.html'>CivClicker Classic</a></div>");
	
	this.settings = {
		zoomLevel:1,
		gridFocusX:0,
		gridFocusY:0
	};
	
    var clearfix = document.createElement("div");
    clearfix.className = "clearfix";
    document.body.appendChild(clearfix);
    
    this.update = function(updateSelected){
        
        //resources
        var strResources = "";
        for (var resource in c.params.resources){
			if (c.params.resources[resource].active){
				strResources += "<tr class='resource'><td class='resource-name'>";
				strResources += c.params.resources[resource].name.en;
				strResources += ": </td><td class='resource-value'>"
				strResources += prettify(c.world.civilisations[0].resources[resource]);
				strResources += "</td><td class='resource-icon'>";
				strResources += "<span class='icon-" + resource + "'></span>"
				strResources += "</td></tr>"
			}
        }
        $('.resources').html(strResources);
        
        //focus
        var focus = "";
        if (c.settings.focus){
            if (c.settings.focus.explored){
                focus += "<div>" + c.params.terrain[c.settings.focus.terrain].name.en + "</div>";
				focus += "<table><tr class='resource-icon'><td>" + c.params.terrain[c.settings.focus.terrain].production.food + "</td><td><span class='icon-food'></span></td><td>" + c.params.terrain[c.settings.focus.terrain].production.wood + "</td><td><span class='icon-wood'></span></td><td>" + c.params.terrain[c.settings.focus.terrain].production.stone + "</td><td><span class='icon-stone'></span></td>" + "</tr></table>";
				for (var improvement in c.settings.focus.improvements){
					focus += "<span>[" + c.params.improvements[c.settings.focus.improvements[improvement]].name.en + "] </span>";
				}
                if (c.settings.focus.containsCity){
                    focus += "<div>" + c.world.civilisations[c.settings.focus.containsCity.civilisation].name + " - " + c.settings.focus.containsCity.name + "</div";
                }
                if (c.settings.focus.containsUnit){
                    var unit = c.settings.focus.containsUnit;
                    focus += "<div style='margin-top:10px'>" + c.world.civilisations[unit.civilisation].name + " - " + c.params.unitTypes[unit.unitType].name.en + "</div";
                }
            }
        }
        $('.focus').html(focus);
        
        //selected (only updates when necessary, because this contains actual controls)
        if (updateSelected){
            var selectedStr = ""
            if (c.selected){
                var civ = c.world.civilisations[c.selected.civilisation]
                var name = c.selected.unitType ? c.params.unitTypes[c.selected.unitType].name.en : c.selected.name;
                selectedStr += "<div>" + civ.name + " - " + name + "</div>";
				selectedStr += "<div>" + c.params.terrain[c.world.map.grid[c.selected.location.y][c.selected.location.x].terrain].name.en + "</div>";
				for (var improvement in c.world.map.grid[c.selected.location.y][c.selected.location.x].improvements){
					selectedStr += "<div>&lt;" + c.params.improvements[c.world.map.grid[c.selected.location.y][c.selected.location.x].improvements[improvement]].name.en + "&gt;</div>"
				}
                selectedStr += "<div class='actions'>";
                for (var i=0,j=c.selected.interfaceActions.length; i<j; i++){
					if (c.params.actions[c.selected.interfaceActions[i]].condition === false || c.params.actions[c.selected.interfaceActions[i]].condition()){
						selectedStr += "<div class='action'>";
						selectedStr += "<button id='selected" + i + "'>" + c.params.actions[c.selected.interfaceActions[i]].name + "</button>";
						if (c.params.actions[c.selected.interfaceActions[i]].cost){
							selectedStr += "<span class='cost'> (" + costToString(c.params.actions[c.selected.interfaceActions[i]].cost) + ")</span>";
						}
						selectedStr += "</div>";
					}
                }
                selectedStr += "</div>";
            } else {
                selectedStr += "<div>No selection</div>";
            }
            $('.selected').html(selectedStr);
            if (c.selected.interfaceActions){
                for (var i=0,j=c.selected.interfaceActions.length; i<j; i++){
                    $('#selected' + i).click(c.params.actions[c.selected.interfaceActions[i]].call);
                }
            }
        }
    };
}

//drawing
function drawMap(map,gridFocusY,gridFocusX){
	//focus defaults
	if (!gridFocusX) gridFocusX = 0;
	if (!gridFocusY) gridFocusY = 0;
	
	for (var y=0; y<c.settings.mapY; y++){
		for (var x=0; x<c.settings.mapX; x++){
			if (map.grid[y][x].explored){
				var terrain = map.grid[y][x].terrain;
				fill(c.params.terrain[terrain].color.red, c.params.terrain[terrain].color.green, c.params.terrain[terrain].color.blue);
				rect(c.settings.squareSize * (x - c.interface.settings.gridFocusX) * c.interface.settings.zoomLevel, c.settings.squareSize * (y - c.interface.settings.gridFocusY) * c.interface.settings.zoomLevel, c.settings.squareSize * c.interface.settings.zoomLevel, c.settings.squareSize * c.interface.settings.zoomLevel);
				if (map.grid[y][x].owned >= 0) drawBorders(y,x);
			}
		}
	}
}
function drawBorders(y,x){
    var owner = c.world.map.grid[y][x].owned;
    stroke(c.world.civilisations[owner].color.red,c.world.civilisations[owner].color.green,c.world.civilisations[owner].color.blue);
    if (c.world.map.grid[getTargetY(y-1)][getTargetX(x)].owned != owner) line(
		((x-c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y-c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((x + 1 - c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y-c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel
	);
    if (c.world.map.grid[getTargetY(y+1)][getTargetX(x)].owned != owner) line(
		((x-c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y + 1 - c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((x + 1 - c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y + 1 - c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel
	);
    if (c.world.map.grid[getTargetY(y)][getTargetX(x-1)].owned != owner) line(
		((x-c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y-c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((x-c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y + 1 - c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel
	);
    if (c.world.map.grid[getTargetY(y)][getTargetX(x+1)].owned != owner) line(
		((x + 1 - c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y-c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((x + 1 - c.interface.settings.gridFocusX)*c.settings.squareSize)*c.interface.settings.zoomLevel,
		((y + 1 - c.interface.settings.gridFocusY)*c.settings.squareSize)*c.interface.settings.zoomLevel
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
		textStyle(BOLD);
		textSize(20);
		fill(color.red,color.green,color.blue);
		text(
			city.name,
			((c.settings.squareSize) * (x + 0.5 - c.interface.settings.gridFocusX)) * c.interface.settings.zoomLevel,
			((c.settings.squareSize) * (y - 0.3 - c.interface.settings.gridFocusY)) * c.interface.settings.zoomLevel
		)
		rect(
			(x-c.interface.settings.gridFocusX)*c.settings.squareSize*c.interface.settings.zoomLevel,
			(y-c.interface.settings.gridFocusY)*c.settings.squareSize*c.interface.settings.zoomLevel,
			c.settings.squareSize * c.interface.settings.zoomLevel,
			c.settings.squareSize * c.interface.settings.zoomLevel
		);
		textAlign("left");
		textStyle(NORMAL);
	}
}
function drawUnit(unit,color){
	if (!unit.hidden) {
		fill(color.red,color.green,color.blue);
		ellipse(
			(unit.location.x-c.interface.settings.gridFocusX)*c.settings.squareSize*c.interface.settings.zoomLevel + c.settings.squareSize*c.interface.settings.zoomLevel/2,
			(unit.location.y-c.interface.settings.gridFocusY)*c.settings.squareSize*c.interface.settings.zoomLevel + c.settings.squareSize*c.interface.settings.zoomLevel/2,
			c.settings.squareSize*c.interface.settings.zoomLevel - 4,
			c.settings.squareSize*c.interface.settings.zoomLevel - 4
		);
	}
}

//Input
function checkInput(){
    if (mouseX < c.settings.mapX * c.settings.squareSize){
        if (mouseY < (c.settings.mapY) * c.settings.squareSize){
			var squareY = Math.floor((mouseY + (c.interface.settings.gridFocusY * c.settings.squareSize * c.interface.settings.zoomLevel))/(c.settings.squareSize * c.interface.settings.zoomLevel));
			var squareX = Math.floor((mouseX + (c.interface.settings.gridFocusX * c.settings.squareSize * c.interface.settings.zoomLevel))/(c.settings.squareSize * c.interface.settings.zoomLevel));
            if (squareY <= c.settings.mapY && squareX <= c.settings.mapX){
				c.settings.focus = c.world.map.grid[squareY][squareX];
			} else {
				c.settings.focus = false;
			}
        }
    }
}
function mouseClicked(evt){

	if (mouseButton == 'left'){
		if (evt.target.className === "tab"){
			//change selected tab
			$('.tab.tab-selected').removeClass('tab-selected');
			evt.target.className = 'tab tab-selected';
			//change selected pane
			$('.pane.pane-selected').removeClass('pane-selected');
			targetPaneId = "#pane-" + evt.target.id.split("-")[1];
			$(targetPaneId).addClass('pane-selected');
		} else if (mouseX < c.settings.mapX * c.settings.squareSize){
			if (mouseY < c.settings.mapY * c.settings.squareSize){
				var squareY = Math.floor((mouseY + (c.interface.settings.gridFocusY * c.settings.squareSize * c.interface.settings.zoomLevel))/(c.settings.squareSize * c.interface.settings.zoomLevel));
				var squareX = Math.floor((mouseX + (c.interface.settings.gridFocusX * c.settings.squareSize * c.interface.settings.zoomLevel))/(c.settings.squareSize * c.interface.settings.zoomLevel));
				if (c.world.map.grid[squareY][squareX].containsUnit && c.world.map.grid[squareY][squareX].containsUnit != c.selected) {
					//unit context menu
					select(c.world.map.grid[squareY][squareX].containsUnit)
				} else if (c.world.map.grid[squareY][squareX].containsCity){
					//city context menu
					select(c.world.map.grid[squareY][squareX].containsCity);
				} else {
					//open land
					select(false);
					if (c.world.map.grid[squareY][squareX].explored){
						for (var resource in c.params.terrain[c.world.map.grid[squareY][squareX].terrain].production){
							c.world.civilisations[0].resources[resource] += c.params.terrain[c.world.map.grid[squareY][squareX].terrain].production[resource];
						}
					}
					//explore(squareY,squareX);
				}
			}
		}
	}
}
function keyPressed() {
    if (keyCode === UP_ARROW) {
        if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected,-1,0,c.selected.hidden);
    } else if (keyCode === DOWN_ARROW) {    
        if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected,1,0,c.selected.hidden);
    } else if (keyCode === LEFT_ARROW) {
        if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected,0,-1,c.selected.hidden);
    } else if (keyCode === RIGHT_ARROW) {
        if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected,0,1,c.selected.hidden);
    } else if (keyCode === RETURN) {}
	c.interface.update(true);
}

document.addEventListener("DOMMouseScroll",mouseWheel,false); //firefox
function mouseWheel(evt){
	var wheelDelta = (evt.wheelDelta) ? evt.wheelDelta : evt.detail * -1;
	
	var squareY = Math.floor((evt.clientY + (c.interface.settings.gridFocusY * c.settings.squareSize * c.interface.settings.zoomLevel))/(c.settings.squareSize * c.interface.settings.zoomLevel));
	var squareX = Math.floor((evt.clientX + (c.interface.settings.gridFocusX * c.settings.squareSize * c.interface.settings.zoomLevel))/(c.settings.squareSize * c.interface.settings.zoomLevel));
	
	if (wheelDelta > 0){
		c.interface.settings.zoomLevel += 0.5;
		if (c.interface.settings.zoomLevel > 3){
			c.interface.settings.zoomLevel = 3;
			return false;
		}
	} else {
		c.interface.settings.zoomLevel -= 0.5;
		if (c.interface.settings.zoomLevel < 1){
			c.interface.settings.zoomLevel = 1;
			return false;
		}
	}
	
	var width = c.settings.mapX / c.interface.settings.zoomLevel;
	var height = c.settings.mapY / c.interface.settings.zoomLevel;
	var offsetX = squareX - (width/2);
	var offsetY = squareY - (height/2);
	if (offsetX < 0) offsetX = 0;
	if (offsetY < 0) offsetY = 0;
	
	c.interface.settings.gridFocusY = Math.floor(offsetY);
	c.interface.settings.gridFocusX = Math.floor(offsetX);
}

function select(obj){
    c.selected = obj;
    if (c.interface) c.interface.update(true);
}