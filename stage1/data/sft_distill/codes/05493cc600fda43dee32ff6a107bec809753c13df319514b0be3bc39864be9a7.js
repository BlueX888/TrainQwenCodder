const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 生成 24x24 白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 24, 24);
  graphics.generateTexture('whiteSquare', 24, 24);
  graphics.destroy();
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建白色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心位置
    const square = this.add.sprite(pointer.x, pointer.y, 'whiteSquare');
  });
}

new Phaser.Game(config);