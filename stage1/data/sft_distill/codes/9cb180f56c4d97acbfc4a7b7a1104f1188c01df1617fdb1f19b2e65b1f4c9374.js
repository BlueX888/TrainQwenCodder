const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let hexagon;
const rotationSpeed = 80; // 每秒旋转80度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标（中心在原点）
  const radius = 80;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制六边形（需要平移到中心位置）
  graphics.translateCanvas(100, 100);
  graphics.fillPolygon(hexPoints);
  graphics.translateCanvas(-100, -100);
  
  // 生成纹理
  graphics.generateTexture('hexagonTexture', 200, 200);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建精灵并设置位置到屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagonTexture');
  
  // 添加提示文本
  const text = this.add.text(400, 500, '六边形以每秒80度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 根据 delta 时间更新旋转角度
  // delta 是毫秒，需要转换为秒
  const deltaSeconds = delta / 1000;
  const rotationDelta = rotationSpeed * deltaSeconds;
  
  // 累加角度
  hexagon.angle += rotationDelta;
}

new Phaser.Game(config);