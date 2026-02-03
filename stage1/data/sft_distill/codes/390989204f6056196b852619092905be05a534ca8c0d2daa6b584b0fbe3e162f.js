const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建青色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径为50）
  const radius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00CED1, 1); // 青色
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon-cyan', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建橙色六边形纹理
  const graphicsOrange = this.add.graphics();
  graphicsOrange.fillStyle(0xFF8C00, 1); // 橙色
  graphicsOrange.beginPath();
  graphicsOrange.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphicsOrange.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphicsOrange.closePath();
  graphicsOrange.fillPath();
  graphicsOrange.generateTexture('hexagon-orange', radius * 2, radius * 2);
  graphicsOrange.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagon-cyan');
  
  // 启用交互
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    // 拖拽时改变为橙色
    this.setTexture('hexagon-orange');
  });
  
  // 监听拖拽事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    // 更新六边形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    // 恢复青色
    this.setTexture('hexagon-cyan');
    
    // 回到初始位置（带缓动动画）
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);