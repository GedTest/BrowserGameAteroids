import Phaser, { Physics } from "phaser";


const ASTEROID = 'asteroid';


export default class Asteoid extends Phaser.GameObjects.GameObject {
    constructor(scene, location, speed, rank) {
        console.log('scene:' +scene);
        super(scene, 'asteroid');

        this.location = location;
        this.speed = speed;
        this.rank = rank;
    }

    move() {
        console.log(this);
        this.setVelocity(this.speed * this.rank);
        //this.body.setCollideWorldBounds(false);

        // ...
    }
}