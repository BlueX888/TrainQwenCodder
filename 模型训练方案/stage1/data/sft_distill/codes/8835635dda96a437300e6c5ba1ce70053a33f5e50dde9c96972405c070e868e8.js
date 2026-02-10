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
  // 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('pinkSquare', 100, 100);
  graphics.destroy();

  // 创建黄色方块纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillRect(0, 0, 100, 100);
  graphicsYellow.generateTexture('yellowSquare', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const square = this.add.sprite(initialX, initialY, 'pinkSquare');
  
  // 设置为可交互和可拖拽
  square.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 100, '拖拽粉色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  square.on('dragstart', (pointer) => {
    // 改变为黄色
    square.setTexture('yellowSquare');
    text.setText('拖拽中...');
  });

  // 监听拖拽事件
  square.on('drag', (pointer, dragX, dragY) => {
    // 更新方块位置
    square.x = dragX;
    square.y = dragY;
  });

  // 监听拖拽结束事件
  square.on('dragend', (pointer) => {
    // 恢复粉色
    square.setTexture('pinkSquare');
    
    // 回到初始位置（添加缓动动画效果）
    this.tweens.add({
      targets: square,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    text.setText('拖拽粉色方块试试！');
  });

  // 添加边框装饰
  const border = this.add.graphics();
  border.lineStyle(2, 0xffffff, 0.3);
  border.strokeRect(50, 50, 700, 500);
}

new Phaser.Game(config);