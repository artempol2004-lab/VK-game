import Phaser from 'phaser';
import * as Tone from 'tone';
import { CONFIG } from '../config.js';
import { MAZE_LAYOUT, PLAYER_SPAWN, ENEMY_SPAWN } from '../systems/Maze.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.score = 0;
        this.isGameOver = false;

        // Sound Setup
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.powerSynth = new Tone.MembraneSynth().toDestination();
        
        // Calculate maze offset to center it
        const mazeWidth = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE;
        const mazeHeight = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE;
        this.offsetX = (CONFIG.WIDTH - mazeWidth) / 2;
        this.offsetY = 130; 

        this.mazeGraphics = this.add.graphics();
        this.dots = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        this.enemies = this.physics.add.group();

        this.drawMaze();
        this.createUI();

        // Spawn Oksana
        const px = this.offsetX + (PLAYER_SPAWN.x * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE / 2;
        const py = this.offsetY + (PLAYER_SPAWN.y * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE / 2;
        this.player = new Player(this, px, py, MAZE_LAYOUT, this.offsetX, this.offsetY);

        // Spawn initial Djigan
        this.spawnEnemy();

        // Timer for additional enemies every 2 minutes
        this.spawnTimer = this.time.addEvent({
            delay: CONFIG.ENEMY_SPAWN_INTERVAL,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Collisions
        this.physics.add.overlap(this.player, this.dots, this.collectDot, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
    }

    drawMaze() {
        // Clear previous graphics
        this.mazeGraphics.clear();
        
        // Background for the maze area
        const mazeWidth = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE;
        const mazeHeight = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE;
        this.add.rectangle(this.offsetX, this.offsetY, mazeWidth, mazeHeight, 0x050510).setOrigin(0).setDepth(-1);

        this.mazeGraphics.lineStyle(4, CONFIG.COLORS.MAZE_WALL);
        
        for (let y = 0; y < MAZE_LAYOUT.length; y++) {
            for (let x = 0; x < MAZE_LAYOUT[y].length; x++) {
                const val = MAZE_LAYOUT[y][x];
                const tx = this.offsetX + x * CONFIG.TILE_SIZE;
                const ty = this.offsetY + y * CONFIG.TILE_SIZE;

                if (val === 1) {
                    // Wall - more visible
                    this.mazeGraphics.strokeRect(tx + 4, ty + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);
                    this.mazeGraphics.fillStyle(0x111188, 0.5);
                    this.mazeGraphics.fillRect(tx + 6, ty + 6, CONFIG.TILE_SIZE - 12, CONFIG.TILE_SIZE - 12);
                } else if (val === 2) {
                    // Dot
                    this.createDot(tx, ty);
                } else if (val === 3) {
                    // Power Up
                    this.createPowerUp(tx, ty);
                }
            }
        }
    }

    createDot(tx, ty) {
        const dot = this.add.circle(tx + CONFIG.TILE_SIZE / 2, ty + CONFIG.TILE_SIZE / 2, 4, CONFIG.COLORS.MAZE_DOT);
        this.dots.add(dot);
        dot.gridPos = { x: tx, y: ty };
    }

    createPowerUp(tx, ty) {
        const heart = this.add.image(tx + CONFIG.TILE_SIZE / 2, ty + CONFIG.TILE_SIZE / 2, 'power_heart').setScale(0.06);
        this.powerUps.add(heart);
        heart.gridPos = { x: tx, y: ty };
    }

    createUI() {
        // Background for UI
        this.add.rectangle(0, 0, CONFIG.WIDTH, 120, 0x111111).setOrigin(0);

        // Oksana side
        this.add.image(100, 60, 'oksana_portrait').setScale(0.1);
        this.add.text(170, 25, 'OKSANA', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: CONFIG.COLORS.TEXT_PRIMARY
        });
        this.scoreText = this.add.text(170, 70, '0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff'
        });

        // VS
        this.add.text(CONFIG.WIDTH / 2, 60, 'VS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Djigan side
        this.add.image(CONFIG.WIDTH - 100, 60, 'djigan_portrait').setScale(0.1);
        this.add.text(CONFIG.WIDTH - 400, 25, 'DJIGAN', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: CONFIG.COLORS.TEXT_SECONDARY
        });
        this.enemyText = this.add.text(CONFIG.WIDTH - 400, 70, 'CHASING', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#ff0000'
        });
    }

    spawnEnemy() {
        if (this.isGameOver) return;
        const ex = this.offsetX + (ENEMY_SPAWN.x * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE / 2;
        const ey = this.offsetY + (ENEMY_SPAWN.y * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE / 2;
        const enemy = new Enemy(this, ex, ey, MAZE_LAYOUT, this.player, this.offsetX, this.offsetY);
        this.enemies.add(enemy);
    }

    collectDot(player, dot) {
        const { x, y } = dot.gridPos;
        dot.destroy();
        this.score += 10;
        this.scoreText.setText(this.score.toString());
        
        this.synth.triggerAttackRelease("C5", "32n");

        // Respawn dot after 15 seconds
        this.time.delayedCall(15000, () => {
            if (!this.isGameOver) this.createDot(x, y);
        });
    }

    collectPowerUp(player, powerUp) {
        const { x, y } = powerUp.gridPos;
        powerUp.destroy();
        this.score += 50;
        this.scoreText.setText(this.score.toString());
        
        this.powerSynth.triggerAttackRelease("C2", "8n");
        
        // Frighten ALL enemies
        this.enemies.getChildren().forEach(enemy => enemy.setFrightened(true));
        this.enemyText.setText('SCARED');
        this.enemyText.setColor('#0000ff');

        if (this.powerTimer) this.powerTimer.remove();
        this.powerTimer = this.time.delayedCall(CONFIG.POWER_UP_DURATION, () => {
            this.enemies.getChildren().forEach(enemy => enemy.setFrightened(false));
            this.enemyText.setText('CHASING');
            this.enemyText.setColor('#ff0000');
        });

        // Respawn powerup after 30 seconds
        this.time.delayedCall(30000, () => {
            if (!this.isGameOver) this.createPowerUp(x, y);
        });
    }

    handleEnemyCollision(player, enemy) {
        if (this.isGameOver) return;

        if (enemy.isFrightened) {
            // Respawn enemy
            this.score += 200;
            this.scoreText.setText(this.score.toString());
            this.powerSynth.triggerAttackRelease("G2", "4n");
            
            const ex = this.offsetX + (ENEMY_SPAWN.x * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE / 2;
            const ey = this.offsetY + (ENEMY_SPAWN.y * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE / 2;
            enemy.setPosition(ex, ey);
            enemy.setFrightened(false);
        } else {
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.powerSynth.triggerAttackRelease("C1", "2n");
        
        if (this.spawnTimer) this.spawnTimer.remove();
        
        // Save and get leaderboard
        this.updateLeaderboard();

        const overlay = this.add.rectangle(CONFIG.WIDTH/2, CONFIG.HEIGHT/2, 900, 800, 0x000000, 0.95).setOrigin(0.5);
        
        // Angry Djigan Portrait
        this.add.image(CONFIG.WIDTH/2 + 300, CONFIG.HEIGHT/2 - 100, 'djigan_angry').setScale(0.6).setAlpha(0.8);

        this.add.text(CONFIG.WIDTH/2 - 100, CONFIG.HEIGHT/2 - 320, 'GAME OVER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);

        this.add.text(CONFIG.WIDTH/2 - 100, CONFIG.HEIGHT/2 - 240, `SCORE: ${this.score}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Leaderboard Display
        const lbX = CONFIG.WIDTH/2 - 100;
        this.add.text(lbX, CONFIG.HEIGHT/2 - 120, '--- TOP SCORES ---', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);

        const leaderboard = this.getLeaderboard();
        leaderboard.forEach((entry, index) => {
            const color = entry.isCurrent ? '#00ff00' : '#ffffff';
            this.add.text(lbX, CONFIG.HEIGHT/2 - 50 + (index * 50), `${index + 1}. ${entry.score}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                color: color
            }).setOrigin(0.5);
        });

        const restartBtn = this.add.text(CONFIG.WIDTH/2, CONFIG.HEIGHT/2 + 320, 'RETRY', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#2222ff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => this.scene.restart());
        restartBtn.on('pointerover', () => restartBtn.setColor('#4444ff').setScale(1.1));
        restartBtn.on('pointerout', () => restartBtn.setColor('#2222ff').setScale(1.0));
    }

    updateLeaderboard() {
        let scores = JSON.parse(localStorage.getItem('pac_squad_scores') || '[]');
        scores.push({ score: this.score, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 5);
        localStorage.setItem('pac_squad_scores', JSON.stringify(scores));
    }

    getLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('pac_squad_scores') || '[]');
        // Mark current score in the leaderboard
        return scores.map(s => ({
            ...s,
            isCurrent: s.score === this.score
        }));
    }

    victory() {
        // Standard pacman has no victory in infinite mode, but we keep it
        this.isGameOver = true;
        this.physics.pause();
        this.powerSynth.triggerAttackRelease("G4", "2n");
        
        this.add.rectangle(CONFIG.WIDTH/2, CONFIG.HEIGHT/2, 600, 300, 0x000000, 0.8).setOrigin(0.5);
        this.add.text(CONFIG.WIDTH/2, CONFIG.HEIGHT/2 - 50, 'CLEARED!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '48px',
            color: '#ffff00'
        }).setOrigin(0.5);

        const restartBtn = this.add.text(CONFIG.WIDTH/2, CONFIG.HEIGHT/2 + 50, 'PLAY AGAIN', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => this.scene.restart());
    }

    update(time, delta) {
        if (this.isGameOver) return;
        this.player.update();
        this.enemies.getChildren().forEach(enemy => enemy.update(time));
    }
}

