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
  // 创建蓝色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的六个顶点（半径为50）
  const hexagonPoints = [];
  const radius = 50;
  const centerX = 60;
  const centerY = 60;
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    hexagonPoints.push({ x, y });
  }
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x3498db, 1);
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0].x, hexagonPoints[0].y);
  for (let i = 1; i < hexagonPoints.length; i++) {
    graphics.lineTo(hexagonPoints[i].x, hexagonPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成蓝色六边形纹理
  graphics.generateTexture('hexagonBlue', 120, 120);
  graphics.clear();
  
  // 绘制红色六边形纹理（拖拽时使用）
  graphics.fillStyle(0xe74c3c, 1);
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0].x, hexagonPoints[0].y);
  for (let i = 1; i < hexagonPoints.length; i++) {
    graphics.lineTo(hexagonPoints[i].x, hexagonPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色六边形纹理
  graphics.generateTexture('hexagonRed', 120, 120);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagonBlue');
  
  // 保存初始位置
  const initialX = hexagon.x;
  const initialY = hexagon.y;
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('hexagonRed');
  });
  
  // 监听拖拽事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    // 更新位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('hexagonBlue');
    
    // 回到初始位置（添加缓动效果）
    this.scene.tweens.add({
      targets: this,
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