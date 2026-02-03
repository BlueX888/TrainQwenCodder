const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 24, 24);
  graphics.generateTexture('whiteSquare', 24, 24);
  graphics.destroy(); // 生成纹理后销毁 Graphics 对象

  // 监听场景的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建白色方块，居中对齐
    const square = this.add.image(pointer.x, pointer.y, 'whiteSquare');
    square.setOrigin(0.5, 0.5); // 确保方块中心在点击位置
  });

  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create white squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);