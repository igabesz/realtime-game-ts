import { Ship } from './Ship';
import { SocketService } from '../SocketService';
import { Direction, KeyAction, MovementRequest, FireRequest } from '../../common/Movement';
import { POSITION_EVENT, SimulationResponse } from '../../common/Simulation'
import { PING_PONG_EVENT, PingRequest, PongResponse } from '../../common/Connection';
import { ShipType } from '../../common/GameObject';

export class SpaceGame {
    
	game: Phaser.Game;
    socketservice: SocketService;
    player: Ship;
    name: string;
    enemies: {[name: string]: Ship};
    
    background: Phaser.TileSprite;
    border: Phaser.Sprite;
    borderStop: number;
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
        
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update, render:this.render });
            
        let resizeTimer;
        window.onresize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {this.resizeGame();}, 100);
        };
            
        //this.game.state.add("TitleScreenState", TitleScreenState, false);
		//this.game.state.add("GameRunningState", GameRunningState, false);
		//this.game.state.start("TitleScreenState", true, true);
	}
    
    preload = () => {
        this.game.load.image("background", "images/tiled-space-bg.jpg");
        this.game.load.image("general", "images/spaceship.png");
        this.game.load.image("fast", "images/fast-spaceship.png")
        this.game.load.image("bullet", "images/bullet.png");
        this.game.load.image("border", "images/damage-border.png")
    }
            
    create = () => {
        let worldsize:{width:number, height:number} = {width: this.fieldsize.width*1.5, height: this.fieldsize.height*1.5};
        this.game.world.setBounds(-worldsize.width/2, -worldsize.height/2, worldsize.width, worldsize.height);
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, "background");
        this.background.fixedToCamera = true;
        
        this.border = this.game.add.sprite(0, 0, "border");
        this.border.width = this.game.width;
        this.border.height = this.game.height;
        this.border.fixedToCamera = true;
        this.border.alpha = 0;
              
        this.name = window.sessionStorage["user"];
        
        this.enemies = {};
        this.enemiesTotal = 0;
        this.enemiesAlive = 0;
        
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
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
        
        this.resizeGame();            
    }
    
    spaceDown = () => {
        let req:FireRequest = {action: KeyAction.pressed};
        this.socketservice.fire(req);
    }
    spaceUp = () => {
        let req:FireRequest = {action: KeyAction.released};
        this.socketservice.fire(req);
    }
    upDown = () => {
        let req:MovementRequest = {direction: Direction.up, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    upUp = () => {
        let req:MovementRequest = {direction: Direction.up, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    rightDown = () => {
        let req:MovementRequest = {direction: Direction.right, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    rightUp = () => {
        let req:MovementRequest = {direction: Direction.right, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    leftDown = () => {
        let req:MovementRequest = {direction: Direction.left, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    leftUp = () => {
        let req:MovementRequest = {direction: Direction.left, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    downDown = () => {
        let req:MovementRequest = {direction: Direction.down, action: KeyAction.pressed}; 
        this.socketservice.move(req);
    }
    downUp = () => {
        let req:MovementRequest = {direction: Direction.down, action: KeyAction.released}; 
        this.socketservice.move(req);
    }
    
    update = () => {        
        this.enemiesAlive = 0;
        for (let name in this.enemies) {
            let enemy = this.enemies[name];
            if (enemy.sprite.alive) {
                this.enemiesAlive++;
                this.game.physics.arcade.collide(this.player.sprite, enemy.sprite);
                this.game.physics.arcade.overlap(this.player.bullets, enemy.sprite, enemy.collideShipBullet, null, enemy);
                enemy.update();
            }
        }
        
        if(this.player) { //TODO
        if(this.player.sprite.alive) {
            this.player.update();
            if(this.player.sprite.position.x > this.fieldsize.width / 2 || this.player.sprite.position.x < -this.fieldsize.width / 2 ||
                this.player.sprite.position.y > this.fieldsize.height / 2 || this.player.sprite.position.y < -this.fieldsize.height / 2) {
                    this.player.damage(this.healthDecay);
            }
        }
        }
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
        
        if (this.game.time.now > this.borderStop) {
            this.game.add.tween(this.border).to({ alpha: 0 }, 200, Phaser.Easing.Linear.None, true);
        }
        
        this.ping();
    }
    
    ping = () => {
        let req:PingRequest = new PingRequest();
        this.socketservice.ping(req);
    }
    
    pong = (res:PongResponse) => {
        let time:Date = new Date(res.time.toString());
        let pingTime:number = Date.now() - time.getTime();
        console.info("RTT:", pingTime, "ms");
    }
    
    refreshGame = (res:SimulationResponse) => {
        for(let player of res.players) {
            let actual:Ship = null;
            if(player.name == this.name) {
                if(this.player == undefined) {
                    let sp:Phaser.Sprite = this.initializeSprite(ShipType[player.ship.type]);
                    this.player = new Ship(this, sp);
                    this.game.camera.follow(this.player.sprite);
                }
                actual = this.player;
            } else {
                actual = this.enemies[player.name];
                if(actual==undefined) {
                    let sp:Phaser.Sprite = this.initializeSprite(ShipType[player.ship.type]);
                    this.enemies[player.name] = new Ship(this, sp);
                    actual = this.enemies[player.name];
                }
            }
            if(actual.fireRate == undefined) {
                actual.sprite.body.acceleration = player.ship.acceleration;
                actual.sprite.body.angularAcceleration = player.ship.turnacc;
                actual.sprite.width = player.ship.width;
                actual.sprite.height = player.ship.length;
                actual.fireRate = player.ship.attackDelay;
            }
            actual.sprite.position.x = player.ship.position.x;
            actual.sprite.position.y = player.ship.position.y;
            actual.sprite.rotation = player.ship.position.angle;
            
            actual.speed = Math.sqrt(Math.pow(player.ship.speed.x,2)+Math.pow(player.ship.speed.y, 2));
            actual.sprite.body.angularVelocity = player.ship.speed.turn;
            actual.sprite.health = player.ship.health;
        }
        this.enemiesTotal = res.players.length-1;
        
        //todo: bullets
    }
    
    initializeSprite = (key) : Phaser.Sprite => {
        return this.game.add.sprite(this.game.rnd.integerInRange(-this.fieldsize.width/2, this.fieldsize.width/2),
                        this.game.rnd.integerInRange(-this.fieldsize.height/2, this.fieldsize.height/2), key);
    }
    
    resizeGame = () => {
        let containerStyle:CSSStyleDeclaration = window.getComputedStyle(document.getElementsByClassName("container")[0]);
        let width:number = window.innerWidth - (parseInt(containerStyle.marginLeft) + parseInt(containerStyle.marginRight) + 
                                                parseInt(containerStyle.paddingLeft) + parseInt(containerStyle.paddingRight));
        let height:number = 0.9*(window.innerHeight);
                                  
        //TODO:ez mind tuti kell?              
        this.game.canvas.width = width;
        this.game.canvas.height = height;
        this.game.stage.width = width;
        this.game.stage.height = height;
        this.game.scale.width = width;
        this.game.scale.height = height;
        this.game.scale.setGameSize(width, height);
        this.game.camera.setSize(width, height);
        this.game.renderer.resize(width, height);
        
        this.background.width = width;
        this.background.height = height;
        this.border.width = width;
        this.border.height = height;
    }
    
    damageEffect = () => {
        this.border.bringToTop();
        this.game.add.tween(this.border).to({ alpha: 0.4 }, 200, Phaser.Easing.Linear.None, true);
        this.borderStop = this.game.time.now + 500;
    }
    
    render = () => {
        if(this.player) { //TODO
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 30);
        this.game.debug.text('Health: ' + this.player.sprite.health.toFixed(), 32, 45);
        this.game.debug.text('Position: ' + this.player.sprite.position.x.toFixed() + ', ' + this.player.sprite.position.y.toFixed(), 32, 60);
        this.game.debug.text('Angle: ' + this.player.sprite.rotation.toFixed(3), 32, 75);
        this.game.debug.text('Speed: ' + this.player.speed.toFixed(3), 32, 90);
        this.game.debug.text('AngularVelocity: ' + this.player.sprite.body.angularVelocity.toFixed(3), 32, 105);
        }
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