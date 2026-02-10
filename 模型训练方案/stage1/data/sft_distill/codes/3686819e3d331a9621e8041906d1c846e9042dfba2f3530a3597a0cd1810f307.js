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
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建红色星形纹理
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.fillStar(64, 64, 5, 32, 64, 0);
  graphicsRed.generateTexture('starRed', 128, 128);
  graphicsRed.destroy();
  
  // 创建蓝色星形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0000ff, 1);
  graphicsBlue.fillStar(64, 64, 5, 32, 64, 0);
  graphicsBlue.generateTexture('starBlue', 128, 128);
  graphicsBlue.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'starRed');
  
  // 设置为可交互并启用拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('starBlue');
    // 可选：增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽中事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复红色
    this.setTexture('starRed');
    // 恢复原始缩放
    this.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);