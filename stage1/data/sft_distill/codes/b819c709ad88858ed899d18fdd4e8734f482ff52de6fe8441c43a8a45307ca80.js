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
  // 不需要预加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 创建紫色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点
  const radius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
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
  graphics.generateTexture('hexagon-purple', radius * 2, radius * 2);
  graphics.clear();
  
  // 绘制黄色六边形纹理（拖拽时使用）
  graphics.fillStyle(0xf1c40f, 1); // 黄色
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成黄色纹理
  graphics.generateTexture('hexagon-yellow', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagon-purple');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hintText = this.add.text(400, 100, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  hintText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', (pointer) => {
    // 改变为黄色
    hexagon.setTexture('hexagon-yellow');
    // 增加缩放效果
    hexagon.setScale(1.1);
  });
  
  // 监听拖拽中事件
  hexagon.on('drag', (pointer, dragX, dragY) => {
    // 更新六边形位置
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', (pointer) => {
    // 恢复紫色
    hexagon.setTexture('hexagon-purple');
    // 恢复原始缩放
    hexagon.setScale(1);
    
    // 使用 tween 动画回到初始位置
    this.tweens.add({
      targets: hexagon,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加鼠标悬停效果
  hexagon.on('pointerover', () => {
    if (!hexagon.input.isDragging) {
      hexagon.setScale(1.05);
    }
  });
  
  hexagon.on('pointerout', () => {
    if (!hexagon.input.isDragging) {
      hexagon.setScale(1);
    }
  });
}

new Phaser.Game(config);