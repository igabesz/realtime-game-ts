import { SpaceGame } from './SpaceGame';

export abstract class Body {
    
    game: Phaser.Game;
    
    sprite: Phaser.Sprite;
    speed: number;
    
    constructor(game: Phaser.Game, sprite: Phaser.Sprite) {
        
        this.game = game;

        this.sprite = sprite;
        this.sprite.anchor.set(0.5);
        
        this.speed = 0;
        this.sprite.rotation = 0;
        
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.immovable = false;
        
        this.sprite.body.bounce.setTo(0, 0);

        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
    }
    
    update() {
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        this.game.physics.arcade.accelerationFromRotation(this.sprite.rotation, this.speed, this.sprite.acceleration);
    }
    
    kill() {
        this.sprite.destroy();
    }

};