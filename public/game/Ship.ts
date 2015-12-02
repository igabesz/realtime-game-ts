import { SpaceGame } from './SpaceGame';

export class Ship {
    
    spaceGame: SpaceGame;
    game: Phaser.Game;
    sprite: Phaser.Sprite;
    speed: number;
    //TODO not any
    bullets: any;
    fireRate: number;
    nextFire: number;
    
    constructor(spacegame: SpaceGame, sprite: Phaser.Sprite) {
        
        this.spaceGame = spacegame;
        this.game = this.spaceGame.game;

        this.nextFire = 0;
        this.speed = 0;
        
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
        
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
        /*        
        if (this.cursors.fire) {
            this.fire();
        }
        */
        //alive?
        //TODO: acceleration
        if (this.speed > 0) {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        } else {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
        }
    }
    
    fire() {
        if (!this.sprite.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.sprite.x, this.sprite.y);
			bullet.rotation = this.sprite.rotation;
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 400, bullet.body.velocity);
        }
    }
    
    collideShipBullet(ship, bullet) {
        bullet.kill();
        this.damage(1);        
    }
    
    damage(amount: number) {
        this.sprite.health -= amount;
        
        if (this.sprite.health <= 0) {
            this.sprite.kill();
        }
        
        this.spaceGame.damageEffect();
    }

};