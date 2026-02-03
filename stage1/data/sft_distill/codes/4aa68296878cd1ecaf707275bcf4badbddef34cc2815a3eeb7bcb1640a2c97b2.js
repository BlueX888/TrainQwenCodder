const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 绘制白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('whiteRect', 100, 80);
  graphics.destroy();
  
  // 创建蓝色矩形纹理（拖拽时使用）
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x4a90e2, 1);
  blueGraphics.fillRect(0, 0, 100, 80);
  blueGraphics.generateTexture('blueRect', 100, 80);
  blueGraphics.destroy();
  
  // 创建可拖拽的矩形 Sprite
  const rectangle = this.add.sprite(initialX, initialY, 'whiteRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rectangle.on('dragstart', (pointer) => {
    // 改变为蓝色
    rectangle.setTexture('blueRect');
  });
  
  // 监听拖拽中事件
  rectangle.on('drag', (pointer, dragX, dragY) => {
    // 更新矩形位置跟随鼠标
    rectangle.x = dragX;
    rectangle.y = dragY;
  });
  
  // 监听拖拽结束事件
  rectangle.on('dragend', (pointer) => {
    // 恢复白色
    rectangle.setTexture('whiteRect');
    
    // 回到初始位置（带缓动效果更流畅）
    this.tweens.add({
      targets: rectangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽白色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);