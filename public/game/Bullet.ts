import { Ship } from './Ship';
export class Bullet {
    
    game: Phaser.Game;
    sprite: Phaser.Sprite;
    
    speed: number;
    damage: number;
    owner: Ship;
    
    constructor(game:Phaser.Game, sprite: Phaser.Sprite) {
        
        this.game = game;
        this.sprite = sprite;
        this.sprite.anchor.set(0.5);
        this.speed = 0;
        
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.immovable = false;
        this.sprite.checkWorldBounds = true;
        this.sprite.outOfBoundsKill = true;

        this.sprite.body.bounce.setTo(0, 0);
        this.sprite.angle = 0;
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
    }
    
    update() {
        if (this.speed > 0) {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        } else {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
        }
    }
	
	kill() {
		//TODO
	}
};