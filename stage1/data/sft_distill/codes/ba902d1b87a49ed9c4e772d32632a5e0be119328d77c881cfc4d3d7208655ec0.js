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
  const radius = 40;

  // 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillCircle(radius, radius, radius);
  graphics.generateTexture('orangeCircle', radius * 2, radius * 2);
  graphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillCircle(radius, radius, radius);
  graphicsYellow.generateTexture('yellowCircle', radius * 2, radius * 2);
  graphicsYellow.destroy();

  // 创建可拖拽的圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'orangeCircle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽橙色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', (pointer) => {
    // 改变颜色为黄色
    circle.setTexture('yellowCircle');
  });

  // 监听拖拽事件
  circle.on('drag', (pointer, dragX, dragY) => {
    // 更新圆形位置
    circle.x = dragX;
    circle.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', (pointer) => {
    // 恢复橙色
    circle.setTexture('orangeCircle');
    
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
    circle.setScale(1.1);
  });

  circle.on('pointerout', () => {
    circle.setScale(1);
  });
}

new Phaser.Game(config);