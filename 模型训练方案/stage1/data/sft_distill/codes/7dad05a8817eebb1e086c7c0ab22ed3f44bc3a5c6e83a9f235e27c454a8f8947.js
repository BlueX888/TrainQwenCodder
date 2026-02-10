const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 计算六边形顶点（中心在 (0, 0)，半径 60）
  const radius = 60;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }

  // 创建白色六边形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x + radius, hexPoints[0].y + radius);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x + radius, hexPoints[i].y + radius);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('hexWhite', radius * 2, radius * 2);
  graphics.destroy();

  // 创建拖拽时的黄色六边形纹理
  const graphicsDrag = this.add.graphics();
  graphicsDrag.fillStyle(0xffff00, 1);
  graphicsDrag.beginPath();
  graphicsDrag.moveTo(hexPoints[0].x + radius, hexPoints[0].y + radius);
  for (let i = 1; i < hexPoints.length; i++) {
    graphicsDrag.lineTo(hexPoints[i].x + radius, hexPoints[i].y + radius);
  }
  graphicsDrag.closePath();
  graphicsDrag.fillPath();
  graphicsDrag.generateTexture('hexYellow', radius * 2, radius * 2);
  graphicsDrag.destroy();

  // 创建六边形精灵
  const initialX = 400;
  const initialY = 300;
  const hexagon = this.add.sprite(initialX, initialY, 'hexWhite');
  
  // 启用交互和拖拽
  hexagon.setInteractive();
  this.input.setDraggable(hexagon);

  // 存储初始位置
  hexagon.initialX = initialX;
  hexagon.initialY = initialY;

  // 监听拖拽开始事件
  hexagon.on(Phaser.Input.Events.DRAG_START, function(pointer) {
    this.setTexture('hexYellow');
  });

  // 监听拖拽事件
  hexagon.on(Phaser.Input.Events.DRAG, function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });

  // 监听拖拽结束事件
  hexagon.on(Phaser.Input.Events.DRAG_END, function(pointer) {
    // 恢复白色
    this.setTexture('hexWhite');
    
    // 添加缓动动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: this.initialX,
      y: this.initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);