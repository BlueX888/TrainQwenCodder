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
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  const radius = 50;

  // 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture('yellowCircle', radius * 2, radius * 2);
  graphics.destroy();

  // 创建红色圆形纹理（拖拽时使用）
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1); // 红色
  graphicsRed.fillCircle(radius, radius, radius);
  graphicsRed.generateTexture('redCircle', radius * 2, radius * 2);
  graphicsRed.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'yellowCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽黄色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', (pointer) => {
    // 改变为红色
    circle.setTexture('redCircle');
  });

  // 监听拖拽事件
  circle.on('drag', (pointer, dragX, dragY) => {
    // 更新圆形位置
    circle.x = dragX;
    circle.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', (pointer) => {
    // 恢复黄色
    circle.setTexture('yellowCircle');
    
    // 回到初始位置（添加缓动动画效果）
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
    circle.setScale(1.1);
  });

  circle.on('pointerout', () => {
    circle.setScale(1.0);
  });
}

new Phaser.Game(config);