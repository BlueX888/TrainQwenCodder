const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('grayRect', 150, 100);
  graphics.destroy();

  // 创建蓝色矩形纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1);
  blueGraphics.fillRect(0, 0, 150, 100);
  blueGraphics.generateTexture('blueRect', 150, 100);
  blueGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建可拖拽的矩形
  const rectangle = this.add.sprite(initialX, initialY, 'grayRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 改变颜色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('blueRect');
  });

  // 监听拖拽事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复颜色和位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('grayRect');
    
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
  this.add.text(400, 50, '拖拽灰色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);