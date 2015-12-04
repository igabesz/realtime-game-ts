import { SpaceGame } from './SpaceGame';

export class Ship {
    
    spaceGame: SpaceGame;
    game: Phaser.Game;
    sprite: Phaser.Sprite;
    speed: number;
    fireRate: number;
    nextFire: number;
    
    constructor(spacegame: SpaceGame, sprite: Phaser.Sprite) {
        
        this.spaceGame = spacegame;
        this.game = this.spaceGame.game;

        this.nextFire = 0;
        this.speed = 0;
        
        this.sprite = sprite;
        this.sprite.anchor.set(0.5);
        
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.immovable = false;
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.bounce.setTo(0, 0);
        this.sprite.angle = 0;
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
    }
    
    update() {
        //TODO: acceleration
        if (this.speed > 0) {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        } else {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
        }
    }
    
    collideShipBullet(ship, bullet) {
        bullet.destroy();
        this.damage(1);        
    }
    
    damage(amount: number) {
        this.sprite.health -= amount;
        
        if (this.sprite.health <= 0) {
            this.sprite.destroy();
        }
        
        this.spaceGame.damageEffect();
    }

};