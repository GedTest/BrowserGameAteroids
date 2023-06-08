import Phaser from 'phaser'
import Asteoid from './Asteroid';


const ASTEROID = 'asteroid';


export default class GameScene extends Phaser.Scene {
	constructor() {
        super('game-scene')

        
        // Asteroid
        this.locationAsteroid = undefined;
        this.directionAsteroid = undefined;
        this.rankAsteroid = undefined;
        this.speedAsteroid = 100;

        this.asteroids = [];
        this.asteroidsCount = 4;
    }
    
    preload() {
        this.load.image(ASTEROID, 'assets/Asteroid1.png');  
        
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
    }
    
    update() {
        for (let a of this.asteroids){
            this.reappearOnOtherSide(a);
        }

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
