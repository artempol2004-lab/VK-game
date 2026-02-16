import Phaser from 'phaser';

export const CONFIG = {
    WIDTH: 1920,
    HEIGHT: 1080,
    TILE_SIZE: 45, // Larger tiles for better visibility
    GRID_WIDTH: 19,
    GRID_HEIGHT: 21,
    PLAYER_SPEED: 200,
    ENEMY_SPEED: 160,
    POWER_UP_DURATION: 10000,
    ENEMY_SPAWN_INTERVAL: 120000, // 2 minutes in ms
    COLORS: {
        MAZE_WALL: 0x3333ff,
        MAZE_DOT: 0xffffff,
        MAZE_POWER: 0xff00ff,
        BACKGROUND: 0x000000,
        TEXT_PRIMARY: '#ffff00',
        TEXT_SECONDARY: '#ff00ff'
    },
    ASSETS: {
        OKSANA_PORTRAIT: 'https://rosebud.ai/assets/oksana_portrait_new.webp?DUkV',
        DJIGAN_PORTRAIT: 'https://rosebud.ai/assets/djigan_portrait_new.webp?r3fN',
        DJIGAN_ANGRY: 'https://rosebud.ai/assets/djigan_angry_portrait.webp?HJfo',
        OKSANA_SPRITE: 'https://rosebud.ai/assets/oksana_face_sprite.webp?bOvz',
        DJIGAN_SPRITE: 'https://rosebud.ai/assets/djigan_face_sprite.webp?leKP',
        MONEY_COIN: 'https://rosebud.ai/assets/money_coin.webp?gM1e',
        POWER_HEART: 'https://rosebud.ai/assets/power_heart.webp?lJYl'
    }
};
