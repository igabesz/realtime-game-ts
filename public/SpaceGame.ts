export class SpaceGame {
		
	game: Phaser.Game;
    ship: Phaser.Sprite;
    Up: Phaser.Key;
    Left: Phaser.Key;
    Right: Phaser.Key;
	
	constructor() {
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create});
		
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload() {
        this.game.load.image("background", "images/space1.jpg");
        this.game.load.image("spaceship", "images/spaceship.png")
    }
            
    create() {
        this.game.add.sprite(0, 0, "background");
        this.ship = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "spaceship");
        this.ship.anchor.set(0.5,0.5)
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.enable(this.ship);
        
        this.ship.body.drag.set(100);
        this.ship.body.maxVelocity.set(200);
    
        this.Up = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.Left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.Right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        
        //TODO: socketservice-t hivni
        //TODO: prototype...
        this.Up.onDown.add(SpaceGame.prototype.start, this);
        this.Up.onUp.add(SpaceGame.prototype.stop, this);
        this.Left.onDown.add(SpaceGame.prototype.turnLeft, this);
        this.Left.onUp.add(SpaceGame.prototype.stopTurning, this)
        this.Right.onDown.add(SpaceGame.prototype.turnRight, this);
        this.Right.onUp.add(SpaceGame.prototype.stopTurning, this)
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
