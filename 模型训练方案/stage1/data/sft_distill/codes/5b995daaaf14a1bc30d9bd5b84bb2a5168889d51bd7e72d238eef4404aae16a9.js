const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建紫色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点
  const hexRadius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: hexRadius + Math.cos(angle) * hexRadius,
      y: hexRadius + Math.sin(angle) * hexRadius
    });
  }
  
  // 绘制紫色六边形
  graphics.fillStyle(0x9b59b6, 1); // 紫色
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
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 存储初始位置
  hexagon.initialX = initialX;
  hexagon.initialY = initialY;
  
  // 监听拖拽开始事件
  this.input.on(Phaser.Input.Events.DRAG_START, (pointer, gameObject) => {
    // 改变颜色为亮紫色
    const brightGraphics = this.add.graphics();
    brightGraphics.fillStyle(0xd98ce0, 1); // 亮紫色
    brightGraphics.beginPath();
    brightGraphics.moveTo(hexPoints[0].x, hexPoints[0].y);
    for (let i = 1; i < hexPoints.length; i++) {
      brightGraphics.lineTo(hexPoints[i].x, hexPoints[i].y);
    }
    brightGraphics.closePath();
    brightGraphics.fillPath();
    brightGraphics.generateTexture('hexagonBright', hexRadius * 2, hexRadius * 2);
    brightGraphics.destroy();
    
    gameObject.setTexture('hexagonBright');
  });
  
  // 监听拖拽事件
  this.input.on(Phaser.Input.Events.DRAG, (pointer, gameObject, dragX, dragY) => {
    // 更新位置跟随鼠标
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
  
  // 监听拖拽结束事件
  this.input.on(Phaser.Input.Events.DRAG_END, (pointer, gameObject) => {
    // 恢复原始颜色
    gameObject.setTexture('hexagon');
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: gameObject,
      x: gameObject.initialX,
      y: gameObject.initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);