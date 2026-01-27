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
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('whiteRect', 100, 100);
  graphics.destroy();
  
  // 创建黄色矩形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 100, 100);
  graphicsYellow.generateTexture('yellowRect', 100, 100);
  graphicsYellow.destroy();
  
  // 创建可拖拽的矩形精灵
  const rect = this.add.sprite(initialX, initialY, 'whiteRect');
  
  // 设置为可交互并启用拖拽
  rect.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rect.on('dragstart', function(pointer) {
    // 拖拽时改变为黄色
    this.setTexture('yellowRect');
  });
  
  // 监听拖拽中事件
  rect.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  rect.on('dragend', function(pointer) {
    // 改回白色
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