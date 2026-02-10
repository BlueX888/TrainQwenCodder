const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 使用 Graphics 创建48x48蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 48, 48);
  
  // 生成纹理并存储为 'blueSquare'
  graphics.generateTexture('blueSquare', 48, 48);
  
  // 清理 graphics 对象
  graphics.destroy();
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建蓝色方块
    // 使用 pointer.x 和 pointer.y 作为中心点
    const square = this.add.image(pointer.x, pointer.y, 'blueSquare');
    
    // 可选：添加简单的缩放动画效果
    square.setScale(0);
    this.tweens.add({
      targets: square,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文字
  const text = this.add.text(400, 50, '点击画布任意位置生成蓝色方块', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);