import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, maze, player, offsetX, offsetY) {
        super(scene, x, y, 'djigan_sprite');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.maze = maze;
        this.player = player;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.setDisplaySize(CONFIG.TILE_SIZE * 1.2, CONFIG.TILE_SIZE * 1.2);
        
        // Physics body setup
        this.body.setCircle(this.width * 0.4);
        this.body.setCollideWorldBounds(false);
        
        this.currentDir = Phaser.NONE;
        this.speed = CONFIG.ENEMY_SPEED;
        this.isFrightened = false;
        
        this.chooseNewDirection(Math.floor((x - offsetX) / CONFIG.TILE_SIZE), Math.floor((y - offsetY) / CONFIG.TILE_SIZE));
    }

    setFrightened(value) {
        this.isFrightened = value;
        if (value) {
            this.setTint(0x0000ff);
            this.speed = CONFIG.ENEMY_SPEED * 0.6;
        } else {
            this.clearTint();
            this.speed = CONFIG.ENEMY_SPEED;
        }
    }

    update(time) {
        this.move();
        this.handleTeleport();
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

    move() {
        const xInMaze = this.x - this.offsetX;
        const yInMaze = this.y - this.offsetY;
        
        const gridX = Math.floor(xInMaze / CONFIG.TILE_SIZE);
        const gridY = Math.floor(yInMaze / CONFIG.TILE_SIZE);
        
        const centerX = (gridX * CONFIG.TILE_SIZE) + (CONFIG.TILE_SIZE / 2) + this.offsetX;
        const centerY = (gridY * CONFIG.TILE_SIZE) + (CONFIG.TILE_SIZE / 2) + this.offsetY;
        
        const threshold = 6;

        if (Math.abs(this.x - centerX) < threshold && Math.abs(this.y - centerY) < threshold) {
            // Check if we are at an intersection or blocked
            if (this.currentDir === Phaser.NONE || !this.canMove(this.currentDir, gridX, gridY) || this.isIntersection(gridX, gridY)) {
                this.chooseNewDirection(gridX, gridY);
                this.setPosition(centerX, centerY);
            }
        }

        if (this.currentDir === Phaser.LEFT) {
            this.body.setVelocity(-this.speed, 0);
        } else if (this.currentDir === Phaser.RIGHT) {
            this.body.setVelocity(this.speed, 0);
        } else if (this.currentDir === Phaser.UP) {
            this.body.setVelocity(0, -this.speed);
        } else if (this.currentDir === Phaser.DOWN) {
            this.body.setVelocity(0, this.speed);
        }
    }

    isIntersection(gx, gy) {
        let paths = 0;
        if (this.canMove(Phaser.LEFT, gx, gy)) paths++;
        if (this.canMove(Phaser.RIGHT, gx, gy)) paths++;
        if (this.canMove(Phaser.UP, gx, gy)) paths++;
        if (this.canMove(Phaser.DOWN, gx, gy)) paths++;
        return paths > 2;
    }

    chooseNewDirection(gx, gy) {
        const directions = [Phaser.LEFT, Phaser.RIGHT, Phaser.UP, Phaser.DOWN];
        const validDirs = directions.filter(d => this.canMove(d, gx, gy));
        
        const opposite = this.getOpposite(this.currentDir);
        // Ghosts try not to reverse direction
        const filteredDirs = validDirs.length > 1 ? validDirs.filter(d => d !== opposite) : validDirs;

        if (this.isFrightened) {
            this.currentDir = Phaser.Utils.Array.GetRandom(filteredDirs);
        } else {
            // Simple chase: pick direction that gets closer to player
            filteredDirs.sort((a, b) => {
                const distA = this.getDistAfterMove(a, gx, gy);
                const distB = this.getDistAfterMove(b, gx, gy);
                return distA - distB;
            });
            
            // Add some randomness so they don't all follow exactly the same path
            if (Math.random() < 0.2) {
                 this.currentDir = Phaser.Utils.Array.GetRandom(filteredDirs);
            } else {
                this.currentDir = filteredDirs[0];
            }
        }
    }

    getDistAfterMove(dir, gx, gy) {
        let nx = gx;
        let ny = gy;
        if (dir === Phaser.LEFT) nx--;
        else if (dir === Phaser.RIGHT) nx++;
        else if (dir === Phaser.UP) ny--;
        else if (dir === Phaser.DOWN) ny++;
        
        const playerGX = Math.floor((this.player.x - this.offsetX) / CONFIG.TILE_SIZE);
        const playerGY = Math.floor((this.player.y - this.offsetY) / CONFIG.TILE_SIZE);
        
        return Phaser.Math.Distance.Between(nx, ny, playerGX, playerGY);
    }

    getOpposite(dir) {
        if (dir === Phaser.LEFT) return Phaser.RIGHT;
        if (dir === Phaser.RIGHT) return Phaser.LEFT;
        if (dir === Phaser.UP) return Phaser.DOWN;
        if (dir === Phaser.DOWN) return Phaser.UP;
        return Phaser.NONE;
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
