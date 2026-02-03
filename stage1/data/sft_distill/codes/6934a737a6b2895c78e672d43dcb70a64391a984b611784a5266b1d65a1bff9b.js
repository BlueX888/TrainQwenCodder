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
  
  // 使用 Graphics 绘制青色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(3, 0xffffff, 1); // 白色边框
  
  const hexRadius = 60;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: hexRadius + Math.cos(angle) * hexRadius,
      y: hexRadius + Math.sin(angle) * hexRadius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成青色六边形纹理
  graphics.generateTexture('hexagonCyan', hexRadius * 2, hexRadius * 2);
  
  // 绘制黄色六边形纹理（拖拽时使用）
  graphics.clear();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(3, 0xffffff, 1);
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成黄色六边形纹理
  graphics.generateTexture('hexagonYellow', hexRadius * 2, hexRadius * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建六边形 Sprite
  const hexagon = this.add.sprite(initialX, initialY, 'hexagonCyan');
  
  // 启用交互
  hexagon.setInteractive({ draggable: true });
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', (pointer) => {
    // 改变为黄色纹理
    hexagon.setTexture('hexagonYellow');
    // 增加缩放效果
    hexagon.setScale(1.1);
  });
  
  // 监听拖拽事件
  hexagon.on('drag', (pointer, dragX, dragY) => {
    // 更新六边形位置
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', (pointer) => {
    // 恢复青色纹理
    hexagon.setTexture('hexagonCyan');
    // 恢复原始缩放
    hexagon.setScale(1);
    
    // 添加缓动动画回到初始位置
    this.tweens.add({
      targets: hexagon,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加悬停效果
  hexagon.on('pointerover', () => {
    if (!hexagon.getData('isDragging')) {
      hexagon.setScale(1.05);
    }
  });
  
  hexagon.on('pointerout', () => {
    if (!hexagon.getData('isDragging')) {
      hexagon.setScale(1);
    }
  });
}

new Phaser.Game(config);