const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  const radius = 50;

  // 创建粉色圆形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillCircle(radius, radius, radius);
  pinkGraphics.generateTexture('pinkCircle', radius * 2, radius * 2);
  pinkGraphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillCircle(radius, radius, radius);
  yellowGraphics.generateTexture('yellowCircle', radius * 2, radius * 2);
  yellowGraphics.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'pinkCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 100, '拖拽粉色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听拖拽开始事件
  circle.on('dragstart', (pointer) => {
    circle.setTexture('yellowCircle'); // 改变为黄色
    text.setText('拖拽中...');
  });

  // 监听拖拽事件
  circle.on('drag', (pointer, dragX, dragY) => {
    circle.x = dragX;
    circle.y = dragY;
  });

  // 监听拖拽结束事件
  circle.on('dragend', (pointer) => {
    circle.setTexture('pinkCircle'); // 恢复粉色
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: circle,
      x: initialX,
      y: initialY,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    text.setText('拖拽粉色圆形试试！');
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