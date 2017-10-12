class Carro
{
	constructor() {
		//Manel
		this.geometry;

		/*Goncalo*/

		this.velocity = new THREE.Vector3(0,0,0);

		this.Yoffset = -0.75;
		this.Xoffset = -9;

		this.carScale = 5;
		/*
		ACCELERATION
		*/
		//Mexer
		this.speedScale = 2.4;
		this.maxVelocity = 1;
		this.acceleration = 5;
		//Makes the car slow to a halt
		this.speedDrag = 0.3;
		//Nao mexer
		this.speed = 0.02;
		//Translates player's throttle input (1 = accelerate, -1 = brake)
		this.throttle = 0;
		//Velocity clamped between -1 and 1
		this.clampVel = 0;

		/*
		STEERING
		*/
		//Mexer
		this.steeringScale = 0.08;
		//Nao mexer
		this.steeringSensitivity = 0.8;
		this.maxSteering = 1;
		//Translates player's turn input (1 = right, -1 = left)
		this.turn = 0;
		//Makes the car turn to the center
		this.turnDrag = 0.99;

		//Tracks the key's pressed state
		this.throttlePressed = false;
		this.brakePressed = false;
		this.leftPressed = false;
		this.rightPressed = false;
	}

	Start() {

		this.car = new THREE.Object3D();
		this.CreateMiddlePart(0.5 + this.Xoffset,1 + this.Yoffset,-0.5);
		this.CreateFrontPart(0.55 + this.Xoffset,1 + this.Yoffset,0.875);
		this.CreateFrontWing(0.35 + this.Xoffset,1 + this.Yoffset,1.4);
		this.CreateAleronTriangle(1 + this.Xoffset,1.4 + this.Yoffset,-1);
		this.CreateAleronTriangle(1 + this.Xoffset,0.6 + this.Yoffset,-1);
		this.CreateAleronBar(1 + this.Xoffset,1 + this.Yoffset,-1.25);
		this.CreateFrontWheelSupportLeft(0.35 + this.Xoffset,1.7 + this.Yoffset,0.4);
		this.CreateFrontWheelSupportRight(0.35 + this.Xoffset,0.3 + this.Yoffset,0.4);
		this.CreateBackWheelSupport(0.35 + this.Xoffset,1.625 + this.Yoffset,-1);
		this.CreateBackWheelSupport(0.35 + this.Xoffset,0.375 + this.Yoffset,-1);
		this.CreateWheel(0.35 + this.Xoffset,1.625 + this.Yoffset,-1);
		this.CreateWheel(0.35 + this.Xoffset,0.375 + this.Yoffset,-1);
		this.CreateTip(0.55 + this.Xoffset,1 + this.Yoffset,1.6);
		this.CreateWheel(0.35 + this.Xoffset,1.625 + this.Yoffset,0.9);
		this.CreateWheel(0.35 + this.Xoffset,0.375 + this.Yoffset,0.9);
		this.CreateRoof(0.75 + this.Xoffset,1 + this.Yoffset,-0.25);
		//var eixo = new THREE.AxisHelper(3);
		//eixo.rotation.y = -.5;
		//eixo.rotation.x = .5;
		//eixo.scale.set(10, 10, 10);
		//scene.add(eixo);
		scene.add(this.car);
		//eixo.rotateX(1);

		this.car.scale.set(this.carScale, this.carScale, this.carScale); // change car's scale
		this.car.rotation.y = Math.PI/2;
		this.car.rotation.y = Math.PI/2;
		this.car.position.z = 50;
		this.car.position.y = 150;
		this.car.position.x = -350;
	}

	Update(delta) {
		this.HandleAcceleration(delta);
		this.HandleTurning(delta);
		this.ApplyVelocity();
	}

	HandleAcceleration(delta) {
		var speedSign = Math.sign(this.velocity.x);
		var throttleSign = Math.sign(this.throttle);
		var thrust = (this.throttle * this.speed * 10) * delta * (1 + (Math.abs(speedSign - throttleSign) / 2));

		//Check if car hasn't hit full speed, if it did, don't update X velocity
		if (Math.abs(this.velocity.x) < this.maxVelocity || (throttleSign != speedSign)) {

			//Make sure the added speed doesn't surpass maxVelocity
			var addedVel = (this.velocity.x + thrust*this.acceleration);
			this.velocity.x = Math.abs(addedVel) > this.maxVelocity ? Math.sign(addedVel)*this.maxVelocity : addedVel;
		}
		//When velocity is nearly 0, and the car isn't at full throttle, halt the car
		if (this.velocity.x != 0 && Math.abs(this.throttle) != 1 && Math.abs(this.velocity.x) < 0.05) {
			this.velocity.x = 0;
			this.throttle = 0;
		}
	}

	HandleTurning(delta) {

		var vel = this.velocity.x;
		this.clampVel = THREE.Math.clamp(vel, -1, 1);
		
		var turning = (this.turn * this.steeringSensitivity * 10) * delta;
		var steerSign = Math.sign(this.velocity.z);
		var turnSign = Math.sign(this.turn);

		//Check if car hasn't hit full steering, if it did, don't update Z velocity
		if (Math.abs(this.velocity.z) < this.maxSteering || (turnSign != steerSign)) {
			//Make sure the added steering doesn't surpass maxSteering
			var addedTurning = this.velocity.z + turning;
			this.velocity.z = Math.abs(addedTurning) > this.maxSteering ? Math.sign(addedTurning)*this.maxSteering : addedTurning;
		}

		//When turning is nearly 0, and the player isn't turning, center the steering of the car
		if (this.velocity.z != 0 && Math.abs(this.turn) != 1 && Math.abs(this.velocity.z) < 0.1) {
			this.velocity.z = 0;
			this.turn = 0;
		}
	}

	ApplyVelocity() {
		var forward = this.car.getWorldDirection();
		this.car.position.x += (this.velocity.x * this.speedScale) * forward.x;
		this.car.position.y += (this.velocity.x * this.speedScale) * forward.y;

		//Multiply by clamped velocity, to invert turning when speed changes direction
		this.car.rotateX(this.velocity.z * this.clampVel * this.steeringScale);
	}

	OnAccelerate() {
		if (!this.throttlePressed) {
			this.throttlePressed = true;

			this.throttle = Math.abs(this.throttle) != this.speedDrag ? this.throttle + 1 : 1;

			//If the car's x speed is not 0 and the player is applying no thrust, apply drag
			if (this.velocity.length != 0 && this.throttle == 0) {
				this.throttle += (this.speedDrag) * Math.sign(-this.velocity.x);
			}
		}
	}

	OnUnaccelerate() {
		this.throttlePressed = false;
		this.throttle -= 1;

		//If the car's speed is not 0 and the player is applying no thrust, apply drag
		if (this.velocity.length != 0 && this.throttle == 0) {
			this.throttle -= (this.speedDrag) * Math.sign(this.velocity.x);
		}

		//Make sure thrust doesn't have and absolute value greater than 1
		this.throttle = this.throttle < -1 ? -1 : this.throttle;

		//Make sure the player uses full throttle if still braking
		this.throttle = this.brakePressed && this.throttle != -1 ? -1 : this.throttle;
	}

	OnBrake() {
		if (!this.brakePressed) {
			this.brakePressed = true;

			this.throttle = Math.abs(this.throttle) != this.speedDrag ? this.throttle - 1 : -1;

			//If the car's x speed is not 0 and the player is applying no thrust, apply drag
			if (this.velocity.length != 0 && this.throttle == 0) {
				this.throttle += (this.speedDrag) * Math.sign(-this.velocity.x);
			}
		}
	}

	OnUnbrake() {
		this.brakePressed = false;
		this.throttle += 1;
		//If the car's x speed is not 0 and the player is applying no thrust, apply drag
		if (this.velocity.length != 0 && this.throttle == 0) {
			this.throttle += (this.speedDrag) * Math.sign(-this.velocity.x);
		}

		//Make sure thrust doesn't have and absolute value greater than 1
		this.throttle = this.throttle > 1 ? 1 : this.throttle;

		//Make sure the player uses full throttle if still accelerating
		this.throttle = this.brakePressed && this.throttle != 1 ? 1 : this.throttle;
	}

	OnLeft() {
		if (!this.leftPressed) {
			this.leftPressed = true;

			this.turn = Math.abs(this.turn) != this.turnDrag ? this.turn - 1 : -1;

			//If the car's x speed is not 0 and the player is applying no thrust, apply drag
			if (this.velocity.length != 0 && this.turn == 0) {
				this.turn += (this.turnDrag) * Math.sign(-this.velocity.z);
			}
		}
	}

	OnUnleft() {
		this.leftPressed = false;

		this.turn += 1;

		//If the car's turning is 0, apply drag
		if (this.turn == 0) {
			this.turn -= (this.turnDrag) * Math.sign(this.velocity.z);
		}

		//Make sure thrust doesn't have and absolute value greater than 1
		this.turn = this.turn < -1 ? -1 : this.turn;

		//Make sure the player uses turns right fully
		this.turn = this.rightPressed && this.turn != 1 ? 1 : this.turn;
	}

	OnRight() {
		if (!this.rightPressed) {
			this.rightPressed = true;

			this.turn = Math.abs(this.turn) != this.turnDrag ? this.turn + 1 : 1;

			//If the car's x speed is not 0 and the player is applying no thrust, apply drag
			if (this.velocity.length != 0 && this.turn == 0) {
				this.turn += (this.turnDrag) * Math.sign(-this.velocity.z);
			}
		}
	}

	OnUnright() {
		this.rightPressed = false;

		this.turn -= 1;

		//If the car's turning is 0, apply drag
		if (this.turn == 0) {
			this.turn -= (this.turnDrag) * Math.sign(this.velocity.z);
		}

		//Make sure thrust doesn't have and absolute value greater than 1
		this.turn = this.turn < -1 ? -1 : this.turn;

		//Make sure the player uses turns left fully
		this.turn = this.leftPressed && this.turn != -1 ? -1 : this.turn;
	}

	CreateMiddlePart(x,y,z){
		var cubo = new THREE.BoxGeometry(0.5, 1, 1.5);
		var mesh = new THREE.Mesh(cubo, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		this.car.add(mesh);
	}
	CreateTip(x,y,z){
		var bico = new THREE.CylinderGeometry(0,0.275,0.2,4,0,0); 
		var mesh = new THREE.Mesh(bico, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		bico.rotateX(Math.PI / 2); // toda para a base da piramide ficar na mesma face que 1 das bases do paralelipipedo
		bico.rotateZ(Math.PI / 4); // roda para o bico ficar na mesma direcao que o paralelipipedo
		this.car.add(mesh);
	}
	CreateFrontWing(x,y,z){
		var cubo = new THREE.BoxGeometry( .2, .02, 1.25);
		var mesh = new THREE.Mesh(cubo, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		cubo.rotateZ(Math.PI / 2); 
		cubo.rotateX(2*Math.PI/4); 

		this.car.add(mesh);
	}
	CreateFrontPart(x,y,z){
		var cubo = new THREE.BoxGeometry( 1.25, .4, .4);
		//cubo.x = (Math.PI/180);
		var mesh = new THREE.Mesh(cubo, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		cubo.rotateY(2*Math.PI/4); 

		this.car.add(mesh);
	}
	CreateWheel(x,y,z){
		var wheel = new THREE.TorusGeometry( 0.2, 0.15, 10, 20 );
		var mesh = new THREE.Mesh(wheel, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		wheel.rotateX(Math.PI / 2); 
		this.car.add(mesh);
	}

	CreateRoof(x,y,z){
		var ball = new THREE.SphereGeometry( 0.2, 5, 5,0, Math.PI);
		var mesh = new THREE.Mesh( ball, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		ball.rotateY(Math.PI / 2);
		this.car.add(mesh);
	}
	CreateAleronTriangle(x,y,z){
		var triangle = new THREE.Geometry();
		var v1 = new THREE.Vector3(-0.25,0,0);
		var v2 = new THREE.Vector3(-0.25,0.25,0);
		var v3 = new THREE.Vector3(0.05,0.25,0);
		triangle.vertices.push(v1);
		triangle.vertices.push(v2);
		triangle.vertices.push(v3);

		triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );
		triangle.computeFaceNormals();

		triangle.rotateZ(Math.PI / 2); 
		triangle.rotateX(2*Math.PI/4); 

		var mesh = new THREE.Mesh( triangle, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		this.car.add(mesh);
	}
	CreateAleronBar(x,y,z){
		var cubo = new THREE.BoxGeometry( .2, .01, 1.2);
		var mesh = new THREE.Mesh(cubo, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		cubo.rotateZ(Math.PI / 2); 
		cubo.rotateX(2*Math.PI/4); 

		this.car.add(mesh);
	}
	CreateFrontWheelSupportLeft(x,y,z){
		var triangle = new THREE.Geometry();
		var v1 = new THREE.Vector3(-0.5,0,0);
		var v2 = new THREE.Vector3(-0.5,-0.5,0);
		var v3 = new THREE.Vector3(0,-0.5,0);

		triangle.vertices.push(v1);
		triangle.vertices.push(v2);
		triangle.vertices.push(v3);

		triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );
		triangle.computeFaceNormals();

		triangle.rotateX(-Math.PI / 2);
		triangle.rotateZ(Math.PI / 2); 

		var mesh = new THREE.Mesh( triangle, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}) );
		mesh.position.set(x,y,z);
		this.car.add(mesh);
	}
	CreateFrontWheelSupportRight(x,y,z){
		var triangle = new THREE.Geometry();
		var v1 = new THREE.Vector3(-0.5,0,0);
		var v2 = new THREE.Vector3(-0.5,-0.5,0);
		var v3 = new THREE.Vector3(0,-0.5,0);

		triangle.vertices.push(v1);
		triangle.vertices.push(v2);
		triangle.vertices.push(v3);

		triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );
		triangle.computeFaceNormals();

		triangle.rotateX(-Math.PI / 2);
		triangle.rotateZ(Math.PI / 2);
		triangle.rotateZ(Math.PI); 
		var mesh = new THREE.Mesh( triangle, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		this.car.add(mesh);
	}
	CreateBackWheelSupport(x,y,z){
		var cubo = new THREE.CylinderGeometry( .05, .05, .2, 0 );
		var mesh = new THREE.Mesh(cubo, new THREE.MeshBasicMaterial( {color: 0xFFFFFF, wireframe: true}));
		mesh.position.set(x,y,z);
		cubo.rotateZ(Math.PI); 
		cubo.rotateX(Math.PI); 

		this.car.add(mesh);
	}
}