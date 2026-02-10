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
  
  // 使用 Graphics 创建灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('grayRect', 150, 100);
  graphics.destroy();
  
  // 使用 Graphics 创建蓝色矩形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4a90e2, 1); // 蓝色
  graphicsBlue.fillRect(0, 0, 150, 100);
  graphicsBlue.generateTexture('blueRect', 150, 100);
  graphicsBlue.destroy();
  
  // 创建矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'grayRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueRect');
  });
  
  // 监听拖拽事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 改变回灰色
    this.setTexture('grayRect');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽灰色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);