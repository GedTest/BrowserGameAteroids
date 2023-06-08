import Phaser from 'phaser'
import Asteoid from './Asteroid';


const ASTEROID = 'asteroid';
const SHIP = 'ship';


export default class GameScene extends Phaser.Scene {
	constructor() {
        super('game-scene')

        
        // Asteroid
        this.locationAsteroid = undefined;
        this.directionAsteroid = undefined;
        this.rankAsteroid = undefined;
        this.speedAsteroid = 100;

        // Ship
        this.ship = undefined;
        this.speedShip = undefined;
        this.directionShip = undefined;

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
    }
    
    create() {
        this.screenSize = { x: this.sys.game.config.width, y: this.sys.game.config.height };
        //this.asteroid = new Asteoid(this, { x: 240, y: 240 }, { x: 1, y: 1 }, 1);
        
        
        for(let i = 0; i < this.asteroidsCount; i++) {
            const randX = this.random(1000, true) % this.screenSize.x;
            const randY = this.random(1000, true) % this.screenSize.y;

            const directionX = this.random(2, true) == 0 ? 1 : -1;
            const directionY = this.random(2, true) == 0 ? 1 : -1;
            
            this.asteroids.push(this.createAsteroid(randX, randY, { x: directionX, y: directionY }));
        }

        this.ship = this.createShip(200, 200);

        // creates basic control binding to Up, Down, Left, Right, Space, Shift
        this.cursors = this.input.keyboard.createCursorKeys();
        //this.input.keyboard.
    }
    
    update() {
        for (let a of this.asteroids){
            this.reappearOnOtherSide(a);
        }
        this.reappearOnOtherSide(this.ship);

        this.handleInput();
    }
    
    createAsteroid(x, y, direction) {
        const asteroid = this.physics.add.image(x, y, ASTEROID);

        this.directionAsteroid = direction;
        this.locationAsteroid = { x: 240, y: 240 };
        this.rankAsteroid = 1;
        asteroid.setVelocity(this.speedAsteroid * this.directionAsteroid.x * this.rankAsteroid, this.speedAsteroid * this.directionAsteroid.y * this.rankAsteroid);
        asteroid.setCollideWorldBounds(false);
        asteroid.body.allowGravity = false;

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
        
        this.speedShip = 40;
        this.directionShip = { x: 1, y: 0 };
        //this.ship.setAcceleration(2*this.directionShip.x, 2*this.directionShip.y);

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

    handleInput() {
        if (this.cursors.up.isDown) {
            this.ship.setVelocity(this.speedShip*this.directionShip.x, this.speedShip*this.directionShip.y);
            this.ship.setDamping(true);
            this.ship.setDrag(0.3);

            this.ship.anims.play('move');
        }
        else 
            this.ship.anims.play('idle');
        
        if (this.cursors.left.isDown) {
            this.ship.body.angle += 1;
        }
        
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
