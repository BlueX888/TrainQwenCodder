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
  // 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('grayBox', 100, 100);
  graphics.destroy();

  // 创建蓝色方块纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1);
  blueGraphics.fillRect(0, 0, 100, 100);
  blueGraphics.generateTexture('blueBox', 100, 100);
  blueGraphics.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const box = this.add.sprite(initialX, initialY, 'grayBox');
  
  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 改变为蓝色
    this.setTexture('blueBox');
  });

  // 监听拖拽事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复灰色
    this.setTexture('grayBox');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽灰色方块试试', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);