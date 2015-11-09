export class SpaceGame {
		
	game: Phaser.Game;
    background: Phaser.TileSprite;
    ship: Phaser.Sprite;
    cursors: Phaser.CursorKeys;
	
	constructor() {
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update });
		
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload() {
        this.game.load.image("background", "images/tiled-space-bg.jpg");
        this.game.load.image("spaceship", "images/spaceship.png")
    }
            
    create() {
        this.game.world.setBounds(-1000, -1000, 2000, 2000);
        
        this.background = this.game.add.tileSprite(0, 0, 800, 600, "background");
        this.background.fixedToCamera = true;
        
        this.ship = this.game.add.sprite(0, 0, "spaceship");
        this.ship.anchor.set(0.5,0.5)
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.enable(this.ship);
        
        this.ship.body.drag.set(100);
        this.ship.body.maxVelocity.set(200);
        this.ship.body.collideWorldBounds = true;
        
        this.game.camera.follow(this.ship);
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);
    
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors.up.onDown.add(SpaceGame.prototype.start, this);
        this.cursors.up.onUp.add(SpaceGame.prototype.stop, this);
        this.cursors.left.onDown.add(SpaceGame.prototype.turnLeft, this);
        this.cursors.left.onUp.add(SpaceGame.prototype.stopTurning, this)
        this.cursors.right.onDown.add(SpaceGame.prototype.turnRight, this);
        this.cursors.right.onUp.add(SpaceGame.prototype.stopTurning, this)
    }
        
    start() {
        this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, 200, this.ship.body.acceleration);
    }
    stop() {
        this.ship.body.acceleration.set(0);
    }
    turnLeft() {
        this.ship.body.angularVelocity = -300;
    }
    turnRight() {
        this.ship.body.angularVelocity = 300;
    }
    stopTurning() {
        this.ship.body.angularVelocity = 0;
        this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, this.ship.body.speed, this.ship.body.acceleration);
    }
    
    update() {
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
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
