const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径50）
  const radius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制灰色六边形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('hexGray', radius * 2, radius * 2);
  
  // 绘制蓝色六边形（拖拽时使用）
  graphics.clear();
  graphics.fillStyle(0x4a90e2, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('hexBlue', radius * 2, radius * 2);
  
  graphics.destroy();
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexGray');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 添加提示文本
  const text = this.add.text(400, 100, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on(Phaser.Input.Events.DRAG_START, () => {
    hexagon.setTexture('hexBlue');
  });
  
  // 监听拖拽事件
  hexagon.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on(Phaser.Input.Events.DRAG_END, () => {
    // 恢复灰色
    hexagon.setTexture('hexGray');
    
    // 使用补间动画回到初始位置
    this.tweens.add({
      targets: hexagon,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加悬停效果
  hexagon.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
    hexagon.setScale(1.1);
  });
  
  hexagon.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
    hexagon.setScale(1);
  });
}

new Phaser.Game(config);