import Phaser from "phaser";
import { reappearOnOtherSide } from "./utilities";


const SHIP = 'ship';


export default class Ship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, SHIP);

        const ship = scene.physics.add.sprite(x, y, SHIP);
        
        ship.setCollideWorldBounds(false);
        ship.body.allowGravity = false;
        
        this.speedShip = 400;
        this.rotationSpeedShip = 400;
        this.isFiringShip = false;
        this.fireRate = 200;

        this.createAnimationShip();
        this.isDestroyedShip = false;
    }

    static preload(scene) {
        scene.load.spritesheet(SHIP,
            'assets/ShipSpritesheet.png',
            { frameWidth: 38, frameHeight: 29 }
        );
    }

    createAnimationShip() {
        this.scene.anims.create({
            key: 'idle',
            frames: [ { key: SHIP, frame: 0 } ],
            frameRate: 1
        });
        this.scene.anims.create({
            key: 'move',
            frames: [ { key: SHIP, frame: 1 } ],
            frameRate: 1,
        });
    }

    update(time, delta) {
        reappearOnOtherSide(this);
    }
}
