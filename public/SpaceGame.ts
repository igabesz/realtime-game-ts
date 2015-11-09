import { Ship } from './Ship';

export class SpaceGame {
    
	game: Phaser.Game;
    background: Phaser.TileSprite;
    ship: Ship;
    cursors: Phaser.CursorKeys;
    space: Phaser.Key;
    enemies: Ship[];
    enemiesTotal: number;
    enemiesAlive: number;
	
	constructor() {
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update, render:this.render });
		
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload() {
        this.game.load.image("background", "images/tiled-space-bg.jpg");
        this.game.load.image("spaceship", "images/spaceship.png");
        this.game.load.image("bullet", "images/bullet.png");
    }
            
    create() {
        this.game.world.setBounds(-1000, -1000, 2000, 2000);
        
        this.background = this.game.add.tileSprite(0, 0, 800, 600, "background");
        this.background.fixedToCamera = true;
        
        this.ship = new Ship(99, this.game);
        
        this.enemiesTotal = 10;
        this.enemiesAlive = this.enemiesTotal;
        
        this.enemies = [];
        for(let i=0; i<this.enemiesTotal; i++) {
            this.enemies.push(new Ship(i, this.game));
        }

        this.ship.sprite.bringToTop();
        
        this.game.camera.follow(this.ship.sprite);
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);
    
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    }
    
    update() {
        //TODO this.game.physics.arcade.overlap(this.enemyBullets, this.ship, SpaceGame.prototype.bulletHitPlayer, null, this);
        
        this.enemiesAlive = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].alive) {
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.ship.sprite, this.enemies[i].sprite);
                this.game.physics.arcade.overlap(this.ship.bullets, this.enemies[i].sprite, SpaceGame.prototype.bulletHitEnemy, null, this);
                this.enemies[i].update();
            }
        }
        
        if (this.cursors.left.isDown) {
            this.ship.cursors.left = true;
        } else {
            this.ship.cursors.left = false;
        }
        if (this.cursors.right.isDown) {
            this.ship.cursors.right = true;
        } else {
            this.ship.cursors.right = false;
        }
        if (this.cursors.up.isDown) {
            this.ship.cursors.up = true;
        } else {
            this.ship.cursors.up = false;
        }
        if (this.space.isDown) {
            this.ship.cursors.fire = true;
        } else {
            this.ship.cursors.fire = false;
        }
        
        this.ship.update();
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
    }
    
    bulletHitPlayer (ship, bullet) {
        bullet.kill();
    }
    
    bulletHitEnemy (ship, bullet) {
        bullet.kill();
        let destroyed = this.enemies[ship.id].damage();
    }
    
    render() {
        this.game.debug.text('Active Bullets: ' + this.ship.bullets.countLiving() + ' / ' + this.ship.bullets.length, 32, 32);
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 50);
    }

}

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
