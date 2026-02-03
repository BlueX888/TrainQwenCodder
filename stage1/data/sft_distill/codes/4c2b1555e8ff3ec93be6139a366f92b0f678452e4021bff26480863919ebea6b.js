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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点
  const radius = 60;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexPoints.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  const textureSize = radius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件 - 放大到 1.2 倍
  hexagon.on('dragstart', (pointer, dragX, dragY) => {
    hexagon.setScale(1.2);
  });
  
  // 监听拖拽事件 - 更新位置
  hexagon.on('drag', (pointer, dragX, dragY) => {
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件 - 恢复原大小
  hexagon.on('dragend', (pointer, dragX, dragY) => {
    hexagon.setScale(1.0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);