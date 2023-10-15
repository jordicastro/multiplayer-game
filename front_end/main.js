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
    function Sprite(id, x, y, image_url, update_method, onclick_method) {
        this.dest_x = 0;
        this.dest_y = 0;
        this.id = id; // read line 7 ^
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.image = new Image();
        this.image.src = image_url;
        this.update = update_method;
        this.onclick = onclick_method;
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
    return __spreadArray([], Array(len), true).reduce(function (a) { return a + p[Math.floor(Math.random() * p.length)]; }, '');
};
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        this.sprites.push(new Sprite(random_id(12), 200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
        this.robot = new Sprite(random_id(12), 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        this.sprites.push(this.robot);
    }
    Model.prototype.update = function () {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.update();
        }
    };
    Model.prototype.onclick = function (x, y) {
        /*
        //  from frontend, not sure difference between Model.onclick & controller.onClick
        let payload = {
            mesage: 'howdi'
        }
        httpPost('ajax.html', payload, (response) => {
            console.log(`${JSON.stringify(response)})`);
        });

        */
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.onclick(x, y);
        }
    };
    Model.prototype.move = function (dx, dy) {
        this.robot.move(dx, dy);
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
        ctx.clearRect(0, 0, 1000, 500);
        for (var _i = 0, _a = this.model.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
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
        var self = this;
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
    }
    Controller.prototype.onClick = function (event) {
        var x = event.pageX - this.view.canvas.offsetLeft;
        var y = event.pageY - this.view.canvas.offsetTop;
        this.model.onclick(x, y);
        var payload = {
            id: g_id,
            action: 'click',
            x: x,
            y: y,
        }; // this is talking to the BACKEND (main.py.Update method), passing the payload, including action : click, to update the new x and y of the object from the backend
        httpPost('ajax.html', payload, this.onAcknowledgeClick); // post request sent from main.ts (frontend, using AJAX) -> http_daemon (middle man) -> main.py (backend). 
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
        if (ob.status === 'success') { }
        else if (ob.updates) {
            var updates = ob.updates;
            this.process_updates(updates);
        }
        else {
            console.warn('Unexpected response from backend:', ob);
        }
    }; // logs response to console
    Controller.prototype.process_updates = function (updates) {
        for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
            var update = updates_1[_i];
            var playerID = update[0];
            var playerX = update[1];
            var playerY = update[2];
            this.updatePlayerPosition(playerID, playerX, playerY);
        } // iterate through each player update and add the x,y, and id updates (there should be no id updates) 
    };
    Controller.prototype.updatePlayerPosition = function (playerID, playerX, playerY) {
        //const player = this.model.sprites.find((sprite : Sprite) => sprite.id === playerID)! // ! to stop TS complaining about player possibly being 'undefined'
        var player = null; // initialize a player of type Sprite or null
        for (var i = 0; i < this.model.sprites.length; i++) {
            if (this.model.sprites[i].id === playerID) // player is found
             {
                player = this.model.sprites[i];
                break; // exit loop once player is found
            }
        }
        if (player === null) // if player is not found, create a new sprite for them
         {
            player = new Sprite(playerID, playerX, playerY, "green_robot.png", function () { }, function (x, y) { }); // create a new instance of player with id, x, and y, green_robot, and default update() and onClick() methods
            this.model.sprites.push(player); // add new player to the sprites array
        }
        // updates player's position
        player.x = playerX;
        player.y = playerY;
    };
    return Controller;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.last_updates_request_time = 0;
        this.model = new Model();
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
        var payload = {
            id: g_id,
            action: 'gu' // get updates
        };
        httpPost('ajax.html', payload, this.controller.process_updates);
    };
    return Game;
}());
var game = new Game();
var timer = setInterval(function () { game.onTimer(); }, 40);
var g_origin = new URL(window.location.href).origin;
var g_id = random_id(12);
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
