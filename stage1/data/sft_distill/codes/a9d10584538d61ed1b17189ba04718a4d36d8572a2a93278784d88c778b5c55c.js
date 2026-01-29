const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建绿色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.generateTexture('greenStar', 100, 100);
  graphics.destroy();

  // 创建黄色星形纹理
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillStar(50, 50, 5, 20, 40);
  graphicsYellow.generateTexture('yellowStar', 100, 100);
  graphicsYellow.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建星形精灵
  const star = this.add.sprite(initialX, initialY, 'greenStar');

  // 启用交互和拖拽
  star.setInteractive({ draggable: true });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽星形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 拖拽开始事件 - 改变颜色为黄色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('yellowStar');
    gameObject.setScale(1.2); // 稍微放大
  });

  // 拖拽中事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 拖拽结束事件 - 恢复颜色和位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('greenStar');
    gameObject.setScale(1); // 恢复原始大小
    
    // 使用缓动动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
}

new Phaser.Game(config);