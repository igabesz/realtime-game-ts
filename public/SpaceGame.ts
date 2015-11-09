export class SpaceGame {
    
	game: Phaser.Game;
    background: Phaser.TileSprite;
    ship: Phaser.Sprite;
    cursors: Phaser.CursorKeys;
    currentSpeed: number;
    enemies: EnemyShip[];
    enemiesTotal: number;
    enemiesAlive: number;
    enemyBullets: Phaser.Group;
    bullets: Phaser.Group;
    nextFire: number;
    fireRate: number;
	
	constructor() {
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update, render:this.render });
		
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload() {
        this.game.load.image("background", "images/tiled-space-bg.jpg");
        this.game.load.image("spaceship", "images/spaceship.png")
        this.game.load.image("bullet", "images/bullet.png")
    }
            
    create() {
        this.game.world.setBounds(-1000, -1000, 2000, 2000);
        
        this.background = this.game.add.tileSprite(0, 0, 800, 600, "background");
        this.background.fixedToCamera = true;
        
        this.ship = this.game.add.sprite(0, 0, "spaceship");
        this.ship.anchor.set(0.5,0.5)
        
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        
        this.ship.body.drag.set(0.2);
        this.ship.body.maxVelocity.set(400)
        this.ship.body.collideWorldBounds = true;
        
        this.enemyBullets = this.game.add.group();
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBullets.createMultiple(100, 'bullet'); 
        this.enemyBullets.setAll('anchor.x', 0.5);
        this.enemyBullets.setAll('anchor.y', 0.5);
        this.enemyBullets.setAll('outOfBoundsKill', true);
        this.enemyBullets.setAll('checkWorldBounds', true);
        
        this.enemiesTotal = 20;
        this.enemiesAlive = 20;
        
        this.enemies = [];
        for(let i=0; i<this.enemiesTotal; i++) {
            this.enemies.push(new EnemyShip(i, this.game, this.ship, this.enemyBullets));
        }
        
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
            
        this.nextFire = 0;
        this.fireRate = 100;
        
        this.ship.bringToTop();
        
        this.game.camera.follow(this.ship);
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);
    
        this.cursors = this.game.input.keyboard.createCursorKeys();

    }
    
    update() {
        this.game.physics.arcade.overlap(this.enemyBullets, this.ship, SpaceGame.prototype.bulletHitPlayer, null, this);
        
        this.enemiesAlive = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].alive) {
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.ship, this.enemies[i].ship);
                this.game.physics.arcade.overlap(this.bullets, this.enemies[i].ship, SpaceGame.prototype.bulletHitEnemy, null, this);
                this.enemies[i].update(this);
            }
        }
    
        if (this.cursors.left.isDown) {
            this.ship.angle -= 5;
        } else if (this.cursors.right.isDown) {
            this.ship.angle += 5;
        }
        
        if (this.cursors.up.isDown) {
            this.currentSpeed = 300;
        } else if (this.currentSpeed > 0) {
            this.currentSpeed -= 5;
        }
            
        if (this.currentSpeed > 0) {
            this.game.physics.arcade.velocityFromRotation(this.ship.rotation, this.currentSpeed, this.ship.body.velocity);
        }
        
        if (this.game.input.activePointer.isDown) {
            SpaceGame.prototype.fire(this);
        }
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
    }
    
    bulletHitPlayer (ship, bullet) {
        bullet.kill();
    }
    
    bulletHitEnemy (ship, bullet) {
        bullet.kill();
        let destroyed = this.enemies[ship.name].damage();
    }
    
    fire(spacegame) {
        if (spacegame.game.time.now > spacegame.nextFire && spacegame.bullets.countDead() > 0) {
            spacegame.nextFire = spacegame.game.time.now + spacegame.fireRate;
            let bullet:Phaser.Sprite = spacegame.bullets.getFirstExists(false);
            bullet.reset(spacegame.ship.x, spacegame.ship.y);
            bullet.rotation = spacegame.game.physics.arcade.moveToPointer(bullet, 1000, spacegame.game.input.activePointer, 500);
    } 
        }
    
    render() {
        this.game.debug.text('Active Bullets: ' + this.bullets.countLiving() + ' / ' + this.bullets.length, 32, 32);
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 50);
    }

}

class EnemyShip {
    
    game: Phaser.Game;
    ship: Phaser.Sprite;
    x: number;
    y: number;
    health = 3;
    player: Phaser.Sprite;
    bullets: Phaser.Group;
    fireRate: number;
    nextFire: number;
    alive: boolean;
    
    constructor(index, game, player, bullets) {
        this.game = game;
        
        this.x = this.game.world.randomX;
        this.y = this.game.world.randomY;
        this.health = 3;
        this.player = player;
        this.bullets = bullets;
        this.fireRate = 1000;
        this.nextFire = 0;
        this.alive = true;
        
        this.ship = this.game.add.sprite(this.x, this.y, 'spaceship');
        this.ship.anchor.set(0.5);
        
        this.ship.name = index.toString();
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.body.immovable = false;
        this.ship.body.collideWorldBounds = true;
        this.ship.body.bounce.setTo(1, 1);
        this.ship.angle = this.game.rnd.angle();
        this.game.physics.arcade.velocityFromRotation(this.ship.rotation, 100, this.ship.body.velocity);
    };
    
    update(spacegame) {
        if (this.game.physics.arcade.distanceBetween(this.ship, this.player) < 300) {
            if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                this.nextFire = this.game.time.now + this.fireRate;
                let bullet:Phaser.Sprite = this.bullets.getFirstDead();
                bullet.reset(this.ship.x, this.ship.y);
                bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
            }
        }
    }
    
    damage() {
        this.health -= 1;
        
        if (this.health <= 0) {
            this.alive = false;
            this.ship.kill();
            return true;
        }
        
        return false;
    }

};

/*
export class TitleScreenState extends Phaser.State {
        
    game: Phaser.Game;
		
    constructor() {
        super();
    }

    preload() {
        this.game.load.image("title", "images/space1.jpg");
    }
		
    create() {
        this.game.add.sprite(0, 0, "title");
        this.game.input.onTap.addOnce(this.titleClicked,this);
    }
		
    titleClicked (){
        this.game.state.start("GameRunningState");
    }
        
}

export class GameRunningState extends Phaser.State {
        
        constructor() {
            super();
        }

}
*/	
