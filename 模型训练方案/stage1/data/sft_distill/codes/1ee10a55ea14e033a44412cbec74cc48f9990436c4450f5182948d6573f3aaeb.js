const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建紫色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点
  const hexRadius = 60;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: hexRadius + Math.cos(angle) * hexRadius,
      y: hexRadius + Math.sin(angle) * hexRadius
    });
  }
  
  // 绘制紫色六边形
  graphics.fillStyle(0x9b59b6, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建亮紫色六边形纹理（拖拽时使用）
  const graphicsDrag = this.add.graphics();
  graphicsDrag.fillStyle(0xd896ff, 1);
  graphicsDrag.beginPath();
  graphicsDrag.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphicsDrag.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphicsDrag.closePath();
  graphicsDrag.fillPath();
  graphicsDrag.generateTexture('hexagonDrag', hexRadius * 2, hexRadius * 2);
  graphicsDrag.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive();
  this.input.setDraggable(hexagon);
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖动六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    // 改变为亮紫色
    gameObject.setTexture('hexagonDrag');
    gameObject.setScale(1.1); // 稍微放大
  });
  
  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 恢复原始颜色
    gameObject.setTexture('hexagon');
    gameObject.setScale(1); // 恢复大小
    
    // 使用补间动画回到初始位置
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