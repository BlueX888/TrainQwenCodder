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
  // 无需预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建48x48的蓝色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色，不透明
    // 以点击位置为中心绘制方块（左上角坐标为 pointer.x - 24, pointer.y - 24）
    graphics.fillRect(pointer.x - 24, pointer.y - 24, 48, 48);
  });

  // 添加提示文本
  this.add.text(400, 30, 'Click anywhere to create blue squares', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);