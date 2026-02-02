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
  // 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('cyanBlock', 100, 100);
  graphics.destroy();

  // 创建黄色方块纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 100, 100);
  graphicsYellow.generateTexture('yellowBlock', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const block = this.add.sprite(initialX, initialY, 'cyanBlock');
  
  // 设置为可交互和可拖拽
  block.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  block.on('dragstart', (pointer) => {
    // 改变为黄色
    block.setTexture('yellowBlock');
    text.setText('拖拽中...');
  });

  // 监听拖拽事件
  block.on('drag', (pointer, dragX, dragY) => {
    // 更新方块位置
    block.x = dragX;
    block.y = dragY;
  });

  // 监听拖拽结束事件
  block.on('dragend', (pointer) => {
    // 恢复青色
    block.setTexture('cyanBlock');
    
    // 回到初始位置
    block.x = initialX;
    block.y = initialY;
    
    text.setText('拖拽方块试试！');
  });

  // 添加说明文本
  const infoText = this.add.text(400, 550, '松手后方块会自动回到中心位置', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  infoText.setOrigin(0.5);
}

new Phaser.Game(config);