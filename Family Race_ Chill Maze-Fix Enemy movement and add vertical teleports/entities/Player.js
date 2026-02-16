import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, maze, offsetX, offsetY) {
        super(scene, x, y, 'oksana_sprite');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.maze = maze;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.setDisplaySize(CONFIG.TILE_SIZE * 1.2, CONFIG.TILE_SIZE * 1.2);
        
        // Physics body setup
        this.body.setCircle(this.width * 0.4);
        this.body.setCollideWorldBounds(false);
        
        this.currentDir = Phaser.NONE;
        this.nextDir = Phaser.NONE;
        this.speed = CONFIG.PLAYER_SPEED;
        
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
    }

    update() {
        this.handleInput();
        this.move();
        this.handleTeleport();
    }

    handleInput() {
        if (this.cursors.left.isDown || this.wasd.A.isDown) this.nextDir = Phaser.LEFT;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) this.nextDir = Phaser.RIGHT;
        else if (this.cursors.up.isDown || this.wasd.W.isDown) this.nextDir = Phaser.UP;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) this.nextDir = Phaser.DOWN;
    }

    move() {
        const xInMaze = this.x - this.offsetX;
        const yInMaze = this.y - this.offsetY;
        
        const gridX = Math.floor(xInMaze / CONFIG.TILE_SIZE);
        const gridY = Math.floor(yInMaze / CONFIG.TILE_SIZE);
        
        const centerX = (gridX * CONFIG.TILE_SIZE) + (CONFIG.TILE_SIZE / 2) + this.offsetX;
        const centerY = (gridY * CONFIG.TILE_SIZE) + (CONFIG.TILE_SIZE / 2) + this.offsetY;
        
        const threshold = 6;

        // Intersection logic: try to change to nextDir or stop if currentDir is blocked
        if (Math.abs(this.x - centerX) < threshold && Math.abs(this.y - centerY) < threshold) {
            // Check if we can turn
            if (this.nextDir !== Phaser.NONE && this.canMove(this.nextDir, gridX, gridY)) {
                if (this.nextDir !== this.currentDir) {
                    this.currentDir = this.nextDir;
                    this.setPosition(centerX, centerY);
                }
            }
            
            // Check if blocked in current direction
            if (this.currentDir !== Phaser.NONE && !this.canMove(this.currentDir, gridX, gridY)) {
                this.currentDir = Phaser.NONE;
                this.setPosition(centerX, centerY);
                this.body.setVelocity(0);
            }
        }

        // Apply velocities based on current direction
        if (this.currentDir === Phaser.LEFT) {
            this.body.setVelocity(-this.speed, 0);
        } else if (this.currentDir === Phaser.RIGHT) {
            this.body.setVelocity(this.speed, 0);
        } else if (this.currentDir === Phaser.UP) {
            this.body.setVelocity(0, -this.speed);
        } else if (this.currentDir === Phaser.DOWN) {
            this.body.setVelocity(0, this.speed);
        } else {
            this.body.setVelocity(0, 0);
        }
    }

    handleTeleport() {
        const mazeWidth = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE;
        const mazeHeight = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE;
        
        // Horizontal teleport
        if (this.x < this.offsetX - CONFIG.TILE_SIZE / 2) {
            this.x = this.offsetX + mazeWidth + CONFIG.TILE_SIZE / 2;
        } else if (this.x > this.offsetX + mazeWidth + CONFIG.TILE_SIZE / 2) {
            this.x = this.offsetX - CONFIG.TILE_SIZE / 2;
        }

        // Vertical teleport
        if (this.y < this.offsetY - CONFIG.TILE_SIZE / 2) {
            this.y = this.offsetY + mazeHeight + CONFIG.TILE_SIZE / 2;
        } else if (this.y > this.offsetY + mazeHeight + CONFIG.TILE_SIZE / 2) {
            this.y = this.offsetY - CONFIG.TILE_SIZE / 2;
        }
    }

    canMove(dir, gx, gy) {
        let nx = gx;
        let ny = gy;
        
        if (dir === Phaser.LEFT) nx--;
        else if (dir === Phaser.RIGHT) nx++;
        else if (dir === Phaser.UP) ny--;
        else if (dir === Phaser.DOWN) ny++;
        
        // Specific rows where horizontal teleport is allowed
        const horizontalTeleportRows = [7, 9, 11]; 
        if ((nx < 0 || nx >= CONFIG.GRID_WIDTH) && horizontalTeleportRows.includes(gy)) return true;
        
        // Specific columns where vertical teleport is allowed
        const verticalTeleportCols = [9];
        if ((ny < 0 || ny >= CONFIG.GRID_HEIGHT) && verticalTeleportCols.includes(gx)) return true;

        if (nx < 0 || nx >= CONFIG.GRID_WIDTH || ny < 0 || ny >= CONFIG.GRID_HEIGHT) return false;
        
        return this.maze[ny][nx] !== 1;
    }
}
