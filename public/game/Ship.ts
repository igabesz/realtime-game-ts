import { SpaceGame } from './SpaceGame';
import { Body } from './Body'

export class Ship extends Body {
    
    spaceGame: SpaceGame;
    
    fireRate: number;
    nextFire: number;
    
    constructor(spacegame: SpaceGame, sprite: Phaser.Sprite) {
        
        super(spacegame.game, sprite);
        
        this.spaceGame = spacegame;
        this.nextFire = 0;
        
        this.sprite.body.collideWorldBounds = true;
    }
    
    damage(amount: number) {
        this.sprite.health -= amount;
        
        if (this.sprite.health <= 0) {
            this.kill();
        }
        
        this.spaceGame.damageEffect();
    }

};