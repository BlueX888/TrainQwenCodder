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
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 16, 16);
  graphics.generateTexture('blueSquare', 16, 16);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建方块
    // 使用 pointer.x 和 pointer.y 作为中心点
    const square = this.add.sprite(pointer.x, pointer.y, 'blueSquare');
    
    // 可选：添加简单的缩放动画效果
    square.setScale(0);
    this.tweens.add({
      targets: square,
      scale: 1,
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