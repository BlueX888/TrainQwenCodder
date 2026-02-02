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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点
  const radius = 50;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexPoints.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置为可交互和可拖拽
  hexagon.setInteractive({ draggable: true });
  
  // 添加拖拽开始事件 - 放大到 1.2 倍
  hexagon.on('dragstart', function(pointer, dragX, dragY) {
    this.setScale(1.2);
  });
  
  // 添加拖拽事件 - 更新位置
  hexagon.on('drag', function(pointer, dragX, dragY) {
    this.x = dragX;
    this.y = dragY;
  });
  
  // 添加拖拽结束事件 - 恢复原大小
  hexagon.on('dragend', function(pointer, dragX, dragY) {
    this.setScale(1.0);
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);