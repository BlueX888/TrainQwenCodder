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
  // 记录星形的初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建蓝色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('blueStar', 100, 100);
  graphics.destroy();
  
  // 创建黄色星形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffdd00, 1);
  graphicsYellow.fillStar(50, 50, 5, 20, 40);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'blueStar');
  
  // 设置为可交互和可拖拽
  star.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  star.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowStar');
  });
  
  // 监听拖拽事件
  star.on('drag', function(pointer, dragX, dragY) {
    // 更新星形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  star.on('dragend', function(pointer) {
    // 恢复为蓝色
    this.setTexture('blueStar');
    
    // 回到初始位置（使用补间动画使过渡更平滑）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);