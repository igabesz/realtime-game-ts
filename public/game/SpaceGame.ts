import { Ship } from './Ship';
import { Bullet } from './Bullet';
import { Client } from './Client';
import { PositionListener } from './PositionListener';
import { SocketService } from '../SocketService';
import { Direction, KeyAction, MovementRequest, FireRequest } from '../../common/Movement';
import { POSITION_EVENT, SimulationResponse } from '../../common/Simulation'
import { PING_PONG_EVENT, PingRequest, PongResponse } from '../../common/Connection';

export class SpaceGame {
    
	game: Phaser.Game;
    socketservice: SocketService;
    client: Client;
    listener: PositionListener;
    
    enemies: {[name: string]: Ship};
    playerGroup: Phaser.Group;
    bullets: {[ID: number]: Bullet};
    bulletGroup: Phaser.Group;
    
    background: Phaser.TileSprite;
    border: Phaser.Sprite;
    borderStop: number;
    cursors: Phaser.CursorKeys;
    space: Phaser.Key;
    fieldsize: {width: number, height: number};
    healthDecay: number;
    
    enemiesTotal: number;
    enemiesAlive: number;
    bulletCount: number;
	
	constructor(socketservice: SocketService, roomsize: {width:number, height:number}, healthDecay: number) {
        this.socketservice = socketservice;
        this.fieldsize = roomsize;
        this.healthDecay = healthDecay;
        
        let name = window.sessionStorage["user"];
        this.client = new Client(name);
        
        this.listener = new PositionListener(this);
        
		this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {preload: this.preload, create: this.create,
            update:this.update, render:this.render });
	}
    
    preload = () => {
        this.game.load.image("background", "images/tiled-space-bg.jpg");
        this.game.load.image("general", "images/spaceship.png");
        this.game.load.image("fast", "images/fast-spaceship.png")
        this.game.load.image("bullet", "images/bullet.png");
        this.game.load.image("border", "images/damage-border.png");
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
              
        this.enemies = {};
        this.enemiesTotal = 0;
        this.enemiesAlive = 0;
        this.playerGroup = this.game.add.group();
        
        this.bullets = {};
        this.bulletCount = 0;
        this.bulletGroup = this.game.add.group();
        
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
        this.socketservice.addHandlerRaw(POSITION_EVENT, (res:SimulationResponse) => this.listener.refreshGame(res));
        this.socketservice.addHandlerRaw(PING_PONG_EVENT, (res:PongResponse) => this.pong(res));
        
        let resizeTimer;
        window.onresize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {this.resizeGame();}, 100);
        };
        
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
        
        this.game.physics.arcade.collide(this.bulletGroup, this.bulletGroup, this.collideBulletBullet, null, this);
        this.game.physics.arcade.collide(this.playerGroup, this.playerGroup, this.collideShipShip, null, this);
        this.game.physics.arcade.collide(this.playerGroup, this.bulletGroup, this.collideShipBullet, null, this);
        
        this.enemiesAlive = 0;
        for (let name in this.enemies) {
            let enemy = this.enemies[name];
            if (enemy.sprite.alive) {
                this.enemiesAlive++;
                enemy.update();
            }
        }
        this.bulletCount = 0;
        for(let ID in this.bullets) {
            let bullet = this.bullets[ID];
            if(bullet.sprite.alive) {
                this.bulletCount++;
                bullet.update();
            }
        }
        
        if(this.client.player) { //TODO
            this.client.player.update();
            if(this.client.player.sprite.position.x > this.fieldsize.width / 2 || this.client.player.sprite.position.x < -this.fieldsize.width / 2 ||
                this.client.player.sprite.position.y > this.fieldsize.height / 2 || this.client.player.sprite.position.y < -this.fieldsize.height / 2) {
                    this.client.player.damage(this.healthDecay);
            }
        }
        
        this.background.tilePosition.x = -this.game.camera.x;
        this.background.tilePosition.y = -this.game.camera.y;
        
        if (this.game.time.now > this.borderStop) {
            this.game.add.tween(this.border).to({ alpha: 0 }, 200, Phaser.Easing.Linear.None, true);
        }
        
        this.ping();
    }
    
    collideBulletBullet(bullet1: Phaser.Sprite, bullet2:Phaser.Sprite) {
        for(let ID in this.bullets) {
            let bullet:Bullet = this.bullets[ID];
            if(bullet.sprite.renderOrderID == bullet1.renderOrderID || bullet.sprite.renderOrderID == bullet2.renderOrderID) {
                bullet.kill();
            }
        }
    }
    
    collideShipBullet(ship1:Phaser.Sprite, bullet1:Phaser.Sprite) {
        let bulletDamage:number;
        let bulletOwner:Ship;
        for(let ID in this.bullets) {
            let bullet:Bullet = this.bullets[ID];
            if(bullet.sprite.renderOrderID == bullet1.renderOrderID) {
                bulletDamage = bullet.damage;
                bulletOwner = bullet.owner;
                bullet.kill();
            }
        }
        
        if(this.client.player.sprite.renderOrderID == ship1.renderOrderID) {
            if(this.client.player != bulletOwner) {
                this.client.player.damage(bulletDamage);
            }
        } else {        
            for(let name in this.enemies) {
                let enemy:Ship = this.enemies[name];
                if(enemy.sprite.renderOrderID == ship1.renderOrderID) {
                    if(enemy != bulletOwner) {
                        enemy.damage(bulletDamage);
                    }
                }
            }
        }       
    }
    
    collideShipShip(ship1:Phaser.Sprite, ship2:Phaser.Sprite) {
        if(this.client.player.sprite.renderOrderID == ship1.renderOrderID || this.client.player.sprite.renderOrderID == ship2.renderOrderID) {
            this.client.player.kill();
        }
        
        for(let name in this.enemies) {
            let enemy:Ship = this.enemies[name];
            if(enemy.sprite.renderOrderID == ship1.renderOrderID || enemy.sprite.renderOrderID == ship2.renderOrderID) {
                enemy.kill();
            }
        }
    }
    
    ping = () => {
        let req:PingRequest = new PingRequest();
        this.socketservice.ping(req);
    }
    
    pong = (res:PongResponse) => {
        let time:Date = new Date(res.time.toString());
        let pingTime:number = Date.now() - time.getTime();
        //console.info("RTT:", pingTime, "ms");
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
        if(this.client.player) { //TODO
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 30);
        this.game.debug.text('Health: ' + this.client.player.sprite.health.toFixed(), 32, 45);
        this.game.debug.text('Position: ' + this.client.player.sprite.position.x.toFixed() + ', ' + this.client.player.sprite.position.y.toFixed(), 32, 60);
        this.game.debug.text('Angle: ' + this.client.player.sprite.rotation.toFixed(3), 32, 75);
        this.game.debug.text('Speed: ' + this.client.player.speed.toFixed(3), 32, 90);
        this.game.debug.text('AngularVelocity: ' + this.client.player.sprite.body.angularVelocity.toFixed(3), 32, 105);
        this.game.debug.text('Bullets: ' + this.bulletCount, 32, 120);
        }
    }    
    
    destroy() {
        this.game.destroy();
        
        this.client.name = this.client.player = null;
        this.enemies = {};
        this.bullets = {};
        
        this.socketservice.deleteHandlers(POSITION_EVENT);
        this.socketservice.deleteHandlers(PING_PONG_EVENT);
        window.onresize = null;
    }

}