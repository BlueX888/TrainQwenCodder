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
  // 不需要加载外部资源
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
  
  // 创建绿色矩形纹理（拖拽时使用）
  const graphicsGreen = this.add.graphics();
  graphicsGreen.fillStyle(0x00ff00, 1);
  graphicsGreen.fillRect(0, 0, 100, 80);
  graphicsGreen.generateTexture('greenRect', 100, 80);
  graphicsGreen.destroy();
  
  // 创建可拖拽的矩形 Sprite
  const rectangle = this.add.sprite(initialX, initialY, 'whiteRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色
  rectangle.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    rectangle.setTexture('greenRect');
  });
  
  // 监听拖拽事件 - 更新位置
  rectangle.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    rectangle.x = dragX;
    rectangle.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色和位置
  rectangle.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    rectangle.setTexture('whiteRect');
    
    // 使用 Tween 平滑回到初始位置
    this.tweens.add({
      targets: rectangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽白色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);