import { Ship } from './Ship';
import { SocketService } from '../SocketService';
import { Direction, KeyAction, MovementRequest, FireRequest } from '../../common/Movement';
import { POSITION_EVENT, SimulationResponse } from '../../common/Simulation'
import { PING_PONG_EVENT, PingRequest, PongResponse } from '../../common/Connection';

export class SpaceGame {
    
	game: Phaser.Game;
    socketservice: SocketService;
    player: Ship;
    name: string;
    enemies: {[name: string]: Ship};
    
    background: Phaser.TileSprite;
    cursors: Phaser.CursorKeys;
    space: Phaser.Key;
    fieldsize: {width: number, height: number};
    healthDecay: number;
    
    enemiesTotal: number;
    enemiesAlive: number;
	
	constructor(socketservice: SocketService, roomsize: {width:number, height:number}, healthDecay: number) {
        this.socketservice = socketservice;
        this.fieldsize = roomsize;
        this.healthDecay = healthDecay;
        
        var resizeTimer;
        window.onresize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {this.resizeGame();}, 100);
        };
        
        //TODO
        let containerStyle:CSSStyleDeclaration = window.getComputedStyle(document.getElementsByClassName("container")[0]);
        let width:number = window.innerWidth - (parseInt(containerStyle.marginLeft) + parseInt(containerStyle.marginRight) + 
                                                parseInt(containerStyle.paddingLeft) + parseInt(containerStyle.paddingRight));
        let headerStyle:CSSStyleDeclaration = window.getComputedStyle(document.getElementsByClassName("page-header")[0]);
        let height:number = 0.95*(window.innerHeight - (parseInt(headerStyle.height) + parseInt(headerStyle.marginTop) + 
                                                parseInt(headerStyle.marginBottom)));
        
		this.game = new Phaser.Game(width, height, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update, render:this.render });
            
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload = () => {
        this.game.load.image("background", "images/tiled-space-bg.jpg");
        this.game.load.image("spaceship", "images/spaceship.png");
        this.game.load.image("bullet", "images/bullet.png");
    }
            
    create = () => {
        let worldsize:{width:number, height:number} = {width: this.fieldsize.width*1.5, height: this.fieldsize.height*1.5};
        this.game.world.setBounds(-worldsize.width/2, -worldsize.height/2, worldsize.width, worldsize.height);
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, "background");
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

        this.space.onDown.add(this.spaceDown, this);
        this.space.onUp.add(this.spaceUp, this);
        this.cursors.up.onDown.add(this.upDown, this);
        this.cursors.up.onUp.add(this.upUp, this);
        this.cursors.right.onDown.add(this.rightDown, this);
        this.cursors.right.onUp.add(this.rightUp, this);
        this.cursors.left.onDown.add(this.leftDown, this);
        this.cursors.left.onUp.add(this.leftUp, this);
        
        this.cursors.down.onDown.add(this.downDown, this);
        this.cursors.down.onUp.add(this.downUp, this);  
        
        //adding handlers here, because they should not be called before proper inicialization
        this.socketservice.addHandlerRaw(POSITION_EVENT, (res:SimulationResponse) => this.refreshGame(res));
        this.socketservice.addHandlerRaw(PING_PONG_EVENT, (res:PongResponse) => this.pong(res));              
    }
    
    spaceDown = () => {
        var req:FireRequest = {action: KeyAction.pressed};
        this.socketservice.fire(req);
    }
    spaceUp = () => {
        var req:FireRequest = {action: KeyAction.released};
        this.socketservice.fire(req);
    }
    upDown = () => {
        var req:MovementRequest = {direction: Direction.up, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    upUp = () => {
        var req:MovementRequest = {direction: Direction.up, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    rightDown = () => {
        var req:MovementRequest = {direction: Direction.right, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    rightUp = () => {
        var req:MovementRequest = {direction: Direction.right, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    leftDown = () => {
        var req:MovementRequest = {direction: Direction.left, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    leftUp = () => {
        var req:MovementRequest = {direction: Direction.left, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    downDown = () => {
        var req:MovementRequest = {direction: Direction.down, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    downUp = () => {
        var req:MovementRequest = {direction: Direction.down, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    
    update = () => {        
        this.enemiesAlive = 0;
        for (var name in this.enemies) {
            var enemy = this.enemies[name];
            if (enemy.sprite.alive) {
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.player.sprite, enemy.sprite);
                this.game.physics.arcade.overlap(this.player.bullets, enemy.sprite, enemy.damage, null, enemy);
                enemy.update();
            }
        }
        
        this.player.update();
        if(this.player.sprite.position.x > this.fieldsize.width / 2 || this.player.sprite.position.x < -this.fieldsize.width / 2 ||
			this.player.sprite.position.y > this.fieldsize.height / 2 || this.player.sprite.position.y < -this.fieldsize.height / 2) {
				this.player.sprite.health -= this.healthDecay;
		}
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
        
        this.ping();
    }
    
    ping = () => {
        var req:PingRequest = new PingRequest();
        this.socketservice.ping(req);
    }
    
    pong = (res:PongResponse) => {
        var time:Date = new Date(res.time.toString());
        var pingTime:number = Date.now() - time.getTime();
        console.info("RTT:", pingTime, "ms");
    }
    
    refreshGame = (res:SimulationResponse) => {
        for(var player of res.players) {
            var actual:Ship = null;
            if(player.name == this.name) {
                actual = this.player;
            } else {
                actual = this.enemies[player.name];
                if(actual==undefined) {
                    this.enemies[player.name] = new Ship(this.game);
                    actual = this.enemies[player.name];
                }
            }
            if(actual.fireRate == undefined) {
                    actual.sprite.acceleration = player.ship.acceleration;
                    actual.sprite.angularAcceleration = player.ship.turnacc;
                    actual.sprite.width = player.ship.width;
                    actual.sprite.height = player.ship.length;
                    actual.fireRate = player.ship.attackDelay;
            }
            actual.sprite.position.x = player.ship.position.x;
            actual.sprite.position.y = player.ship.position.y;
            actual.sprite.rotation = player.ship.position.angle;
            
            actual.speed = Math.sqrt(Math.pow(player.ship.speed.x,2)+Math.pow(player.ship.speed.y, 2));
            actual.sprite.angularVelocity = player.ship.speed.turn;
            actual.sprite.health = player.ship.health;
        }
        this.enemiesTotal = res.players.length-1;
        
        //todo: bullets
    }
    
    resizeGame = () => {
        let containerStyle:CSSStyleDeclaration = window.getComputedStyle(document.getElementsByClassName("container")[0]);
        let width:number = window.innerWidth - (parseInt(containerStyle.marginLeft) + parseInt(containerStyle.marginRight) + 
                                                parseInt(containerStyle.paddingLeft) + parseInt(containerStyle.paddingRight));
        let headerStyle:CSSStyleDeclaration = window.getComputedStyle(document.getElementsByClassName("page-header")[0]);
        let height:number = 0.95*(window.innerHeight - (parseInt(headerStyle.height) + parseInt(headerStyle.marginTop) + 
                                                parseInt(headerStyle.marginBottom)));
                                                
        this.game.canvas.width = width;
        this.game.canvas.height = height;
        this.game.stage.width = width;
        this.game.stage.height = height;
        this.game.scale.width = width;
        this.game.scale.height = height;
        this.game.scale.setGameSize(width, height);
        this.game.camera.setSize(width, height);
        this.game.renderer.resize(width, height);
        //TODO
        let bg = (<Phaser.TileSprite>this.game.world.children[0])
        bg.width = width;
        bg.height = height;
    }
    
    render = () => {
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 30);
        this.game.debug.text('Health: ' + this.player.sprite.health, 32, 45);
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