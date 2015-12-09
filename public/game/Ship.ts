import { SpaceGame } from './SpaceGame';
import { Body } from './Body'

export class Ship extends Body {
    
    spaceGame: SpaceGame;
    
    constructor(spacegame: SpaceGame, sprite: Phaser.Sprite) {
        
        super(spacegame.game, sprite);
        
        this.spaceGame = spacegame;
        
        this.sprite.body.collideWorldBounds = true;
    }
    
    update() {
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        //this.game.physics.arcade.accelerationFromRotation(this.sprite.rotation, this.speed, this.sprite.body.acceleration);
        
        //This check should only be in the damage() function.
        //I included it here (temporarily) because, usually the server detects collision
        //much earlier, than the client does. So the client's damage() method has no
        //chance to run and start the explosion. Hence the check here.
        if (this.sprite.health <= 0) {
            this.explode();
            this.kill();
        }
    }
    
    damage(amount: number) {
        this.sprite.health -= amount;
        
        if (this.sprite.health <= 0) {
            this.explode();
            this.kill();
        }
        
        if(this.spaceGame.client.player == this) {
            this.spaceGame.damageEffect();
        }
    }
    
    explode() {
        let explosion = this.game.add.sprite(this.sprite.position.x, this.sprite.position.y, 'explosion');
        explosion.anchor.set(0.5);
        explosion.width = 100;
        explosion.height = 100;
        explosion.animations.add('explode');
        explosion.animations.play('explode', 30, false, true);
    } 

};