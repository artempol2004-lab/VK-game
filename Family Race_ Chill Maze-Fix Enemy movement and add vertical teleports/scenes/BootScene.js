import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(CONFIG.WIDTH / 2 - 160, CONFIG.HEIGHT / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(CONFIG.WIDTH / 2 - 150, CONFIG.HEIGHT / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // Load assets
        this.load.image('oksana_portrait', CONFIG.ASSETS.OKSANA_PORTRAIT);
        this.load.image('djigan_portrait', CONFIG.ASSETS.DJIGAN_PORTRAIT);
        this.load.image('oksana_sprite', CONFIG.ASSETS.OKSANA_SPRITE);
        this.load.image('djigan_sprite', CONFIG.ASSETS.DJIGAN_SPRITE);
        this.load.image('djigan_angry', CONFIG.ASSETS.DJIGAN_ANGRY);
        this.load.image('money_coin', CONFIG.ASSETS.MONEY_COIN);
        this.load.image('power_heart', CONFIG.ASSETS.POWER_HEART);
    }

    create() {
        this.scene.start('MenuScene');
    }
}
