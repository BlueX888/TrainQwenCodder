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
  
  // 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('yellowRect', 100, 80);
  graphics.destroy();
  
  // 创建红色矩形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1); // 红色
  graphicsRed.fillRect(0, 0, 100, 80);
  graphicsRed.generateTexture('redRect', 100, 80);
  graphicsRed.destroy();
  
  // 创建可拖拽的矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'yellowRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 拖拽时改变为红色
    this.setTexture('redRect');
  });
  
  // 监听拖拽过程事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复黄色
    this.setTexture('yellowRect');
    
    // 回到初始位置（添加平滑过渡效果）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽黄色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);