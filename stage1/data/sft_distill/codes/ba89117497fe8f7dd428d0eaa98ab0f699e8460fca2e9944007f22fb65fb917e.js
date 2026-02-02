const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点坐标
  const hexRadius = 60;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
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
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建六边形 Sprite
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  hexagon.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 拖拽时放大到 1.2 倍
    hexagon.setScale(1.2);
  });
  
  // 监听拖拽中事件
  hexagon.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新六边形位置
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 松手后恢复原大小
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