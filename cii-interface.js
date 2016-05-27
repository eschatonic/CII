//Interface constructor
function Interface($container){
    var i = document.createElement("div");
    i.id = "interface";
    $container[0].appendChild(i);
	var $interface = $('#interface');

	$interface
		.width(c.settings.interfaceWidth)
		.height(c.settings.mapY * c.settings.squareSize);

	$interface.append("<div id='tab-container'></div>");
	var $tabContainer = $('#tab-container');

	$tabContainer.append("<div class='tab tab-selected' id='tab-game'>Game</div>")
		.append("<div class='tab' id='tab-options'>Options</div>")
		.append("<div class='tab' id='tab-about'>About</div>");

	$interface.append("<div id='pane-game' class='pane pane-selected'></div>")
		.append("<div id='pane-options' class='pane'></div>")
		.append("<div id='pane-about' class='pane'></div>");
	
	var tabWidth = c.settings.interfaceWidth / document.getElementsByClassName("tab").length;
	$('.tab').css("width",tabWidth + "px");

	var $paneGame = $('#pane-game');
	var $paneOptions = $('#pane-options');
	var $paneAbout = $('#pane-about');

	$paneGame.append("<table class='resources'></table>")
		.append("<div class='focus'></div>")
		.append("<div class='selected'></div>");
	
	$paneOptions.append("<div>&nbsp;</div>")
		.append("<div><button onclick='saveGame(\"manual\")'>Save</button>&nbsp;<button id='autosaveToggle' onclick='toggleAutosave()'>" + (c.player.disableAutosave ? "Enable" : "Disable") + " Autosave</button>&nbsp;<button onclick='deleteSave()'>Delete Save</button>")
		.append("<div id='impExp'></div>")
		.append("<div>&nbsp;</div>")
		.append("<div>Seed: " + c.player.seed + "</div>");

	var impExp = $('#impExp');

	impExp.append('<textarea id="impExpField"></textarea>')
		.append('<button class="export" onclick="saveGame(\'export\');">Export Save</button>')
		.append('<button class="import" onclick="loadGame(\'import\');">Import Save</button>');

	var year = new Date().getFullYear();
	$paneAbout.append("<h1>CivClicker II</h1><div>&copy;" + year + " David Stark</div>")
		.append("<div>version " + c.version + "</div>")
		.append("<div>&nbsp;</div>")
		.append("<div><s><a href=''>Frequently Asked Questions</a></s></div>")
		.append("<div><s><a href=''>Latest Updates</a></s></div>")
		.append("<div><a href='https://www.passle.net/p/2fkw/civclicker-ii-development-blog'>Development Blog</a></div>")
		.append("<div><a href='https://trello.com/b/eWHaPNWU/civclicker-ii'>Development Roadmap</a></div>")
		.append("<div>&nbsp;</div>")
		.append("<div><a href='http://www.reddit.com/r/civclicker'>/r/CivClicker</a></div>")
		.append("<div><a href='http://civ-clicker.wikia.com/wiki/Civ_Clicker_Wiki'>Unofficial Wiki</a></div>");

	this.settings = {
		zoomLevel:1,
		gridFocusX:0,
		gridFocusY:0
	};
	this.particles = [];
	
    var clearfix = document.createElement("div");
    clearfix.className = "clearfix";
    document.body.appendChild(clearfix);
    
	for (var resource in c.params.resources){
		if (!c.params.resources[resource].active && c.world.civilisations[0].resources[resource] > 0) c.params.resources[resource].active = true;
	}
	
    this.update = function(updateSelected){
        
        //resources
        var strResources = "";
        for (var resource in c.params.resources){
			if (c.params.resources[resource].active){
				strResources += "<tr class='resource'><td class='resource-name'>";
				strResources += c.params.resources[resource].name.en;
				strResources += ": </td><td class='resource-value'>";
				//strResources += prettify(c.world.civilisations[0].resources[resource]);
				strResources += prettify(sumResource(0,resource));
				strResources += "</td><td class='resource-icon'>";
				strResources += "<span class='icon-" + resource + "'></span>";
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
                    focus += "<div>" + c.world.civilisations[c.settings.focus.containsCity.civilisation].name + " - " + c.settings.focus.containsCity.name + "</div>";
                }
                if (c.settings.focus.containsUnit.length > 0){
                    for (var unit in c.settings.focus.containsUnit){
						focus += "<div style='margin-top:10px'>" + c.world.civilisations[c.settings.focus.containsUnit[unit].civilisation].name + " - " + c.params.unitTypes[c.settings.focus.containsUnit[unit].unitType].name.en + "</div>";
					}
                }
            }
        }
        $('.focus').html(focus);
        
        //selected (only updates when necessary, because this contains actual controls)
        if (updateSelected){
            var selectedStr = "";
            if (c.selected){
                var civ = c.world.civilisations[c.selected.civilisation];
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

	bindInterfaceEvents();
}

//Input
function checkInput(){
    if (c.ui.mouseX < c.settings.mapX * c.settings.squareSize){
        if (c.ui.mouseY < (c.settings.mapY) * c.settings.squareSize){
			var squareY = Math.floor((c.ui.mouseY + (c.ui.settings.gridFocusY * c.settings.squareSize * c.ui.settings.zoomLevel))/(c.settings.squareSize * c.ui.settings.zoomLevel));
			var squareX = Math.floor((c.ui.mouseX + (c.ui.settings.gridFocusX * c.settings.squareSize * c.ui.settings.zoomLevel))/(c.settings.squareSize * c.ui.settings.zoomLevel));
            if (squareY <= c.settings.mapY && squareX <= c.settings.mapX){
				c.settings.focus = c.world.map.grid[squareY][squareX];
			} else {
				c.settings.focus = false;
			}
        }
    }
}

function bindInterfaceEvents() {
	$(document).off("mousemove").on("mousemove", function (evt) {
		if (c.ui) {
			c.ui.mouseX = evt.pageX;
			c.ui.mouseY = evt.pageY;
		}
	});

	$(document).off("click").on("click", function (evt) {
		if (evt.target.className === "tab") {
			//change selected tab
			$('.tab.tab-selected').removeClass('tab-selected');
			evt.target.className = 'tab tab-selected';
			//change selected pane
			$('.pane.pane-selected').removeClass('pane-selected');
			var targetPaneId = "#pane-" + evt.target.id.split("-")[1];
			$(targetPaneId).addClass('pane-selected');
		} else if (c.ui.mouseX < c.settings.mapX * c.settings.squareSize) {
			if (c.ui.mouseY < c.settings.mapY * c.settings.squareSize) {
				canvasClick();
			}
		}
	});
	$(document).off("keydown").on("keydown", function (evt) {
		if (evt.keyCode === UP_ARROW) {
			if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected, -1, 0, c.selected.hidden);
		} else if (evt.keyCode === DOWN_ARROW) {
			if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected, 1, 0, c.selected.hidden);
		} else if (evt.keyCode === LEFT_ARROW) {
			if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected, 0, -1, c.selected.hidden);
		} else if (evt.keyCode === RIGHT_ARROW) {
			if (typeof c.selected.unitType !== "undefined") moveUnit(c.selected, 0, 1, c.selected.hidden);
		} else if (evt.keyCode === RETURN) {
		}
		c.ui.update(true);
	});

	$(document).off("DOMMouseScroll").on("DOMMouseScroll", mouseWheel); //firefox
	$(document).off("mousewheel").on("mousewheel", mouseWheel); //chrome

}
function mouseWheel(evt){
	var wheelDelta = (evt.wheelDelta) ? evt.wheelDelta : evt.detail * -1;
	
	var squareY = Math.floor((evt.clientY + (c.ui.settings.gridFocusY * c.settings.squareSize * c.ui.settings.zoomLevel))/(c.settings.squareSize * c.ui.settings.zoomLevel));
	var squareX = Math.floor((evt.clientX + (c.ui.settings.gridFocusX * c.settings.squareSize * c.ui.settings.zoomLevel))/(c.settings.squareSize * c.ui.settings.zoomLevel));
	
	if (wheelDelta > 0){
		c.ui.settings.zoomLevel += 0.5;
		if (c.ui.settings.zoomLevel > 3){
			c.ui.settings.zoomLevel = 3;
			return false;
		}
	} else {
		c.ui.settings.zoomLevel -= 0.5;
		if (c.ui.settings.zoomLevel < 1){
			c.ui.settings.zoomLevel = 1;
			return false;
		}
	}
	focus(squareY,squareX);
}

function focus(squareY,squareX){
	var width = c.settings.mapX / c.ui.settings.zoomLevel;
	var height = c.settings.mapY / c.ui.settings.zoomLevel;
	var offsetX = squareX - (width/2);
	var offsetY = squareY - (height/2);
	if (offsetX < 0) offsetX = 0;
	if (offsetY < 0) offsetY = 0;
	if (offsetX > c.settings.mapX - width) offsetX = c.settings.mapX - width;
	if (offsetY > c.settings.mapY - height) offsetY = c.settings.mapY - height;
	
	c.ui.settings.gridFocusY = Math.floor(offsetY);
	c.ui.settings.gridFocusX = Math.floor(offsetX);
}

function canvasClick(){
	var squareY = Math.floor((c.ui.mouseY + (c.ui.settings.gridFocusY * c.settings.squareSize * c.ui.settings.zoomLevel))/(c.settings.squareSize * c.ui.settings.zoomLevel));
	var squareX = Math.floor((c.ui.mouseX + (c.ui.settings.gridFocusX * c.settings.squareSize * c.ui.settings.zoomLevel))/(c.settings.squareSize * c.ui.settings.zoomLevel));
	//if there is a unit or a city
	if (c.world.map.grid[squareY][squareX].containsUnit.length > 0 || c.world.map.grid[squareY][squareX].containsCity) {
		//first attempt to cycle to the next unit
		var selectedIndex = c.world.map.grid[squareY][squareX].containsUnit.indexOf(c.selected) + 1; //will return -1 unless one of the units is already selected, meaning that it defaults to the first unit in the array
		//next check if we're past the end of the unit list
		if (selectedIndex >= c.world.map.grid[squareY][squareX].containsUnit.length){
			//if so, attempt to select a city
			if (c.world.map.grid[squareY][squareX].containsCity){
				select(c.world.map.grid[squareY][squareX].containsCity);
			} else {
				// if not, select the first unit again
				select(c.world.map.grid[squareY][squareX].containsUnit[0])
			}
		} else {
			//we're not past the end of the list so just go ahead and select that unit
			select(c.world.map.grid[squareY][squareX].containsUnit[selectedIndex])
		}
	} else {
		//you clicked on open land!
		select(false);
		if (c.world.map.grid[squareY][squareX].explored){
			for (var resource in c.params.terrain[c.world.map.grid[squareY][squareX].terrain].production){
				produceResourcesFor([squareY,squareX],c.world.map.grid[squareY][squareX].terrain,resource,c.params.terrain[c.world.map.grid[squareY][squareX].terrain].production[resource],true,0);
				//disabling for now because it's resource intensive and the draw functions are not yet implemented
				//if (c.params.terrain[c.world.map.grid[squareY][squareX].terrain].production[resource] > 0) c.ui.particles.push(new Particle(c.params.resources[resource].url,c.ui.mouseY,c.ui.mouseX,120));
			}

		}
	}
}

function select(obj){
    c.selected = obj;
    if (c.ui) c.ui.update(true);
	if (obj && c.ui) focus(c.selected.location.y,c.selected.location.x);
}