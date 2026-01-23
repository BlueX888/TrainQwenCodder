// Simple Phaser3 test code
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    // No external resources needed
}

function create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(100, 100, 200, 150);

    this.add.text(100, 50, 'Hello Phaser3!', { fontSize: '32px', fill: '#fff' });
}
