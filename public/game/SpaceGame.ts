import { Ship } from './Ship';
import { SocketService } from '../SocketService';
import { Direction, KeyAction, MovementRequest, FireRequest } from '../../common/Movement';
import { SimulationResponse, POSITION_EVENT } from '../../common/Simulation'

export class SpaceGame {
    
	game: Phaser.Game;
    socketservice: SocketService;
    player: Ship;
    name: string;
    enemies: {[name: string]: Ship};
    
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
        
        this.player = new Ship(this.game);
        this.name = window.sessionStorage["user"];
        
        this.enemies = {};
        this.enemiesTotal = 0;
        this.enemiesAlive = 0;
        
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.game.camera.follow(this.player.sprite);
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);

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
        
        this.socketservice = (<any>window).socketservice;
        //I can use the raw function, because Angular doesn't need to know about ship positions on the canvas.
        this.socketservice.addHandlerRaw(POSITION_EVENT, (res:SimulationResponse) => SpaceGame.prototype.refreshGame(this, res));         
    }
    
    spaceDown() {
        var req:FireRequest = {action: KeyAction.pressed};
        this.socketservice.fire(req);
    }
    spaceUp() {
        var req:FireRequest = {action: KeyAction.released};
        this.socketservice.fire(req);
    }
    upDown() {
        var req:MovementRequest = {direction: Direction.up, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    upUp() {
        var req:MovementRequest = {direction: Direction.up, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    rightDown() {
        var req:MovementRequest = {direction: Direction.right, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    rightUp() {
        var req:MovementRequest = {direction: Direction.right, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    leftDown() {
        var req:MovementRequest = {direction: Direction.left, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    leftUp() {
        var req:MovementRequest = {direction: Direction.left, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    downDown() {
        var req:MovementRequest = {direction: Direction.down, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    downUp() {
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
        for(var player of res.players) {
            var actual:Ship = null;
            if(player.name == spacegame.name) {
                actual = spacegame.player;
            } else {
                actual = spacegame.enemies[player.name];
                if(actual==undefined) {
                    spacegame.enemies[player.name] = new Ship(spacegame.game);
                    actual = spacegame.enemies[player.name];
                    actual.sprite.acceleration = player.ship.acceleration;
                    actual.sprite.angularAcceleration = player.ship.turnacc;
                }
            }
            //position
            actual.sprite.position.x = player.ship.position.x;
            actual.sprite.position.y = player.ship.position.y;
            actual.sprite.rotation = player.ship.position.angle;
            
            actual.speed = Math.sqrt(Math.pow(player.ship.speed.x,2)+Math.pow(player.ship.speed.y, 2));
            actual.sprite.angularVelocity = player.ship.speed.turn;
            actual.health = player.ship.health;
        }
        spacegame.enemiesTotal = res.players.length-1;
        
        //todo: bullets
    }
    
    render() {
        //debugging info
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 30);
        this.game.debug.text('Health: ' + this.player.health, 32, 45);
        this.game.debug.text('Position: ' + this.player.sprite.position.x + ', ' + this.player.sprite.position.y, 32, 60);
        this.game.debug.text('Angle: ' + this.player.sprite.rotation, 32, 75);
        this.game.debug.text('Speed: ' + this.player.speed, 32, 90);
        this.game.debug.text('AngularVelocity: ' + this.player.sprite.angularVelocity, 32, 105);
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
