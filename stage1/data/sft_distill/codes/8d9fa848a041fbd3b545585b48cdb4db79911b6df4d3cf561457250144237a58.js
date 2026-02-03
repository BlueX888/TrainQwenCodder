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
  // 使用 Graphics 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色 (Hot Pink)
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('pinkSquare', 32, 32);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建粉色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心点
    const square = this.add.sprite(pointer.x, pointer.y, 'pinkSquare');
    
    // 可选：添加一些视觉反馈
    this.tweens.add({
      targets: square,
      scale: { from: 0, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文本
  this.add.text(400, 20, 'Click anywhere to create pink squares', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5, 0);
}

new Phaser.Game(config);