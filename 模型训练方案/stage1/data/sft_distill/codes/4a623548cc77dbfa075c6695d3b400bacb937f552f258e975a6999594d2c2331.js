const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 生成蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 16, 16); // 16x16 像素方块
  graphics.generateTexture('blueSquare', 16, 16);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建蓝色方块
    // 使用 pointer.x 和 pointer.y 获取点击坐标
    const square = this.add.sprite(pointer.x, pointer.y, 'blueSquare');
    
    // 可选：添加简单的视觉反馈
    this.tweens.add({
      targets: square,
      scale: { from: 0, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create blue squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);