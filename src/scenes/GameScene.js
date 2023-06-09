import Phaser from 'phaser'
import Asteoid from './Asteroid';


const ASTEROID = 'asteroid';
const SHIP = 'ship';
const MISSILE = 'missile';


export default class GameScene extends Phaser.Scene {
	constructor() {
        super('game-scene')

        
        // Asteroid
        this.directionAsteroid = undefined;
        this.rankAsteroid = undefined;
        this.speedAsteroid = 100;

        // Ship
        this.ship = undefined;
        this.speedShip = undefined;
        this.rotationSpeedShip = undefined;
        this.isFiringShip = undefined;
        this.fireRate = undefined;
        this.timer = undefined;

        this.asteroids = [];
        this.asteroidsCount = 4;

        this.cursors = undefined;
    }
    
    preload() {
        this.load.image(ASTEROID, 'assets/Asteroid1.png');  
        this.load.spritesheet(SHIP,
            'assets/ShipSpritesheet.png',
            { frameWidth: 38, frameHeight: 29 }
        );
        this.load.spritesheet(MISSILE,
            'assets/MissileSpritesheet.png',
            { frameWidth: 16, frameHeight: 14 }
        );
    }
    
    create() {
        this.screenSize = { x: this.sys.game.config.width, y: this.sys.game.config.height };
        
        this.ship = this.createShip(200, 200);

        this.asteroidGroup = this.physics.add.group();
        this.missileGroup = this.physics.add.group();

        for(let i = 0; i < this.asteroidsCount; i++) {
            const randX = this.random(1000, true) % this.screenSize.x;
            const randY = this.random(1000, true) % this.screenSize.y;
            
            const directionX = this.random(2, true) == 0 ? 1 : -1;
            const directionY = this.random(2, true) == 0 ? 1 : -1;
            
            this.asteroids.push(this.createAsteroid(randX, randY, { x: directionX, y: directionY }));
        }
        
        // creates basic control binding to Up, Down, Left, Right, Space, Shift
        this.cursors = this.input.keyboard.createCursorKeys();

        // animation for missile
        this.anims.create({
            key: 'fire',
            // returns array that assing to frames property
            frames: this.anims.generateFrameNumbers(MISSILE, {start: 0, end: 1}),
            frameRate: 1,
            repeat: -1
        });
        
        //add a listener for when the screen is clicked
        //this.input.on('pointerdown', this.showDelta.bind(this));
    }
    
    update(time, delta) {
        this.handleInput(delta);

        for (let a of this.asteroids){
            this.reappearOnOtherSide(a);
        }
        this.reappearOnOtherSide(this.ship);
    }
    
    createAsteroid(x, y, direction) {
        const asteroid = this.physics.add.image(x, y, ASTEROID);
        this.asteroidGroup.add(asteroid);

        this.directionAsteroid = direction;
        this.rankAsteroid = 1;
        asteroid.setVelocity(this.speedAsteroid * this.directionAsteroid.x * this.rankAsteroid, this.speedAsteroid * this.directionAsteroid.y * this.rankAsteroid);
        asteroid.setCollideWorldBounds(false);
        asteroid.body.allowGravity = false;

        this.physics.add.collider(this.ship, asteroid, this.onShipHit, null, this);

        return asteroid;
    }

    reappearOnOtherSide(object) {
        if (object.x > this.screenSize.x)
            object.x = 0;
        if (object.x < 0)
            object.x = this.screenSize.x;
        if (object.y > this.screenSize.y)
            object.y = 0;
        if (object.y < 0)
            object.y = this.screenSize.y;
    }

    createShip(x, y) {
        const ship = this.physics.add.sprite(x, y, SHIP);
        
        ship.setCollideWorldBounds(false);
        ship.body.allowGravity = false;
        
        this.speedShip = 400;
        this.rotationSpeedShip = 400;
        this.isFiringShip = false;
        this.fireRate = 200;

        this.createAnimationShip();

        return ship;
    }

    createAnimationShip() {
        this.anims.create({
            key: 'idle',
            frames: [ { key: SHIP, frame: 0 } ],
            frameRate: 1
        });
        this.anims.create({
            key: 'move',
            frames: [ { key: SHIP, frame: 1 } ],
            frameRate: 1,
        });
    }

    onShipHit(ship) {
        //ship.setVisible(false);
        //ship.disableBody(true, true);

        //this.physics.pause();
        //this.gameOver = true;
    }

    createMissile(x, y) {
        const missile = this.physics.add.sprite(x, y, MISSILE);
        this.missileGroup.add(missile);
        
        missile.setScale(1);
        missile.setCollideWorldBounds(false);
        missile.body.allowGravity = false;


        missile.anims.play('fire');

        this.physics.velocityFromRotation(this.ship.rotation, 400, missile.body.velocity);
        this.physics.add.collider(this.asteroidGroup, this.missileGroup, this.onAsteroidHit, null, this);

        return missile;
    }

    onAsteroidHit(asteroid) {
        this.asteroidGroup.remove(asteroid, true, true);
    }

    handleInput(delta) {  
        // this.input.on('', 0);

        // ship thrust
        if (this.cursors.up.isDown) {
            this.ship.anims.play('move');
            this.physics.velocityFromRotation(this.ship.rotation, this.speedShip, this.ship.body.acceleration);
        } else {
            this.ship.anims.play('idle');
            this.ship.setAcceleration(0);
        }

        // ship rotation
        if (this.cursors.left.isDown)
            this.ship.setAngularVelocity(-this.rotationSpeedShip);
        else if (this.cursors.right.isDown)
            this.ship.setAngularVelocity(this.rotationSpeedShip);
        else
            this.ship.setAngularVelocity(0);

        this.ship.body.velocity.scale(0.95);
        this.ship.body.angularVelocity *= 0.95;


        // ship fire
        if (this.cursors.space.isDown && !this.isFiringShip) {
            this.isFiringShip = true;

            this.createMissile(this.ship.x, this.ship.y);

            this.timer = this.time.addEvent({
                delay: this.fireRate,
                callback: this.resetFiringState,
                callbackScope: this
            });
        }

    }
    
    resetFiringState() {
        this.isFiringShip = false;
    }

    random(limit, isInt=false) {
        const w = 32;
        const m = 2**w;
        const min = 0.01;
        const max = 0.99;
        const a = (Math.random() * (max - min) + min) * m;
        const r = new Date().getSeconds();
        
        const result = ((a*r + 1) % m) % limit;
        if (isInt) return Math.floor(result);
        return result;
    }
}
