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
  
  // 创建粉色矩形纹理
  const pinkGraphics = this.add.graphics();
  pinkGraphics.fillStyle(0xff69b4, 1); // 粉色
  pinkGraphics.fillRect(0, 0, 120, 80);
  pinkGraphics.generateTexture('pinkRect', 120, 80);
  pinkGraphics.destroy();
  
  // 创建黄色矩形纹理（拖拽时使用）
  const yellowGraphics = this.add.graphics();
  yellowGraphics.fillStyle(0xffff00, 1); // 黄色
  yellowGraphics.fillRect(0, 0, 120, 80);
  yellowGraphics.generateTexture('yellowRect', 120, 80);
  yellowGraphics.destroy();
  
  // 创建可拖拽的矩形精灵
  const rectangle = this.add.sprite(initialX, initialY, 'pinkRect');
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 改变颜色为黄色
  rectangle.on('dragstart', (pointer) => {
    rectangle.setTexture('yellowRect');
  });
  
  // 监听拖拽中事件 - 更新位置
  rectangle.on('drag', (pointer, dragX, dragY) => {
    rectangle.x = dragX;
    rectangle.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复颜色并回到初始位置
  rectangle.on('dragend', (pointer) => {
    rectangle.setTexture('pinkRect');
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: rectangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽粉色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);