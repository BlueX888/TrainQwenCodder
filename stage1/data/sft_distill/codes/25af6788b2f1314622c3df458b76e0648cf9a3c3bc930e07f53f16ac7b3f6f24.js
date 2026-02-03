const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建蓝色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillTriangle(0, 0, 50, 0, 25, 50);
  graphics.generateTexture('blueTriangle', 50, 50);
  graphics.destroy();

  // 创建红色三角形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.fillTriangle(0, 0, 50, 0, 25, 50);
  redGraphics.generateTexture('redTriangle', 50, 50);
  redGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'blueTriangle');
  
  // 设置为可交互并启用拖拽
  triangle.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 改变颜色为红色
  triangle.on('dragstart', (pointer) => {
    triangle.setTexture('redTriangle');
  });

  // 监听拖拽事件 - 更新位置
  triangle.on('drag', (pointer, dragX, dragY) => {
    triangle.x = dragX;
    triangle.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复蓝色并回到初始位置
  triangle.on('dragend', (pointer) => {
    triangle.setTexture('blueTriangle');
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: triangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);