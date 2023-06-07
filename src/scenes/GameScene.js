import Phaser from 'phaser'


const ASTEROID = 'asteroid';


export default class HelloWorldScene extends Phaser.Scene {
	constructor() {
        super('game-scene')

        this.player = undefined;

    }

    preload() {
        this.load.image(ASTEROID, 'assets/Asteroid1.png');

    }

    create() {
        const logo = this.physics.add.image(400, 100, ASTEROID)

        logo.setVelocity(100, 200)
        logo.setBounce(1, 1)
        logo.setCollideWorldBounds(true)
    }
}
