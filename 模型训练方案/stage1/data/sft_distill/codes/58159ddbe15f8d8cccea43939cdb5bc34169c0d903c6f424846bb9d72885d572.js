const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 创建红色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点
  const hexRadius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: hexRadius + hexRadius * Math.cos(angle),
      y: hexRadius + hexRadius * Math.sin(angle)
    });
  }
  
  // 绘制红色六边形
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('hexRed', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建蓝色六边形纹理
  const graphicsBlue = this.add.graphics();
  graphicsBlue.fillStyle(0x0000ff, 1);
  graphicsBlue.beginPath();
  graphicsBlue.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphicsBlue.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphicsBlue.closePath();
  graphicsBlue.fillPath();
  graphicsBlue.generateTexture('hexBlue', hexRadius * 2, hexRadius * 2);
  graphicsBlue.destroy();
}

function create() {
  // 初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexRed');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive();
  this.input.setDraggable(hexagon);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', (pointer) => {
    // 拖拽时改变为蓝色
    hexagon.setTexture('hexBlue');
  });
  
  // 监听拖拽中事件
  hexagon.on('drag', (pointer, dragX, dragY) => {
    // 更新位置跟随鼠标
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', (pointer) => {
    // 恢复红色
    hexagon.setTexture('hexRed');
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: hexagon,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);