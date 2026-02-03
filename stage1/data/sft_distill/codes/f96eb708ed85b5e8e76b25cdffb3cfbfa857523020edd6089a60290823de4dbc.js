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
  graphics.generateTexture('yellowSquare', 100, 100);
  graphics.destroy();

  // 创建红色方块纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillRect(0, 0, 100, 100);
  redGraphics.generateTexture('redSquare', 100, 100);
  redGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的方块
  const square = this.add.sprite(initialX, initialY, 'yellowSquare');
  
  // 设置为可交互和可拖拽
  square.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽黄色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  square.on('dragstart', (pointer) => {
    // 改变为红色
    square.setTexture('redSquare');
  });

  // 监听拖拽事件
  square.on('drag', (pointer, dragX, dragY) => {
    // 更新方块位置
    square.x = dragX;
    square.y = dragY;
  });

  // 监听拖拽结束事件
  square.on('dragend', (pointer) => {
    // 改变回黄色
    square.setTexture('yellowSquare');
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: square,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  square.on('pointerover', () => {
    square.setScale(1.1);
  });

  square.on('pointerout', () => {
    square.setScale(1);
  });
}

new Phaser.Game(config);