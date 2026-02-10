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
  // 创建青色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('cyanRect', 100, 80);
  graphics.destroy();

  // 创建黄色矩形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillRect(0, 0, 100, 80);
  graphicsYellow.generateTexture('yellowRect', 100, 80);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'cyanRect');

  // 设置为可交互并启用拖拽
  rectangle.setInteractive({ draggable: true });

  // 添加提示文本
  const helpText = this.add.text(400, 50, '拖拽青色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer, dragX, dragY) {
    // 改变为黄色
    this.setTexture('yellowRect');
    helpText.setText('拖拽中...');
  });

  // 监听拖拽事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新矩形位置
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer, dragX, dragY) {
    // 恢复青色
    this.setTexture('cyanRect');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
    
    helpText.setText('已回到初始位置！');
    
    // 2秒后恢复提示文本
    setTimeout(() => {
      helpText.setText('拖拽青色矩形试试！');
    }, 2000);
  });

  // 添加位置信息文本
  const posText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 更新位置信息
  this.events.on('update', () => {
    posText.setText(`位置: (${Math.round(rectangle.x)}, ${Math.round(rectangle.y)})`);
  });
}

new Phaser.Game(config);