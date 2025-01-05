var canvas;
var ctx;

let IMAGES = {
	player:undefined,
	arena:undefined,
	bullet:undefined,
	skull:undefined,
	blood:undefined,
	shard:undefined,
	spawner:undefined,
	spawnerd1:undefined,
	crystal:undefined
};

let STATE = {
	tutorial:0,
	alive:1,
	dead:2
}

window.onload = function() {
    window.onresize();
    loadImages(function (){
        setInterval(drawgame, 1000/60);
    });
}

window.onresize = function() {
    canvas = window.game;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    camera.width = canvas.width;
    camera.height = canvas.height;
    camera.zoom = (canvas.width + canvas.height) / 800;

    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.font = (40*camera.zoom)+"px Arial";
    ctx.lineWidth = 2*camera.zoom;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
}

function loadImages(callback) {
    let count = 0;
    for (let img in IMAGES) ++count;

    let onload = function() { if (--count == 0) callback(); };

    for (let img in IMAGES) {
        IMAGES[img] = new Image();
        IMAGES[img].onload = onload;
        IMAGES[img].src = "img/" + img + ".png";
    }
}

let keys = {w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft:false, ArrowDown:false, ArrowRight:false};
window.onkeydown = function(event) {
    if (keys.hasOwnProperty(event.key)) {
        if (!event.repeat) {
            keys[event.key] = true;
        }
    }
}
window.onkeyup = function(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
}

let mouse = {x: 0, y: 0, d : false};
window.onmousemove = function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
}
	
window.onmousedown = function(event) {
	mouse.d = true;
	if (contemplation == 0){
		res();
	}
}

window.onmouseup = function(event) {
	mouse.d = false;
}

let rad = 128;

var camera = {
	x:0,
	y:0,
	width:0,
	height:0,
	zoom:1,
	draw: function(img, x, y, scale, rot, alpha=1) {
        drawImage(img, this.width/2 + this.zoom*(x-this.x), this.height/2 + this.zoom*(y-this.y), scale*this.zoom, rot, alpha);
    },
	drawText: function(text, x, y) {
        ctx.strokeText(text, this.width/2 + this.zoom*(x-this.x), this.height/2 + this.zoom*(y-this.y));
	}
}

function drawImage(img, x, y, scale, rot, alpha=1) {
    w = scale * img.width;
    h = scale * img.height;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.restore();
}

var crystal = {
	x: 0,
	y: -10,
	h: 25,
	a: true,
	upd: function() {
		if (this.h <= 0 && state == STATE.tutorial){
			state = STATE.alive;
			this.a = false;
			for (let i=0; i<25; ++i) {
				Blood.spawn(this.x, this.y, Math.random()*2*Math.PI, Math.random()*6+2,1);
			}	
		}
		this.draw()
	},
	draw: function() {
		camera.draw(IMAGES.crystal, this.x, this.y, 1, 0);
	}
}
			

var player = {
	x: 0,
	y: 50,
	dx: 0,
	dy: 0,
	acc: 0.40,
	fri: 0.90,
	mcool: 0,
	scool: 0,
	att: 0.00003,
	a:0,
	upd: function() {
		this.move();
		if (mouse.d){
			this.gun();
		}

		this.mcool -= 1;
		this.scool -= 1;
		this.a = Math.atan2(mouse.y-(camera.height/2 + camera.zoom*(this.y - camera.y)), mouse.x-(camera.width/2 + camera.zoom*(this.x - camera.x)));
		this.draw();
	},
	
	move: function() {
		let hor = keys.d + keys.ArrowRight - keys.a - keys.ArrowLeft;
        let ver = keys.s + keys.ArrowDown - keys.w - keys.ArrowUp;
		

        let mag = Math.hypot(hor, ver);
        if (mag > Number.EPSILON) {
            this.dx += this.acc * hor / mag;
            this.dy += this.acc * ver / mag;
        }
		let mag2 = Math.hypot(this.x,this.y);
		if (mag2 > rad){
			this.dx -= this.x * this.att * (mag2-rad);
			this.dy -= this.y * this.att * (mag2-rad);
		}
		
		this.x += this.dx;
		this.y += this.dy;
		
		this.dx *= this.fri;
		this.dy *= this.fri;
	},
	
	gun: function() {
		if (this.scool <= 0){
			for (let i = 0; i < 10; i++) {
			Bullet.spawn(this.x,this.y, Math.atan2(mouse.y-(camera.height/2 + camera.zoom*(this.y - camera.y)), mouse.x-(camera.width/2 + camera.zoom*(this.x - camera.x))) + Math.random()*0.25-0.125, 10+Math.random()*3);
			}
			this.scool = 25;
			this.mcool = 20;
		}
		else if (this.mcool <= 0){
			Bullet.spawn(this.x,this.y, Math.atan2(mouse.y-(camera.height/2 + camera.zoom*(this.y - camera.y)), mouse.x-(camera.width/2 + camera.zoom*(this.x - camera.x))) + Math.random()*0.1-0.05, 8+Math.random()*1.5);
			this.mcool = 4;
			this.scool = 15;
		}
	},
		
	kill: function() {
		state = STATE.dead;
		for (let i=0; i<50; ++i) {
        Blood.spawn(this.x, this.y, Math.random()*2*Math.PI, Math.random()*5,0);
    }
	},
	
	draw: function() {
        camera.draw(IMAGES.player, this.x, this.y, 1, this.a);
		
	}
}

function Skull(id, x, y, acc, fri){ 
	this.id = id;
	this.x = x;
	this.y = y;
	this.acc = acc;
	this.fri = fri;
	this.a = Math.random()*2*Math.PI;
	this.dx = 3*acc*Math.cos(this.a);
	this.dy = 3*acc*Math.sin(this.a);
	this.k = false;
}
Skull.prototype.upd = function() {
	let disx = player.x - this.x;
	let disy = player.y - this.y;


	let mag = Math.hypot(disx, disy);
	if (mag > Number.EPSILON) {
		this.dx += this.acc * disx / mag;
		this.dy += this.acc * disy / mag;
	}
	this.x += this.dx;
	this.y += this.dy;
	
	this.dx *= this.fri;
	this.dy *= this.fri;
	
	this.a = Math.atan2(this.dy, this.dx);
	
	if (Math.hypot(this.x-player.x,this.y-player.y) < 3 && state == STATE.alive){
		player.kill();
	}
}

Skull.prototype.kill = function() {
    for (let i=0; i<7; ++i) {
        Blood.spawn(this.x, this.y, Math.random()*2*Math.PI, Math.random()*2,0);
    }
    delete Skull.alive[this.id];
}

Skull.prototype.draw = function() {
	camera.draw(IMAGES.skull, this.x, this.y, 1, this.a);
}

Skull.nextId = 0;
Skull.alive = {};

Skull.spawn = function(x,y,acc,fri) {
	Skull.alive[Skull.nextId] = new Skull(Skull.nextId, x, y, acc, fri);
	++Skull.nextId;
}
Skull.upd = function() {
	for (let id in Skull.alive) {
		Skull.alive[id].upd();
		if (Skull.alive[id].k == false){
			Skull.alive[id].draw();
		}
		else{
			Skull.alive[id].kill();
		}
	}
}
	

function Bullet(id, x, y, a, v) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.v = v;
	this.a = a;
	this.dx = v * Math.cos(a) + player.dx/2;
    this.dy = v * Math.sin(a) + player.dy/2;
	this.k = false;
}

Bullet.prototype.upd = function() {
	this.x += this.dx;
	this.y += this.dy;
	
	if (Math.hypot(this.x, this.y) > 1000){
		this.k = true
	}
	
	for (let id in Skull.alive) {
		if (Math.hypot(this.x-Skull.alive[id].x,this.y-Skull.alive[id].y) < 7 && this.k == false){
			this.k = true;
			Skull.alive[id].k = true;
		}
	}
	
	for (let id in Spawner.alive) {
		if (Spawner.alive[id].rh > 0 && Math.hypot(this.x - (Spawner.alive[id].x + (1 - Spawner.alive[id].spawning/300)*10*Math.cos(Spawner.alive[id].a)), this.y - (Spawner.alive[id].y + (1 + Spawner.alive[id].spawning/300)*10*Math.sin(Spawner.alive[id].a))) < (1 - Spawner.alive[id].spawning/450)*6 && this.k == false) {
			this.k = true;
			Spawner.alive[id].rh -= 1;
			Blood.spawn(this.x, this.y, this.a+Math.random()*0.1-0.05, Math.random()*2);
		}
		
		else if (Spawner.alive[id].lh > 0 && Math.hypot(this.x - (Spawner.alive[id].x - (1 - Spawner.alive[id].spawning/300)*10*Math.cos(Spawner.alive[id].a)), this.y - (Spawner.alive[id].y - (1 + Spawner.alive[id].spawning/300)*10*Math.sin(Spawner.alive[id].a))) < (1 - Spawner.alive[id].spawning/450)*6 && this.k == false) {
			this.k = true;
			Spawner.alive[id].lh -= 1;
			Blood.spawn(this.x, this.y, this.a+Math.random()*0.1-0.05, Math.random()*2);
		}
		
		else if (Math.hypot(this.x - Spawner.alive[id].x, this.y - Spawner.alive[id].y) < (1 - Spawner.alive[id].spawning/300)*12 && this.k == false){
			this.k = true;
		}
	}
	if (Math.hypot(this.x - crystal.x, this.y - crystal.y) < 20 && this.k == false && crystal.h > 0){
		crystal.h -= 1;
		this.k = true;
		Blood.spawn(this.x, this.y, this.a+Math.random()*0.1-0.05, Math.random()*6+2,1);
	}
}

Bullet.prototype.kill = function() {
	delete Bullet.alive[this.id];
	
}

Bullet.prototype.draw = function() {
	camera.draw(IMAGES.bullet, this.x, this.y, 1, this.a);
}

Bullet.nextId = 0;
Bullet.alive = {};

Bullet.spawn = function(x, y, a, v) {
    Bullet.alive[Bullet.nextId] = new Bullet(Bullet.nextId, x, y, a, v);
    ++Bullet.nextId;
}
Bullet.upd = function() {
    for (let id in Bullet.alive) {
        Bullet.alive[id].upd();
		if (Bullet.alive[id].k == false){
			Bullet.alive[id].draw();
		}
		else{
			Bullet.alive[id].kill();
		}
    }
}

function Blood(id, x, y, a, v, type) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.v = v;
	this.a = a;
	if (type == 0){
		this.size = Math.random()*1.5+0.5;
	}
	else{
		this.size = Math.random();
	}
	this.type = type;
	if (this.type == 0){
		this.im = IMAGES.blood;
	}
	else{
		this.im = IMAGES.shard;
	}
	this.dx = v * Math.cos(a);
    this.dy = v * Math.sin(a);
	this.t = 600;
	this.k = false;
}

Blood.prototype.upd = function() {
	this.x += this.dx;
	this.y += this.dy;
	this.dx *= 0.9;
	this.dy *= 0.9;
	this.t -= 1;
	if (this.t <= 1){
		this.k = true;
	}
}

Blood.prototype.kill = function() {
	delete Blood.alive[this.id];
}

Blood.prototype.draw = function() {
	if (this.t > 300){
		camera.draw(this.im, this.x, this.y, 1+this.size, this.a);
	}
	else {
		camera.draw(this.im, this.x, this.y, 1+this.size, this.a, this.t/300);
	}
}

Blood.nextId = 0;
Blood.alive = {};

Blood.spawn = function(x, y, a, v, type=0) {
    Blood.alive[Blood.nextId] = new Blood(Blood.nextId, x, y, a, v, type);
    ++Blood.nextId;
}
Blood.upd = function() {
    for (let id in Blood.alive) {
        Blood.alive[id].upd();
		Blood.alive[id].draw();
		if (Blood.alive[id].k){
			Blood.alive[id].kill();
		}
    }
}


function Spawner(id, a, d, av) {
	this.id = id;
	this.a = a;
	this.d = d;
	this.av = av;
	this.x = rad*0.9*Math.cos(d);
	this.y = rad*0.9*Math.sin(d);
	this.lh = 10;
	this.rh = 10;
	this.c = 0;
	this.spawning = 300;
	this.state = 0;
	this.k = false;
}

Spawner.prototype.upd = function() {
	this.x = rad*0.9*Math.cos(this.d);
	this.y = rad*0.9*Math.sin(this.d);
	this.d += this.av;
	this.a += 0.01;
	if (this.lh <= 0 && this.rh <= 0){
		this.k = true;
	}
	else if (this.lh <= 0){
		this.state = 1;
	}
	else if (this.rh <= 0){
		this.state = 2;
	}
	if (this.spawning <= 0){
		this.c -= 1;
		if (this.c <= 0 && state == STATE.alive){
			for (let i=0; i<10; ++i) {
				Skull.spawn(this.x,this.y,0.10+Math.random()*0.01,0.99);
			}
			this.c = 180;
		}
		if (Math.hypot(this.x-player.x,this.y-player.y) < 10 && state == STATE.alive){
			player.kill();
		}
	}
	else {
		this.spawning -= 1;
	}
}

Spawner.prototype.kill = function() {
	delete Spawner.alive[this.id];
	for (let i=0; i<25; ++i) {
		Blood.spawn(this.x, this.y, Math.random()*2*Math.PI, Math.random()*4,1);
	}
}

Spawner.prototype.draw = function() {
	if (this.state == 0){
		camera.draw(IMAGES.spawner, this.x, this.y, 1 - this.spawning/300, this.a);
	}
	else if (this.state == 1){
		camera.draw(IMAGES.spawnerd1, this.x, this.y, 1 - this.spawning/300, this.a);
	}
	else if (this.state == 2){
		camera.draw(IMAGES.spawnerd1, this.x, this.y, 1 - this.spawning/300, this.a + Math.PI);
	}
}

Spawner.nextId = 0;
Spawner.alive = {};

Spawner.spawn = function(x, y, a, v) {
    Spawner.alive[Spawner.nextId] = new Spawner(Spawner.nextId, x, y, a, v);
    ++Spawner.nextId;
}
Spawner.upd = function() {
    for (let id in Spawner.alive) {
        Spawner.alive[id].upd();
		if (Spawner.alive[id].k){
		Spawner.alive[id].kill();
		}
		else{
		Spawner.alive[id].draw();
		}
    }
}

Spawner.spawn(0, 0, 0.01);



var state = STATE.tutorial;
var time = 1;
var contemplation = 120;

var skullrate = 180;
var spawnrate = 600;

function res() {
	time = 1;
	state = STATE.tutorial;
	contemplation = 120;
	
	Spawner.alive = {};
	Skull.alive = {};
	Blood.alive = {};
	
	skullrate = 180;
	spawnrate = 600;
	
	player.x = 0;
	player.y = 50;
	player.dx = 0;
	player.dy = 0;
	
	crystal.h = 25;
}

res();

function drawgame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (state == STATE.tutorial){
		camera.x = player.x / 2.2;
		camera.y = player.y / 2.2;
		camera.draw(IMAGES.arena, 0, 0, 1, 0);
		Blood.upd();
		crystal.upd();
		player.upd();
		Bullet.upd();
	}
	else if (state == STATE.alive){
		camera.x = player.x / 2.2;
		camera.y = player.y / 2.2;
		camera.draw(IMAGES.arena, 0, 0, 1, 0);
		ctx.beginPath();
		ctx.arc((camera.width/2 + camera.zoom*(0 - camera.x)), (camera.height/2 + camera.zoom*(0 - camera.y)), rad*camera.zoom, 0, Math.PI * 2, false);
		ctx.strokeStyle = "rgb(25,0,0)";
		ctx.stroke();
		ctx.closePath();
		let t = Math.random()*Math.PI * 2;
		
		skullrate -= 1;
		if (skullrate == 0){
			Skull.spawn(700*Math.cos(t), 700*Math.sin(t), 0.1, 0.97);
			if (time < 1200){
				skullrate = 180;
			}
			else if (time < 1800){
				skullrate = 120;
			}
			else if (time < 2400){
				skullrate = 90;
			}
			else if (time < 2700){
				skullrate = 60;
			}
			else if (time < 3000){
				skullrate = 30;
			}
			else{
				skullrate = 20;
			}
		}
		
		spawnrate -= 1;
		if (spawnrate == 0){
			Spawner.spawn(Math.random()*2*Math.PI,Math.random()*2*Math.PI,0.008);
			if (time < 1200){
				spawnrate = 300;
			}
			else if (time < 1800){
				spawnrate = 270;
			}
			else if (time < 2400){
				spawnrate = 240;
			}
			else if (time < 2700){
				spawnrate = 210;
			}
			else if (time < 3000){
				spawnrate = 180;
			}
			else{
				spawnrate = 150;
			}
		}
		time += 1;
		Blood.upd();
		camera.drawText((time/60).toFixed(1),0,0);
		Skull.upd();
		Spawner.upd();
		Bullet.upd();
		player.upd();
	}
	
	else if (state == STATE.dead){
		camera.x = player.x / 2.2;
		camera.y = player.y / 2.2;
		camera.draw(IMAGES.arena, 0, 0, 1, 0);
		ctx.beginPath();
		ctx.arc((camera.width/2 + camera.zoom*(0 - camera.x)), (camera.height/2 + camera.zoom*(0 - camera.y)), rad*camera.zoom, 0, Math.PI * 2, false);
		ctx.strokeStyle = "rgb(230,0,0)";
		ctx.stroke();
		ctx.closePath();
		Blood.upd();
		Skull.upd();
		Spawner.upd();
		camera.drawText((time/60).toFixed(1),0,0);
		Bullet.upd();
		if (contemplation > 0){
			contemplation -= 1;
		}
	}
}

