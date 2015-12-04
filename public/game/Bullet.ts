import { Ship } from './Ship';
import { Body } from './Body';

export class Bullet extends Body{
    
    damage: number;
    owner: Ship;
    
    constructor(game:Phaser.Game, sprite: Phaser.Sprite) {
        
        super(game, sprite);
        
        this.sprite.checkWorldBounds = true;
        this.sprite.outOfBoundsKill = true;

    }
    
};