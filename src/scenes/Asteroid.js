import Phaser from "phaser";
import { random } from './utilities';


const ASTEROID = 'asteroid';


export default class Asteroid extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, rank) {
        super(scene, x, y, ASTEROID)

        this.rank = rank;
        

        let a = random(3, true);
        const letter = a === 0 ? 'A' : ( a === 1 ? 'B' : 'C');
        const asteroid = scene.physics.add.image(x, y, 'ASTEROID_TYPE_' + letter);
        
        asteroid.setScale(this.rank/3);
        
        const directionX = random(2, true) == 0 ? 1 : -1;
        const directionY = random(2, true) == 0 ? 1 : -1;
        
        const speed = 80 / (this.rank) - this.rank*5;
        
        asteroid.setVelocity(speed * directionX * this.rank, speed * directionY * this.rank);
        asteroid.setCollideWorldBounds(false);
        asteroid.body.allowGravity = false;
    }

    static preload(scene) {
        scene.load.image('ASTEROID_TYPE_A', 'assets/Asteroid1.png');
        scene.load.image('ASTEROID_TYPE_B', 'assets/Asteroid2.png');
        scene.load.image('ASTEROID_TYPE_C', 'assets/Asteroid3.png');
    }
}
