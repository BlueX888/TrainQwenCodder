const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#f0f0f0'
};

function preload() {
  // 使用 Graphics 生成蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 48, 48); // 48x48 像素方块
  graphics.generateTexture('blueSquare', 48, 48);
  graphics.destroy(); // 生成纹理后销毁 Graphics 对象
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建蓝色方块
    // 使用 pointer.x 和 pointer.y 获取点击坐标
    const square = this.add.image(pointer.x, pointer.y, 'blueSquare');
    
    // 可选：添加一些视觉反馈效果
    square.setScale(0);
    this.tweens.add({
      targets: square,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成蓝色方块', {
    fontSize: '20px',
    color: '#333333'
  }).setOrigin(0.5);
}

new Phaser.Game(config);