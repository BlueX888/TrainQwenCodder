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
  // 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('greenCircle', 100, 100);
  graphics.destroy();

  // 创建黄色圆形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillCircle(50, 50, 50);
  graphicsYellow.generateTexture('yellowCircle', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建圆形精灵
  const circle = this.add.sprite(initialX, initialY, 'greenCircle');

  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 拖拽开始事件 - 改变颜色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('yellowCircle');
  });

  // 拖拽中事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 拖拽结束事件 - 恢复颜色和位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('greenCircle');
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文字
  this.add.text(400, 50, '拖拽绿色圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);