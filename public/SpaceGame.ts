export class SpaceGame {
		
	game: Phaser.Game;
    ship: Phaser.Sprite;
    W: Phaser.Key;
    A: Phaser.Key;
    S: Phaser.Key;
    D: Phaser.Key;
	
	constructor() {
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create});
		
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload() {
        this.game.load.image("background", "space1.jpg");
        this.game.load.image("spaceship", "spaceship.png")
    }
            
    create() {
        this.game.add.sprite(0, 0, "background");
        this.ship = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "spaceship");
        this.ship.anchor.set(0.5,0.5)
    
        this.W = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.D = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        
        //TODO: socketservice-t hívni
        this.W.onDown.add(() => { this.ship.position.add(0, -1); }, this);
        this.A.onDown.add(() => { this.ship.position.add(-1, 0); }, this);
        this.S.onDown.add(() => { this.ship.position.add(0, 1); }, this);
        this.D.onDown.add(() => { this.ship.position.add(1, 0); }, this);
    }
        
    moveLeft() {
        this.ship.position.add(-1, 0);
    }
    moveRight() {
        this.ship.position.add(1, 0);
    }
    moveUp() {
        this.ship.position.add(0, -1);
    }
    moveDown() {
        this.ship.position.add(0, 1);
    }

}

/*
export class TitleScreenState extends Phaser.State {
        
    game: Phaser.Game;
		
    constructor() {
        super();
    }

    preload() {
        this.game.load.image("title", "space1.jpg");
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
