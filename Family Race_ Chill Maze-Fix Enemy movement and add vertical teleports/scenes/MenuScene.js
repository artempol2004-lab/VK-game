import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Gradient background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x111111, 0x111111, 0x000033, 0x000033, 1);
        graphics.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // Portraits - Adjusted scale and position to avoid overlap
        this.add.image(CONFIG.WIDTH * 0.20, CONFIG.HEIGHT * 0.5, 'oksana_portrait').setScale(0.7);
        this.add.image(CONFIG.WIDTH * 0.80, CONFIG.HEIGHT * 0.5, 'djigan_portrait').setScale(0.7);

        // Titles - Positioned to not overlap
        this.add.text(CONFIG.WIDTH * 0.20, CONFIG.HEIGHT * 0.8, 'OKSANA', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: CONFIG.COLORS.TEXT_PRIMARY
        }).setOrigin(0.5);

        this.add.text(CONFIG.WIDTH * 0.80, CONFIG.HEIGHT * 0.8, 'DJIGAN', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: CONFIG.COLORS.TEXT_SECONDARY
        }).setOrigin(0.5);

        this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.5, 'VS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.15, 'PAC-SQUAD', {
            fontFamily: '"Press Start 2P"',
            fontSize: '80px',
            color: '#ffff00'
        }).setOrigin(0.5);

        this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.25, 'RUN FROM DJIGAN, COLLECT THE MONEY!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Play Button
        const playBtn = this.add.container(CONFIG.WIDTH / 2, CONFIG.HEIGHT * 0.85);
        const btnBg = this.add.rectangle(0, 0, 400, 100, 0x2222ff).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, 0, 'PLAY', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        playBtn.add([btnBg, btnText]);

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x4444ff);
            playBtn.setScale(1.1);
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x2222ff);
            playBtn.setScale(1.0);
        });
        btnBg.on('pointerdown', () => this.scene.start('GameScene'));
    }
}
