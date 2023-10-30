"use strict";
// ** FRONT END **
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Sprite = /** @class */ (function () {
    function Sprite(id, name, x, y, image_url, update_method, onclick_method) {
        this.dest_x = 0;
        this.dest_y = 0;
        this.id = id; // read line 7 ^
        this.name = name;
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.image = new Image();
        this.image.src = image_url;
        this.update = update_method;
        this.onclick = onclick_method;
        this.dest_x = 250;
        this.dest_y = 250;
    }
    Sprite.prototype.set_destination = function (x, y) {
        this.dest_x = x;
        this.dest_y = y;
    };
    Sprite.prototype.ignore_click = function (x, y) {
    };
    Sprite.prototype.move = function (dx, dy) {
        this.dest_x = this.x + dx;
        this.dest_y = this.y + dy;
    };
    Sprite.prototype.go_toward_destination = function () {
        if (this.dest_x === undefined)
            return;
        if (this.x < this.dest_x)
            this.x += Math.min(this.dest_x - this.x, this.speed);
        else if (this.x > this.dest_x)
            this.x -= Math.min(this.x - this.dest_x, this.speed);
        if (this.y < this.dest_y)
            this.y += Math.min(this.dest_y - this.y, this.speed);
        else if (this.y > this.dest_y)
            this.y -= Math.min(this.y - this.dest_y, this.speed);
    };
    Sprite.prototype.sit_still = function () {
    };
    return Sprite;
}());
// random_id method moved above Model so that it is recognized by model and sprites can be instantiated properly.
var random_id = function (len) {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var value = __spreadArray([], Array(len), true).reduce(function (a) { return a + p[Math.floor(Math.random() * p.length)]; }, '');
    console.log("random value = ".concat(value));
    console.trace();
    return value;
};
var g_id = random_id(12);
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        //this.sprites.push(new Sprite(random_id(12), 200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
        this.robot = new Sprite(g_id, name_, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination); // overide Sprite.prototype.go_toward_destination
        console.log("BLUE ROBOT ID: ".concat(this.robot.id));
        this.sprites.push(this.robot);
    }
    Model.prototype.update = function () {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.update();
        }
    };
    Model.prototype.onclick = function (x, y) {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.onclick(x + g_scroll_x, y + g_scroll_y, name_);
        }
    };
    Model.prototype.move = function (dx, dy) {
        this.robot.move(dx, dy);
    };
    Model.prototype.printMap = function (index, thingX, thingY) {
        this.sprites.push(new Sprite(("".concat(thing_names[index])), "", thingX, thingY, "".concat(thing_names[index], ".png"), Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
    };
    return Model;
}());
var View = /** @class */ (function () {
    function View(model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas"); // explicitly say that you are assigning it as type HTMLCanvasElement
        this.robot = new Image();
        this.robot.src = "blue_robot.png";
    }
    View.prototype.update = function () {
        var ctx = this.canvas.getContext("2d"); // adding '!' tells TypeSciprt that you are sure the value won't be NULL 
        g_scroll_x += scroll_rate * (this.model.robot.x - g_scroll_x - center_x);
        g_scroll_y += scroll_rate * (this.model.robot.y - g_scroll_y - center_y);
        ctx.clearRect(0, 0, 1000, 500); // clear canvas
        for (var _i = 0, _a = this.model.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            var adjustedX = sprite.x - g_scroll_x;
            var adjustedY = sprite.y - g_scroll_y;
            ctx.drawImage(sprite.image, adjustedX - sprite.image.width / 2, adjustedY - sprite.image.height);
            ctx.font = "20px Verdana"; // print the name
            ctx.fillText(sprite.name, adjustedX - sprite.image.width / 2, adjustedY - sprite.image.height - 10);
        }
    };
    return View;
}());
var Controller = /** @class */ (function () {
    function Controller(model, view) {
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        this.model = model;
        this.view = view;
        console.log("this.view: ".concat(this.view));
        var self = this;
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
    }
    Controller.prototype.onClick = function (event) {
        var _this = this;
        var x = event.pageX - this.view.canvas.offsetLeft;
        var y = event.pageY - this.view.canvas.offsetTop;
        this.model.onclick(x, y);
        var payload = {
            action: 'move',
            id: g_id,
            name: name_,
            x: x + g_scroll_x,
            y: y + g_scroll_y,
        }; // this is talking to the BACKEND (main.py.Update method), passing the payload, including action : click, to update the new x and y of the object from the backend
        httpPost('ajax.html', payload, function (ob) { return _this.onAcknowledgeClick(ob); }); // post request sent from main.ts (frontend, using AJAX) -> http_daemon (middle man) -> main.py (backend). 
        // BACKEND RESPONDS (sends back "status" : "success" [on 'click' request from frontend (in the form of a payload)] || "updates" : updates [on 'gu request from frontend (in the form of a payload)]) and frontend onAcknowledgeClick is CALLED 
    };
    Controller.prototype.keyDown = function (event) {
        if (event.keyCode == 39)
            this.key_right = true;
        else if (event.keyCode == 37)
            this.key_left = true;
        else if (event.keyCode == 38)
            this.key_up = true;
        else if (event.keyCode == 40)
            this.key_down = true;
    };
    Controller.prototype.keyUp = function (event) {
        if (event.keyCode == 39)
            this.key_right = false;
        else if (event.keyCode == 37)
            this.key_left = false;
        else if (event.keyCode == 38)
            this.key_up = false;
        else if (event.keyCode == 40)
            this.key_down = false;
    };
    Controller.prototype.update = function () {
        var dx = 0;
        var dy = 0;
        var speed = this.model.robot.speed;
        if (this.key_right)
            dx += speed;
        if (this.key_left)
            dx -= speed;
        if (this.key_up)
            dy -= speed;
        if (this.key_down)
            dy += speed;
        if (dx != 0 || dy != 0)
            this.model.move(dx, dy);
    };
    Controller.prototype.onAcknowledgeClick = function (ob) {
        console.log("Response to move: ".concat(JSON.stringify(ob))); // console log response from backend
        // add logic here to see if returned object from backend contains ('status' : 'success') -> TO NOTHING IF ITS A CLICK
        // elseif(returned object contains ("updates": updates)) -> {this.process_updates(updates)}
        if (ob.status === 'moved') {
            console.log("click action processed successfully!"); // from frontend to back end back to frontend
            //this.view.scroll();
        }
        else if (ob.updates) {
            console.log("update called: ".concat(ob.updates));
            //const updates = ob.updates;	
            this.process_updates(ob);
        }
        else {
            console.warn('Unexpected response from backend:', ob);
        }
    }; // logs response to console
    Controller.prototype.process_updates = function (ob) {
        var updates = ob.updates; // a list of 0 or more updates as described below
        var chats = ob.chats; // a list of 0 or more strings to add to the chat window
        this.updateChat(chats);
        var gold = ob.gold; // an int value describing how much gold the client has
        var banana = ob.banana; // an int value describing how many bananas the client has
        updateGoldBananas(banana, gold);
        console.log(updates);
        for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
            var update = updates_1[_i];
            var playerID = update.id;
            if (playerID === g_id) // updates should never move your robot
             {
                continue;
            }
            var playerName = update.name;
            var playerX = update.x;
            var playerY = update.y;
            this.updatePlayerPosition(playerID, playerName, playerX, playerY);
        } // iterate through each player update and add the x,y, and id updates (there should be no id updates) 
    };
    Controller.prototype.updatePlayerPosition = function (playerID, playerName, playerX, playerY) {
        //const player = this.model.sprites.find((sprite : Sprite) => sprite.id === playerID)! // ! to stop TS complaining about player possibly being 'undefined'
        var player = null; // initialize a player of type Sprite or null
        for (var i = 0; i < this.model.sprites.length; i++) {
            console.log("looking for  ".concat(playerID, " with name ").concat(playerName, ", this.model.sprites[i].id = ").concat(this.model.sprites[i].id));
            if (this.model.sprites[i].id === playerID) // player is found
             {
                player = this.model.sprites[i];
                console.log("found player = ".concat(JSON.stringify(player)));
                break; // exit loop once player is found
            }
        }
        if (player === null) // if player is not found, create a new sprite for them
         {
            console.log("not found player player = ".concat(player, " and playerID = ").concat(playerID));
            player = new Sprite(playerID, playerName, playerX, playerY, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click); // create a new instance of player with id, x, and y, green_robot, and default update() and onClick() methods
            console.log("player assigned = ".concat(player));
            this.model.sprites.push(player); // add new player to the sprites array
        } // we wanna change the update method of the green robots, but not the onClick method (only for blue robot: otherwise every robot will move and follow the blue robot)
        // updates player's position if it is found in the for loop
        player.set_destination(playerX, playerY);
    };
    Controller.prototype.updateChat = function (ob) {
    };
    Controller.prototype.onChat = function (message) {
        var payload = {
            action: 'chat',
            id: g_id,
            text: message,
        }; // this is talking to the BACKEND (main.py.Update method), passing the payload, including action : click, to update the new x and y of the object from the backend
        httpPost('ajax.html', payload, this.onAcknowledgeChat);
    };
    Controller.prototype.onAcknowledgeChat = function (ob) {
        console.log("message acknowledged. ".concat(JSON.stringify(ob)));
    };
    return Controller;
}());
var updateGoldBananas = function (banana, gold) {
    var goldElement = document.getElementById('gold');
    var bananasElement = document.getElementById('banana');
    var l = [];
    l.push('<div id="gold and bananas">');
    l.push('<br><big><big><b>');
    l.push('Gold: <span id="gold">gold</span>,');
    l.push('Bananas: <span id="bananas">banana</span>');
    l.push('</b></big></big><br>');
    l.push('</div>');
};
var Game = /** @class */ (function () {
    function Game(m) {
        this.last_updates_request_time = 0;
        this.model = m;
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }
    Game.prototype.onTimer = function () {
        // checks if one second has passed since the last update
        var time = Date.now();
        if (time - this.last_updates_request_time >= 1000) {
            this.last_updates_request_time = time; // sets the last update request time to curr time
            this.request_updates(); // sends a request for updates
        }
        // other game logic
        this.controller.update();
        this.model.update();
        this.view.update();
    };
    Game.prototype.request_updates = function () {
        var _this = this;
        var payload = {
            action: 'update',
            id: g_id
        };
        httpPost('ajax.html', payload, function (ob) { return _this.controller.onAcknowledgeClick(ob); });
    };
    return Game;
}());
///////////////////////////////////////////////////////// start
var name_ = ""; // global variable name_ refers to this.name_ (ie. the blue/YOUR robot)
var g_scroll_x = 0;
var g_scroll_y = 0;
var center_x = 500;
var center_y = 270;
var scroll_rate = 0.03;
// images of map. back end sends numbers (0 -> chair) and frontend parses through json to display the map on the screen.
var thing_names = [
    "chair",
    "lamp",
    "mushroom",
    "outhouse",
    "pillar",
    "pond",
    "rock",
    "statue",
    "tree",
    "turtle",
];
back_story();
var g_origin = new URL(window.location.href).origin;
// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
var httpPost = function (page_name, payload, callback) {
    var request = new XMLHttpRequest();
    // onreadystatechange: function within httpPost handler
    request.onreadystatechange = function () {
        if (request.readyState === 4) // server has replied
         {
            if (request.status === 200) // file found
             {
                var response_obj = void 0;
                try {
                    response_obj = JSON.parse(request.responseText);
                }
                catch (err) { }
                if (response_obj) {
                    callback(response_obj);
                }
                else {
                    callback({
                        status: 'error',
                        message: 'response is not valid JSON',
                        response: request.responseText,
                    });
                }
            }
            else {
                if (request.status === 0 && request.statusText.length === 0) {
                    callback({
                        status: 'error',
                        message: 'connection failed',
                    });
                }
                else {
                    callback({
                        status: 'error',
                        message: "server returned status ".concat(request.status, ": ").concat(request.statusText),
                    });
                }
            }
        }
    };
    request.open('post', "".concat(g_origin, "/").concat(page_name), true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(payload));
};
//const model = new Model(); // create model instance here to use it in onReceiveMap. also pass THIS model in the game instance when starting up (back_story)
function back_story() {
    var s = [];
    s.push("<canvas id=\"myCanvas\" width=\"1000\" height=\"500\" style=\"border:1px solid #ff0000;\">");
    s.push("</canvas>");
    s.push('<div id="nameInput">');
    s.push('<label for="userName">Enter your name: </label>');
    s.push('<input type="text" id="userName" placeholder="Your Name">');
    s.push('<button id="startGame">Start Game</button>');
    s.push('</div>');
    // s.push('<div id="gold and bananas">');
    // 	s.push('<br><big><big><b>');
    // 	s.push('Gold: <span id="gold">0</span>,');
    // 	s.push('Bananas: <span id="bananas">0</span>');
    // 	s.push('</b></big></big><br>');
    // s.push('</div>');
    // s.push('<div id="chat window">');
    // 	s.push('<br> <select id="chatWindow" size="8" style="width:1000px"></select> <br>');
    // 	s.push('<input type="input" id="chatMessage"></input>');
    // 	s.push('<button onclick="postChatMessage()">Post</button>');
    // s.push('</div>');
    var content = document.getElementById('content');
    content.innerHTML = s.join('');
    var startButton = document.getElementById('startGame');
    startButton.addEventListener('click', function () {
        var nameInput = document.getElementById('userName');
        //const story = document.getElementById('backStory');
        name_ = nameInput.value;
        console.log("Players name: ".concat(name_));
        // if (name_) {
        // turn off button, storyline
        startButton.style.display = 'none'; // removes the button
        nameInput.style.display = 'none'; // removes the text box
        // send a request to the back end to get the map.
        // requestMap();
        httpPost('ajax.html', {
            action: 'get_map',
        }, onReceiveMap);
        // add the get map from backend to parser
        function onReceiveMap(ob) {
            console.log("Map received from backend: ".concat(JSON.stringify(ob)));
            var map_array = ob.map;
            console.log("ob.map contains: ".concat(JSON.stringify(map_array)));
            var map_array_things = map_array.things; // ob.map.things
            console.log("ob.map.things contains... ".concat(JSON.stringify(map_array_things)));
            for (var _i = 0, map_array_things_1 = map_array_things; _i < map_array_things_1.length; _i++) {
                var thing = map_array_things_1[_i];
                var index = thing.kind;
                var thingX = thing.x;
                var thingY = thing.y;
                // console.log(`index: ${index}`);
                // console.log(`thingX: ${thingX}`);
                // console.log(`thingY: ${thingY}`);
                model.printMap(index, thingX, thingY); // access printMap with THIS model instance
            }
        }
        updateGoldBananas(0, 0);
        // start game
        var model = new Model();
        var game = new Game(model);
        var timer = setInterval(function () { game.onTimer(); }, 40);
        // }
        // else
        // {
        // 	alert('please enter your name');
        // }
    });
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext("2d");
    ctx.font = "25px Courier";
    ctx.fillText("Banana Quest!\n", 10, 50);
    ctx.font = "15px Courier";
    ctx.fillText("here is the backstory", 10, 50);
}
