import Phaser from 'phaser'


import GameScene from './scenes/GameScene'


const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			//debug: true
		}
	},
	scene: [GameScene]
}
// create new game, pass the configuration
export default new Phaser.Game(config)
