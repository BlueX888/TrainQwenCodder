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
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('whiteRect', 100, 80);
  graphics.destroy();
  
  // 创建灰色矩形纹理（拖拽时使用）
  const graphicsGray = this.add.graphics();
  graphicsGray.fillStyle(0x888888, 1);
  graphicsGray.fillRect(0, 0, 100, 80);
  graphicsGray.generateTexture('grayRect', 100, 80);
  graphicsGray.destroy();
  
  // 创建矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'whiteRect');
  
  // 启用交互和拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTexture('grayRect');
  });
  
  // 监听拖拽事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色和位置
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setTexture('whiteRect');
    
    // 使用 tween 平滑回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Drag the rectangle!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);