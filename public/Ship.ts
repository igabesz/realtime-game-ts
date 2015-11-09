export class Ship {
    
    game: any;
    sprite: any;
    speed: number;
    health = 3;
    bullets: any;
    fireRate: number;
    nextFire: number;
    alive: boolean;
    cursors:any;
    
    constructor(index, game) {
        
        this.cursors = {
            left:false,
            right:false,
            up:false,
            fire:false		
        }
        
        this.game = game;

        this.health = 3;
        this.fireRate = 500;
        this.nextFire = 0;
        this.alive = true;
        this.speed = 0;
        
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
        
        this.sprite = this.game.add.sprite(this.game.world.randomX, this.game.world.randomY, 'spaceship');
        this.sprite.anchor.set(0.5);
        
        this.sprite.id = index;
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.immovable = false;
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.bounce.setTo(0, 0);
        this.sprite.angle = 0;
        this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
    }
    
    update() {        
        if (this.cursors.left) {
            this.sprite.angle -= 5;
        } else if (this.cursors.right) {
            this.sprite.angle += 5;
        }
        
        if (this.cursors.up) {
            this.speed = 300;
        } else if (this.speed > 0) {
            this.speed -= 5;
        }
        
        if (this.speed > 0) {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, this.speed, this.sprite.body.velocity);
        } else {
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
        }
        
        if (this.cursors.fire) {
            this.fire();
        }   
    }
    
    fire() {
        if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.sprite.x, this.sprite.y);
			bullet.rotation = this.sprite.rotation;
            this.game.physics.arcade.velocityFromRotation(this.sprite.rotation, 400, bullet.body.velocity);
        }
    }
    
    damage() {
        this.health -= 1;
        
        if (this.health <= 0) {
            this.kill();
            return true;
        }
        
        return false;
    }
    
    kill() {
        this.alive = false;
        this.sprite.kill();
    }

};