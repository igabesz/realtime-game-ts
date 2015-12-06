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
    
    initializeBullet(x, y, ID) {
        let sp:Phaser.Sprite = this.initializeSprite(x, y, "bullet");
        this.spaceGame.bullets[ID] = new Bullet(this.spaceGame.game, sp);
    }
    
    initializeClient(shipType:string, position) {
        let sp:Phaser.Sprite = this.initializeSprite(position.x, position.y, shipType);
        this.spaceGame.client.player = new Ship(this.spaceGame, sp);
        this.spaceGame.game.camera.follow(this.spaceGame.client.player.sprite);
    }
    
    initializeEnemy(shipType:string, name:string, position) {
        let sp:Phaser.Sprite = this.initializeSprite(position.x, position.y, shipType);
        this.spaceGame.enemies[name] = new Ship(this.spaceGame, sp);
    }
    
    initializeSprite(x, y, key):Phaser.Sprite {
        return this.spaceGame.game.add.sprite(x, y, key);
    }
    
    initializeConstantValues(sprite:Phaser.Sprite, body) {
        sprite.width = body.width;
        sprite.height = body.length;
        sprite.body.acceleration = body.acceleration;
        if(body.turnacc) {
            sprite.body.angularAcceleration = body.turnacc;
        }
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
                    this.initializeClient(ShipType[player.ship.type], player.ship.position);
                    this.initializeConstantValues(this.spaceGame.client.player.sprite, player.ship);
                }
                actual = this.spaceGame.client.player;
            } else {
                if(this.spaceGame.enemies[player.name] == undefined) {
                    this.initializeEnemy(ShipType[player.ship.type], player.name, player.ship.position);
                    this.initializeConstantValues(this.spaceGame.enemies[player.name].sprite, player.ship);
                }
                actual = this.spaceGame.enemies[player.name];
            }
            
            this.refreshProperties(actual, player.ship);
            actual.sprite.health = player.ship.health;
        }
        this.spaceGame.enemiesTotal = players.length-1;
    }
    
    refreshProjectiles(projectiles) {
        for(let projectile of projectiles) {
            let actual:Bullet = null;
            actual = this.spaceGame.bullets[projectile.ID];
            
            if(actual == undefined) {
                this.initializeBullet(projectile.position.x, projectile.position.y, projectile.ID)
                actual = this.spaceGame.bullets[projectile.ID];
                
                this.initializeConstantValues(actual.sprite, projectile);
                actual.damage = projectile.damage;
                
                if(projectile.owner.name == this.spaceGame.client.name) {
                    actual.owner = this.spaceGame.client.player;
                } else {
                    actual.owner = this.spaceGame.enemies[projectile.owner.name];
                }
            }
            
            this.refreshProperties(actual, projectile);                     
        }
    }
    
    refreshProperties(oldObject, newObject) {
        oldObject.sprite.position.x = newObject.position.x;
        oldObject.sprite.position.y = newObject.position.y;
        oldObject.sprite.rotation = newObject.position.angle;
        
        oldObject.speed = Math.sqrt(Math.pow(newObject.speed.x,2)+Math.pow(newObject.speed.y, 2));
        oldObject.sprite.body.angularVelocity = newObject.speed.turn;
    }
	
}