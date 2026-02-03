const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制六边形并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制六边形路径
  const radius = 16; // 半径16像素，直径32像素
  const hexagonPath = new Phaser.Geom.Polygon();
  const points = [];
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  hexagonPath.setTo(points);
  graphics.fillPoints(hexagonPath.points, true);
  
  // 生成32x32的纹理
  graphics.generateTexture('hexagon', 32, 32);
  graphics.destroy();
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建六边形图像
    this.add.image(pointer.x, pointer.y, 'hexagon');
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create hexagons', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);