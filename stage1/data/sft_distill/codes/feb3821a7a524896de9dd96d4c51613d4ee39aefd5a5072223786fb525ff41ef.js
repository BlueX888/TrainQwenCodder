const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x888888, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('diamondGray', 100, 100);
  graphics.destroy();

  // 创建红色菱形纹理
  const graphicsRed = this.add.graphics();
  graphicsRed.fillStyle(0xff0000, 1);
  graphicsRed.beginPath();
  graphicsRed.moveTo(50, 0);
  graphicsRed.lineTo(100, 50);
  graphicsRed.lineTo(50, 100);
  graphicsRed.lineTo(0, 50);
  graphicsRed.closePath();
  graphicsRed.fillPath();
  graphicsRed.generateTexture('diamondRed', 100, 100);
  graphicsRed.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'diamondGray');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);

  // 监听拖拽开始事件 - 变红色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('diamondRed');
  });

  // 监听拖拽中事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复灰色并回到初始位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('diamondGray');
    
    // 使用 tween 平滑移动回初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);