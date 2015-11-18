import { Ship } from './Ship';
import { SocketService } from '../SocketService';
import { Direction, KeyAction, MovementRequest, FireRequest } from '../../common/Movement';
import { SimulationResponse, POSITION_EVENT } from '../../common/Simulation'

export class SpaceGame {
    
    socketservice: SocketService;
	game: Phaser.Game;
    player: Ship;
    enemies: {[name: string]: Ship};
    
    background: Phaser.TileSprite;
    cursors: Phaser.CursorKeys;
    space: Phaser.Key;
    
    enemiesTotal: number;
    enemiesAlive: number;
	
	constructor(ss: SocketService) {
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update, render:this.render });
        
        this.socketservice = ss;
        //I can use the raw function, because Angular doesn't need to know about ship positions on the canvas.
        this.socketservice.addHandlerRaw(POSITION_EVENT, (res:SimulationResponse) => SpaceGame.prototype.refreshGame(this, res));
        
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
        
        this.enemies = {};
        for(let i=0; i<this.enemiesTotal; i++) {
            this.enemies[i.toString()] = new Ship(i, this.game);
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
        this.cursors.down.onDown.add(SpaceGame.prototype.downDown, this);
        this.cursors.down.onUp.add(SpaceGame.prototype.downUp, this);         
    }
    
    spaceDown() {
        this.player.cursors.fire = true;
        var req:FireRequest = {action: KeyAction.pressed};
        this.socketservice.fire(req);
    }
    spaceUp() {
        this.player.cursors.fire = false;
        var req:FireRequest = {action: KeyAction.released};
        this.socketservice.fire(req);
    }
    upDown() {
        this.player.cursors.up = true;
        var req:MovementRequest = {direction: Direction.up, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    upUp() {
        this.player.cursors.up = false;
        var req:MovementRequest = {direction: Direction.up, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    rightDown() {
        this.player.cursors.right = true;
        var req:MovementRequest = {direction: Direction.right, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    rightUp() {
        this.player.cursors.right = false;
        var req:MovementRequest = {direction: Direction.right, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    leftDown() {
        this.player.cursors.left = true;
        var req:MovementRequest = {direction: Direction.left, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    leftUp() {
        this.player.cursors.left = false;
        var req:MovementRequest = {direction: Direction.left, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    downDown() {
        this.player.cursors.down = true;
        var req:MovementRequest = {direction: Direction.down, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    downUp() {
        this.player.cursors.down = false;
        var req:MovementRequest = {direction: Direction.down, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    
    update() {        
        this.enemiesAlive = 0;
        for (var name in this.enemies) {
            var enemy = this.enemies[name];
            if (enemy.alive) {
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.player.sprite, enemy.sprite);
                this.game.physics.arcade.overlap(this.player.bullets, enemy.sprite, enemy.damage, null, enemy);
                enemy.update();
            }
        }
        
        this.player.update();
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
    }
    
    refreshGame(spacegame:SpaceGame, res:SimulationResponse) {

        
        
        //todo: bullets
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
