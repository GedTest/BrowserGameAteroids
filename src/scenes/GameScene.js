import Phaser from 'phaser'
import Asteroid from './Asteroid';
import ScoreLabel from '../ui/ScoreLabel';
import { random, reappearOnOtherSide, getScreenSize } from './utilities';
import Ship from './Ship';


const SHIP = 'ship';
const MISSILE = 'missile';


export default class GameScene extends Phaser.Scene {
	constructor() {
        super('game-scene')

        // Ship
        this.ship = undefined;
        this.speedShip = undefined;
        this.rotationSpeedShip = undefined;
        this.isFiringShip = undefined;
        this.fireRate = undefined;
        this.timer = undefined;
        this.isDestroyedShip = undefined;

        // sound effects
        this.thrustSound = undefined;
        this.fireSound = undefined;
        this.explosionSound = undefined;

        this.cursors = undefined;
        this.scoreLabel = undefined;
    }
    
    preload() {
        Asteroid.preload(this);
        Ship.preload(this);

        this.load.spritesheet(MISSILE,
            'assets/MissileSpritesheet.png',
            { frameWidth: 16, frameHeight: 14 }
        );

        this.load.audio('fireSFX', 'assets/fire.wav');
        this.load.audio('thrustSFX', 'assets/thrust.wav');
        this.load.audio('explosionSFX', 'assets/explosion.wav');

    }
    
    create() {
        this.ship = this.createShip(200, 200);
        //this.ship = new Ship(this, 200, 200);

        this.asteroidGroup = this.physics.add.group();
        this.missileGroup = this.physics.add.group();

        this.spawnMultipleAsteroids(4);
        
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

        this.scoreLabel = this.createScoreLabel(16, 16, 0);

        this.thrustSound = this.sound.add('thrustSFX');
        this.thrustSound.setVolume(2);
        this.fireSound = this.sound.add('fireSFX');
        this.explosionSound = this.sound.add('explosionSFX');
    }
    
    update(time, delta) {
        if (!this.isDestroyedShip)
            this.handleInput(delta);

        for (let asteroid of this.asteroidGroup.getChildren())
            reappearOnOtherSide(asteroid);

        if (this.asteroidGroup.getLength() === 0)
            this.spawnMultipleAsteroids(4);

        reappearOnOtherSide(this.ship);

        // destroying missilies outside of Screen
        this.missileGroup.getChildren().forEach((c) => {
            if ( c.x > getScreenSize().x || c.x < 0 ||
                 c.y > getScreenSize().y || c.y < 0 ) {
                this.missileGroup.remove(c, true, true);
            }
        });
    }
    
    createAsteroid(x, y, rank) {
        let a = random(3, true);
        const letter = a === 0 ? 'A' : ( a === 1 ? 'B' : 'C') ;
        const asteroid = this.physics.add.image(x, y, 'ASTEROID_TYPE_' + letter);
        this.asteroidGroup.add(asteroid);

        asteroid.setScale(rank/3);

        const directionX = random(2, true) == 0 ? 1 : -1;
        const directionY = random(2, true) == 0 ? 1 : -1;

        const speed = 80 / (rank) - rank*5;

        asteroid.setVelocity(speed * directionX * rank, speed * directionY * rank);
        asteroid.setCollideWorldBounds(false);
        asteroid.body.allowGravity = false;
        
        asteroid.setData('rank', rank);
        this.physics.add.collider(this.ship, asteroid, this.onShipHit, null, this);

        return asteroid;
    }

    spawnMultipleAsteroids(asteroidsCount) {
        this.screenSize = getScreenSize();

        for(let i = 0; i < asteroidsCount; i++) {
            const randX = random(1000, true) % this.screenSize.x;
            const randY = random(1000, true) % this.screenSize.y;

            //const asteroid = new Asteroid(this, randX, randY, 3);
            //this.asteroidGroup.add(asteroid);
            
            const asteroid = this.createAsteroid(randX, randY, 3);
            this.physics.add.collider(this.ship, asteroid, this.onShipHit, null, this);
        }
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
        this.isDestroyedShip = false;

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
        ship.setVisible(false);
        ship.disableBody(true, true);
        this.isDestroyedShip = true;

        this.explosionSound.play();

        this.restartTimer = this.time.addEvent({
            delay: 3000,
            callback: this.restart,
            callbackScope: this
        });
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

        this.fireSound.play();

        return missile;
    }

    onAsteroidHit(asteroid, missile) {
        this.missileGroup.remove(missile, true, true);

        this.explosionSound.play();
        
        if (asteroid.getData('rank')-1 > 0) {
            for(let i = 0; i < 2; i++) {
                let offset = i*30;

                const newAsteroid = this.createAsteroid(asteroid.x+offset, asteroid.y+offset, asteroid.getData('rank')-1);
                //const newAsteroid = new Asteroid(this, asteroid.x+offset, asteroid.y+offset, asteroid.rank-1);
                this.physics.add.collider(this.ship, newAsteroid, this.onShipHit, null, this);
            }
        }
        
        const score = 60 / asteroid.getData('rank') + ((3 - asteroid.getData('rank'))*20);
        this.scoreLabel.add(score);

        this.asteroidGroup.remove(asteroid, true, true);
    }

    handleInput(delta) {
        // ship thrust
        if (this.cursors.up.isDown) {
            this.ship.anims.play('move');
            this.physics.velocityFromRotation(this.ship.rotation, this.speedShip, this.ship.body.acceleration);
            if (!this.thrustSound.isPlaying)
                this.thrustSound.play();
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

    createScoreLabel(x, y, score) {
        const style = { fontSize: '32px', fill: '#FFF' };
        const label = new ScoreLabel(this, x, y, score, style);
        
        this.add.existing(label);
        return label;
    }

    restart() {
        this.scene.restart();
    }
    
    resetFiringState() {
        this.isFiringShip = false;
    }
}
