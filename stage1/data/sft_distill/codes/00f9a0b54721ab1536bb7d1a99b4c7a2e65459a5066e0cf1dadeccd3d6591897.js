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
  // 记录矩形的初始位置
  const startX = 400;
  const startY = 300;
  
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('whiteRect', 100, 80);
  graphics.destroy();
  
  // 创建蓝色矩形纹理（拖拽时使用）
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x4a90e2, 1);
  graphicsBlue.fillRect(0, 0, 100, 80);
  graphicsBlue.generateTexture('blueRect', 100, 80);
  graphicsBlue.destroy();
  
  // 创建矩形精灵
  const rectangle = this.add.sprite(startX, startY, 'whiteRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 拖拽时改变为蓝色
    this.setTexture('blueRect');
  });
  
  // 监听拖拽事件
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
    this.x = startX;
    this.y = startY;
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽白色矩形试试', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '松手后矩形会回到初始位置', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);