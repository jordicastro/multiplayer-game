// ** FRONT END **

class Sprite 
{
	id: string; // id attribute added to handle updates from the backend (for each object with unique id y, we update the x's and y's accordingly)
	x: number; // number ~= int type in Java
	y: number;
	speed: number;
	image: HTMLImageElement; // HTMLImageElement is the image type
	dest_x: number = 0;
	dest_y: number = 0;
	update: () => void; 
	onclick: (x: number, y: number) => void; // method onclick has parameters x and y (numbers) and is of type void

	constructor(id: string, x: number, y: number, image_url: string, update_method: () => void, onclick_method: (x: number, y: number) => void) // Type annotations 'varName':'type' (optional, but useful)
	{
		this.id = id; // read line 7 ^
		this.x = x;
		this.y = y;
        this.speed = 7;
		this.image = new Image();
		this.image.src = image_url;
		this.update = update_method;
		this.onclick = onclick_method;
	}

	set_destination(x: number, y: number) 
	{
		this.dest_x = x;
		this.dest_y = y;
	}

	ignore_click(x: number, y: number) 
	{

	}

	move(dx: number, dy: number) 
	{
		this.dest_x = this.x + dx;
		this.dest_y = this.y + dy;
	}

	go_toward_destination() 
	{
		if(this.dest_x === undefined)
			return;

		if(this.x < this.dest_x)
			this.x += Math.min(this.dest_x - this.x, this.speed);
		else if(this.x > this.dest_x)
			this.x -= Math.min(this.x - this.dest_x, this.speed);
		if(this.y < this.dest_y)
			this.y += Math.min(this.dest_y - this.y, this.speed);
		else if(this.y > this.dest_y)
			this.y -= Math.min(this.y - this.dest_y, this.speed);
	}

	sit_still() 
	{

	}
}


// random_id method moved above Model so that it is recognized by model and sprites can be instantiated properly.
const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let value = [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
	console.log(`random value = ${value}`);
	console.trace();
	return value;
}

const g_id = random_id(12);

class Model 
{
	sprites: Sprite[]; // sprites is of type Sprite array
	robot: Sprite; // turtle is of type Sprite. you are the turtle -> you are the blue_robot, everyone else is a green robot
	constructor() 
	{ // pass in a random_id of length 12 when creating a new sprite!!!
		this.sprites = [];
		//this.sprites.push(new Sprite(random_id(12), 200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
		this.robot = new Sprite(g_id, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination); // overide Sprite.prototype.go_toward_destination
		console.log(`BLUE ROBOT ID: ${this.robot.id}`);
		this.sprites.push(this.robot);
	}

	update() {
		for (const sprite of this.sprites) {
			sprite.update();
		}
	}

	onclick(x : number, y : number) {

		/*
		//  from frontend, not sure difference between Model.onclick & controller.onClick
		let payload = {
			mesage: 'howdi'
		}
		httpPost('ajax.html', payload, (response) => {
			console.log(`${JSON.stringify(response)})`);
		});

		*/
		for (const sprite of this.sprites) {
			sprite.onclick(x, y);
		}
	}

	move(dx : number, dy : number) {
		this.robot.move(dx, dy);
	}
}




class View
{
	model: Model;
	canvas: HTMLCanvasElement;
	robot: HTMLImageElement;
	constructor(model: Model) 
	{
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement; // explicitly say that you are assigning it as type HTMLCanvasElement
		this.robot = new Image();
		this.robot.src = "blue_robot.png";
	}

	update() 
	{
		const ctx = this.canvas.getContext("2d")!; // adding '!' tells TypeSciprt that you are sure the value won't be NULL 
		ctx.clearRect(0, 0, 1000, 500);
		for (const sprite of this.model.sprites) {
			ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
		}
	}
}







class Controller
{
	model: Model;
	view: View;
	key_right: boolean = false;
	key_left: boolean = false;
	key_up: boolean = false;
	key_down: boolean = false;
	
	constructor(model: Model, view: View) 
	{
		this.model = model;
		this.view = view;
		let self = this;
		view.canvas.addEventListener("click", function(event) { self.onClick(event); });
		document.addEventListener('keydown', function(event) { self.keyDown(event); }, false);
		document.addEventListener('keyup', function(event) { self.keyUp(event); }, false);
	}

	onClick(event: MouseEvent) 
	{
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		this.model.onclick(x, y);

		const payload = {
			id : g_id,
			action : 'click',
			x : x,
			y : y,
		}; // this is talking to the BACKEND (main.py.Update method), passing the payload, including action : click, to update the new x and y of the object from the backend

		httpPost('ajax.html', payload, this.onAcknowledgeClick); // post request sent from main.ts (frontend, using AJAX) -> http_daemon (middle man) -> main.py (backend). 
		// BACKEND RESPONDS (sends back "status" : "success" [on 'click' request from frontend (in the form of a payload)] || "updates" : updates [on 'gu request from frontend (in the form of a payload)]) and frontend onAcknowledgeClick is CALLED 
	}

	keyDown(event: KeyboardEvent) 
	{
		if(event.keyCode == 39) this.key_right = true;
		else if(event.keyCode == 37) this.key_left = true;
		else if(event.keyCode == 38) this.key_up = true;
		else if(event.keyCode == 40) this.key_down = true;
	}

	keyUp(event: KeyboardEvent) 
	{
		if(event.keyCode == 39) this.key_right = false;
		else if(event.keyCode == 37) this.key_left = false;
		else if(event.keyCode == 38) this.key_up = false;
		else if(event.keyCode == 40) this.key_down = false;
	}

	update() 
	{
		let dx = 0;
		let dy = 0;
        let speed = this.model.robot.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);
	}

	

	onAcknowledgeClick(ob: any) // called when the server responds to the update request (ln 173 httpPost) 
	{
		console.log(`Response to move: ${JSON.stringify(ob)}`); // console log response from backend
		// add logic here to see if returned object from backend contains ('status' : 'success') -> TO NOTHING IF ITS A CLICK
		// elseif(returned object contains ("updates": updates)) -> {this.process_updates(updates)}
		if (ob.status === 'success') 
		{
			console.log("click action processed successfully!"); // from frontend to back endback to frontend
		}
		else if (ob.updates)
		{
			console.log('update called');
			//const updates = ob.updates;	
			this.process_updates(ob.updates);
		}
		else
		{
			console.warn('Unexpected response from backend:', ob);
		}

	} // logs response to console

	process_updates(ob: any)
	{
		let updates = ob;
		console.log(updates);
		for (const update of updates) // list syntax. change to json
		{
			const playerID = update[0];
			const playerX = update[1];
			const playerY = update[2];

			this.updatePlayerPosition(playerID, playerX, playerY)
		} // iterate through each player update and add the x,y, and id updates (there should be no id updates) 
	}


	updatePlayerPosition(playerID: string, playerX: number, playerY: number)
	{
		//const player = this.model.sprites.find((sprite : Sprite) => sprite.id === playerID)! // ! to stop TS complaining about player possibly being 'undefined'
		let player: Sprite | null = null; // initialize a player of type Sprite or null

		for (let i = 0; i < this.model.sprites.length; i++)
		{
			console.log(`looking for  ${playerID} , this.model.sprites[i].id = ${this.model.sprites[i].id}`);
			if (this.model.sprites[i].id === playerID) // player is found
			{

				player = this.model.sprites[i];
				console.log(`found player = ${player}`);
				break; // exit loop once player is found
			}
		}
		if (player === null) // if player is not found, create a new sprite for them
		{
			console.log(`not found player player = ${player}`);
			player = new Sprite(playerID, playerX, playerY, "green_robot.png", Sprite.prototype.go_toward_destination, (x,y) => {}); // create a new instance of player with id, x, and y, green_robot, and default update() and onClick() methods
			console.log(`player assigned = ${player}`);
			this.model.sprites.push(player); // add new player to the sprites array
		} // we wanna change the update method of the green robots, but not the onClick method (only for blue robot: otherwise every robot will move and follow the blue robot)

		// updates player's position if it is found in the for loop
		player.set_destination(playerX, playerY);
	}
}





class Game 
{
	model: Model;
	view: View;
	controller: Controller;

	last_updates_request_time: number = 0;

	constructor() 
	{
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() 
	{

		// checks if one second has passed since the last update
		const time = Date.now();
		if (time - this.last_updates_request_time >= 1000) 
		{
			this.last_updates_request_time = time; // sets the last update request time to curr time
			this.request_updates(); // sends a request for updates
		}

		// other game logic
		this.controller.update();
		this.model.update();
		this.view.update();
	}

	request_updates() {
		const payload = {
			id: g_id,
			action: 'gu' // get updates
		};
	
		httpPost('ajax.html', payload, (ob) => this.controller.onAcknowledgeClick(ob));                     
	}
}

///////////////////////////////////////////////////////// start
let game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 40);

interface HttpPostCallback {
	(x:any): any;
}


const g_origin = new URL(window.location.href).origin;


// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
const httpPost = (page_name: string, payload: any, callback: HttpPostCallback) => {
	let request = new XMLHttpRequest();
	// onreadystatechange: function within httpPost handler
	request.onreadystatechange = () => {
		if(request.readyState === 4) // server has replied
		{
			if(request.status === 200) // file found
			{
				let response_obj;
				try {
					response_obj = JSON.parse(request.responseText);
				} catch(err) {}
				if (response_obj) {
					callback(response_obj);
				} else {
					callback({
						status: 'error',
						message: 'response is not valid JSON',
						response: request.responseText,
					});
				}
			} else {
				if(request.status === 0 && request.statusText.length === 0) {
					callback({
						status: 'error',
						message: 'connection failed',
					});
				} else {
					callback({
						status: 'error',
						message: `server returned status ${request.status}: ${request.statusText}`,
					});
				}
			}
		}
	};
	request.open('post', `${g_origin}/${page_name}`, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify(payload));
}
