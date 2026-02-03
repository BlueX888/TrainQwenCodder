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
  // 无需预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 绘制蓝色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径为 50）
  const hexRadius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: hexRadius + Math.cos(angle) * hexRadius,
      y: hexRadius + Math.sin(angle) * hexRadius
    });
  }
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x0066ff, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成蓝色六边形纹理
  graphics.generateTexture('hexBlue', hexRadius * 2, hexRadius * 2);
  graphics.clear();
  
  // 绘制红色六边形纹理（用于拖拽时）
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色六边形纹理
  graphics.generateTexture('hexRed', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexBlue');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('hexRed');
    // 增加缩放效果
    this.setScale(1.1);
  });
  
  // 监听拖拽事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    // 更新位置到鼠标位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('hexBlue');
    // 恢复缩放
    this.setScale(1);
    
    // 使用 tween 动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加悬停效果
  hexagon.on('pointerover', function() {
    if (!this.scene.input.activePointer.isDown) {
      this.setScale(1.05);
    }
  });
  
  hexagon.on('pointerout', function() {
    if (!this.scene.input.activePointer.isDown) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);