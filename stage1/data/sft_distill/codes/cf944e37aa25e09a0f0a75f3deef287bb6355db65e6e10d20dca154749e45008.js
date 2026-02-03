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
  // 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('yellowBox', 100, 100);
  graphics.destroy();

  // 创建红色方块纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.fillRect(0, 0, 100, 100);
  graphicsRed.generateTexture('redBox', 100, 100);
  graphicsRed.destroy();
}

function create() {
  // 创建可拖拽的方块
  const box = this.add.sprite(400, 300, 'yellowBox');
  
  // 保存初始位置
  const initialX = box.x;
  const initialY = box.y;

  // 设置为可交互和可拖拽
  box.setInteractive({ draggable: true });

  // 监听拖拽开始事件
  box.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('redBox');
  });

  // 监听拖拽事件
  box.on('drag', function(pointer, dragX, dragY) {
    // 更新方块位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  box.on('dragend', function(pointer) {
    // 恢复黄色
    this.setTexture('yellowBox');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽黄色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);