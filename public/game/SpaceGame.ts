import { Ship } from './Ship';

export class SpaceGame {
    
	game: Phaser.Game;
    player: Ship;
    enemies: Ship[];
    
    background: Phaser.TileSprite;
    cursors: Phaser.CursorKeys;
    space: Phaser.Key;
    
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
        
        this.player = new Ship(99, this.game);
        
        this.enemiesTotal = 10;
        this.enemiesAlive = this.enemiesTotal;
        
        this.enemies = [];
        for(let i=0; i<this.enemiesTotal; i++) {
            this.enemies.push(new Ship(i, this.game));
        }

        this.player.sprite.bringToTop();
        
        this.game.camera.follow(this.player.sprite);
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);
    
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.space.onDown.add(SpaceGame.prototype.spaceDown, this);
        this.space.onUp.add(SpaceGame.prototype.spaceUp, this);
        this.cursors.up.onDown.add(SpaceGame.prototype.upDown, this);
        this.cursors.up.onUp.add(SpaceGame.prototype.upUp, this);
        this.cursors.right.onDown.add(SpaceGame.prototype.rightDown, this);
        this.cursors.right.onUp.add(SpaceGame.prototype.rightUp, this);
        this.cursors.left.onDown.add(SpaceGame.prototype.leftDown, this);
        this.cursors.left.onUp.add(SpaceGame.prototype.leftUp, this);        
    }
    
    spaceDown() {
        this.player.cursors.fire = true;
    }
    spaceUp() {
        this.player.cursors.fire = false;
    }
    upDown() {
        this.player.cursors.up = true;
    }
    upUp() {
        this.player.cursors.up = false;
    }
    rightDown() {
        this.player.cursors.right = true;
    }
    rightUp() {
        this.player.cursors.right = false;
    }
    leftDown() {
        this.player.cursors.left = true;
    }
    leftUp() {
        this.player.cursors.left = false;
    }
    
    update() {        
        this.enemiesAlive = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].alive) {
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.player.sprite, this.enemies[i].sprite);
                this.game.physics.arcade.overlap(this.player.bullets, this.enemies[i].sprite, this.enemies[i].damage, null, this.enemies[i]);
                this.enemies[i].update();
            }
        }
        
        this.player.update();
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
    }
    
    render() {
        //debugging info
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 32);
        this.game.debug.text('Health: ' + this.player.health + ' / ' + 3, 32, 50);
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
