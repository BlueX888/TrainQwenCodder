const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建白色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(0, -40);  // 顶点
  graphics.lineTo(-35, 40);  // 左下角
  graphics.lineTo(35, 40);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('whiteTriangle', 70, 80);
  graphics.destroy();

  // 创建红色三角形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xff0000, 1);
  redGraphics.beginPath();
  redGraphics.moveTo(0, -40);
  redGraphics.lineTo(-35, 40);
  redGraphics.lineTo(35, 40);
  redGraphics.closePath();
  redGraphics.fillPath();
  redGraphics.generateTexture('redTriangle', 70, 80);
  redGraphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;

  // 创建三角形精灵
  const triangle = this.add.sprite(initialX, initialY, 'whiteTriangle');

  // 设置为可交互和可拖拽
  triangle.setInteractive({ draggable: true });

  // 拖拽开始事件 - 改变颜色为红色
  triangle.on('dragstart', (pointer, dragX, dragY) => {
    triangle.setTexture('redTriangle');
  });

  // 拖拽中事件 - 更新位置
  triangle.on('drag', (pointer, dragX, dragY) => {
    triangle.x = dragX;
    triangle.y = dragY;
  });

  // 拖拽结束事件 - 恢复白色并回到初始位置
  triangle.on('dragend', (pointer, dragX, dragY) => {
    triangle.setTexture('whiteTriangle');
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: triangle,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 添加提示文字
  const text = this.add.text(400, 50, '拖拽三角形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);