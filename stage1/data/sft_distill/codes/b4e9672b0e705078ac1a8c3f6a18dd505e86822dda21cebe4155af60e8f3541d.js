const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('pinkCircle', 100, 100);
  graphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1); // 黄色
  graphicsYellow.fillCircle(50, 50, 50);
  graphicsYellow.generateTexture('yellowCircle', 100, 100);
  graphicsYellow.destroy();

  // 初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'pinkCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽粉色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', (pointer) => {
    // 改变为黄色
    circle.setTexture('yellowCircle');
    // 增加缩放效果
    circle.setScale(1.1);
  });

  // 监听拖拽中事件
  circle.on('drag', (pointer, dragX, dragY) => {
    // 更新圆形位置
    circle.x = dragX;
    circle.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', (pointer) => {
    // 恢复粉色
    circle.setTexture('pinkCircle');
    // 恢复缩放
    circle.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: circle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加鼠标悬停效果
  circle.on('pointerover', () => {
    if (!circle.input.isDragging) {
      this.input.setDefaultCursor('grab');
    }
  });

  circle.on('pointerout', () => {
    this.input.setDefaultCursor('default');
  });

  // 拖拽时改变鼠标样式
  this.input.on('dragstart', () => {
    this.input.setDefaultCursor('grabbing');
  });

  this.input.on('dragend', () => {
    this.input.setDefaultCursor('default');
  });
}

new Phaser.Game(config);