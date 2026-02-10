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
  // 使用 Graphics 生成白色方块纹理
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
    // 使用 pointer.x 和 pointer.y 获取点击坐标
    const square = this.add.image(pointer.x, pointer.y, 'whiteSquare');
    
    // 可选：添加一些视觉反馈
    this.tweens.add({
      targets: square,
      scale: { from: 0, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 300, 'Click anywhere to create white squares', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);