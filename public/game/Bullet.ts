import { Ship } from './Ship';
import { Body } from './Body';

export class Bullet extends Body{
    
    damage: number;
    owner: Ship;
    
    constructor(game:Phaser.Game, sprite: Phaser.Sprite) {
        
        super(game, sprite);
        
        this.sprite.checkWorldBounds = true;
        this.sprite.outOfBoundsKill = true;

    }
    
    update() {
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        //this.game.physics.arcade.accelerationFromRotation(this.sprite.rotation, this.speed, this.sprite.body.acceleration);
    }
    
};