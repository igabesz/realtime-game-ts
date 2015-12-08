import { SpaceGame } from './SpaceGame';
import { Body } from './Body'

export class Ship extends Body {
    
    spaceGame: SpaceGame;
    
    constructor(spacegame: SpaceGame, sprite: Phaser.Sprite) {
        
        super(spacegame.game, sprite);
        
        this.spaceGame = spacegame;
        
        this.sprite.body.collideWorldBounds = true;
    }
    
    damage(amount: number) {
        this.sprite.health -= amount;
        
        if (this.sprite.health <= 0) {
            this.kill();
        }
        
        if(this.spaceGame.client.player == this) {
            this.spaceGame.damageEffect();
        }
    }

};