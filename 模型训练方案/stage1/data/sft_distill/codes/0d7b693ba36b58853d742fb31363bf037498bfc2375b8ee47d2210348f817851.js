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
  
  // 创建蓝色六边形纹理
  const blueGraphics = this.add.graphics();
  blueGraphics.fillStyle(0x3498db, 1);
  blueGraphics.lineStyle(3, 0x2980b9, 1);
  
  // 绘制六边形路径
  const hexRadius = 50;
  const hexPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    hexPath.push(new Phaser.Math.Vector2(x, y));
  }
  
  blueGraphics.beginPath();
  blueGraphics.moveTo(hexPath[0].x, hexPath[0].y);
  for (let i = 1; i < hexPath.length; i++) {
    blueGraphics.lineTo(hexPath[i].x, hexPath[i].y);
  }
  blueGraphics.closePath();
  blueGraphics.fillPath();
  blueGraphics.strokePath();
  
  // 生成蓝色六边形纹理
  blueGraphics.generateTexture('hexBlue', hexRadius * 2, hexRadius * 2);
  blueGraphics.destroy();
  
  // 创建红色六边形纹理（拖拽时使用）
  const redGraphics = this.add.graphics();
  redGraphics.fillStyle(0xe74c3c, 1);
  redGraphics.lineStyle(3, 0xc0392b, 1);
  
  redGraphics.beginPath();
  redGraphics.moveTo(hexPath[0].x, hexPath[0].y);
  for (let i = 1; i < hexPath.length; i++) {
    redGraphics.lineTo(hexPath[i].x, hexPath[i].y);
  }
  redGraphics.closePath();
  redGraphics.fillPath();
  redGraphics.strokePath();
  
  // 生成红色六边形纹理
  redGraphics.generateTexture('hexRed', hexRadius * 2, hexRadius * 2);
  redGraphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexBlue');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive();
  this.input.setDraggable(hexagon);
  
  // 添加提示文字
  const hintText = this.add.text(400, 100, '拖动六边形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  hintText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', function(pointer) {
    // 改变为红色
    this.setTexture('hexRed');
    // 提升层级
    this.setScale(1.1);
  });
  
  // 监听拖拽事件
  hexagon.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', function(pointer) {
    // 恢复蓝色
    this.setTexture('hexBlue');
    // 恢复大小
    this.setScale(1);
    
    // 使用缓动动画回到初始位置
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
    if (!this.scene.input.dragState) {
      this.setScale(1.05);
    }
  });
  
  hexagon.on('pointerout', function() {
    if (!this.scene.input.dragState) {
      this.setScale(1);
    }
  });
}

new Phaser.Game(config);