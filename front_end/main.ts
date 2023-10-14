// ** FRONT END **

class Sprite 
{
	x: number; // number would be analogous to integer int type in Java
	y: number;
	speed: number;
	image: HTMLImageElement; // HTMLImageElement is the image type
	dest_x: number = 0;
	dest_y: number = 0;
	update: () => void; 
	onclick: (x: number, y: number) => void; // method onclick has parameters x and y (numbers) and is of type void

	constructor(x: number, y: number, image_url: string, update_method: () => void, onclick_method: (x: number, y: number) => void) // Type annotations 'varName':'type' (optional, but useful)
	{
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






class Model 
{
	sprites: Sprite[]; // sprites is of type Sprite array
	turtle: Sprite; // turtle is of type Sprite
	constructor() 
	{
		this.sprites = [];
		this.sprites.push(new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
		this.turtle = new Sprite(50, 50, "turtle.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
		this.sprites.push(this.turtle);
	}

	update() {
		for (const sprite of this.sprites) {
			sprite.update();
		}
	}

	onclick(x : number, y : number) {

		/*
		//  from frontend
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
		this.turtle.move(dx, dy);
	}
}




class View
{
	model: Model;
	canvas: HTMLCanvasElement;
	turtle: HTMLImageElement;
	constructor(model: Model) 
	{
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement; // explicitly say that you are assigning it as type HTMLCanvasElement
		this.turtle = new Image();
		this.turtle.src = "turtle.png";
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

		httpPost('ajax.html', payload, this.onAcknowledgeClick);
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
        let speed = this.model.turtle.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);
	}

	onAcknowledgeClick(ob: any) 
	{
		console.log(`Response to move: ${JSON.stringify(ob)}`); // console log response from backend
	}
}





class Game 
{
	model: Model;
	view: View;
	controller: Controller;

	constructor() 
	{
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() 
	{
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}


let game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 40);

interface HttpPostCallback {
	(x:any): any;
}

const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);

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

