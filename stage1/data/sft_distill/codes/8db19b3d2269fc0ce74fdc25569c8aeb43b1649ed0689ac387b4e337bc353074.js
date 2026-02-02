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
  
  // 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('whiteRect', 120, 80);
  graphics.destroy();
  
  // 创建灰色矩形纹理（拖拽时使用）
  const graphicsGray = this.add.graphics();
  graphicsGray.fillStyle(0x888888, 1);
  graphicsGray.fillRect(0, 0, 120, 80);
  graphicsGray.generateTexture('grayRect', 120, 80);
  graphicsGray.destroy();
  
  // 创建可拖拽的矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'whiteRect');
  
  // 启用交互和拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 拖拽时改变为灰色
    this.setTexture('grayRect');
  });
  
  // 监听拖拽移动事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复白色
    this.setTexture('whiteRect');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, '拖拽矩形试试', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  instructionText.setOrigin(0.5);
}

new Phaser.Game(config);