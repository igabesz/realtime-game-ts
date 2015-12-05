import { Ship } from './Ship'
import { Bullet } from './Bullet'
import { SpaceGame } from './SpaceGame'
import { ShipType } from '../../common/GameObject';
import { SimulationResponse } from '../../common/Simulation'

export class PositionListener {
    
    spaceGame: SpaceGame;
    
    constructor(spacegame:SpaceGame) {
        this.spaceGame = spacegame;
    }
    
    initializeClient(shipType:string) {
        let sp:Phaser.Sprite = this.initializeSprite(shipType);
        this.spaceGame.client.player = new Ship(this.spaceGame, sp);
        this.spaceGame.game.camera.follow(this.spaceGame.client.player.sprite);
    }
    
    initializeEnemy(shipType:string, name:string) {
        let sp:Phaser.Sprite = this.initializeSprite(shipType);
        this.spaceGame.enemies[name] = new Ship(this.spaceGame, sp);
    }
    
    initializeSprite(key):Phaser.Sprite {
        return this.spaceGame.game.add.sprite(this.spaceGame.game.rnd.integerInRange(-this.spaceGame.fieldsize.width/2, this.spaceGame.fieldsize.width/2),
                        this.spaceGame.game.rnd.integerInRange(-this.spaceGame.fieldsize.height/2, this.spaceGame.fieldsize.height/2), key);
    }
    
    initializeConstantValues(sprite:Phaser.Sprite, player) {
        sprite.body.acceleration = player.ship.acceleration;
        sprite.body.angularAcceleration = player.ship.turnacc;
        sprite.width = player.ship.width;
        sprite.height = player.ship.length;
    }
	
	refreshGame(res:SimulationResponse) {
        this.refreshPlayers(res.players);
        this.refreshProjectiles(res.projectiles);
    }
    
    refreshPlayers(players) {
        for(let player of players) {
            let actual:Ship = null;
            
            if(player.name == this.spaceGame.client.name) {
                if(this.spaceGame.client.player == undefined) {
                    this.initializeClient(ShipType[player.ship.type]);
                }
                actual = this.spaceGame.client.player;
                this.initializeConstantValues(actual.sprite, player);
            } else {
                if(this.spaceGame.enemies[player.name] == undefined) {
                    this.initializeEnemy(ShipType[player.ship.type], player.name);
                }
                actual = this.spaceGame.enemies[player.name];
                this.initializeConstantValues(actual.sprite, player);
            }
            
            actual.sprite.position.x = player.ship.position.x;
            actual.sprite.position.y = player.ship.position.y;
            actual.sprite.rotation = player.ship.position.angle;
            
            actual.speed = Math.sqrt(Math.pow(player.ship.speed.x,2)+Math.pow(player.ship.speed.y, 2));
            actual.sprite.body.angularVelocity = player.ship.speed.turn;
            actual.sprite.health = player.ship.health;
        }
        this.spaceGame.enemiesTotal = players.length-1;
    }
    
    refreshProjectiles(projectiles) {
        for(let projectile of projectiles) {
            let actual:Bullet = null;
            actual = this.spaceGame.bullets[projectile.ID];
            if(actual == undefined) {
                let sp:Phaser.Sprite = this.spaceGame.game.add.sprite(projectile.position.x, projectile.position.y, "bullet");
                this.spaceGame.bullets[projectile.ID] = new Bullet(this.spaceGame.game, sp);
                actual = this.spaceGame.bullets[projectile.ID];
                
                actual.sprite.body.acceleration = projectile.acceleration;
                actual.damage = projectile.damage;
                actual.sprite.width = projectile.width;
                actual.sprite.height = projectile.length;
                
                if(projectile.owner.name == this.spaceGame.client.name) actual.owner = this.spaceGame.client.player;
                else actual.owner = this.spaceGame.enemies[projectile.owner.name];
            }
            actual.sprite.position.x = projectile.position.x;
            actual.sprite.position.y = projectile.position.y;
            actual.sprite.rotation = projectile.position.angle;
            actual.speed = Math.sqrt(Math.pow(projectile.speed.x,2)+Math.pow(projectile.speed.y, 2));
            actual.sprite.body.angularVelocity = projectile.speed.turn;                        
        }
    }
	
}