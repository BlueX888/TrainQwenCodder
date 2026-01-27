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
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('whiteRect', 100, 100);
  graphics.destroy();
  
  // 创建蓝色矩形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4444ff, 1);
  graphicsBlue.fillRect(0, 0, 100, 100);
  graphicsBlue.generateTexture('blueRect', 100, 100);
  graphicsBlue.destroy();
  
  // 创建矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'whiteRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色
  rectangle.on('dragstart', function(pointer) {
    this.setTexture('blueRect');
  });
  
  // 监听拖拽事件 - 更新位置
  rectangle.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色和位置
  rectangle.on('dragend', function(pointer) {
    this.setTexture('whiteRect');
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽白色矩形试试', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);