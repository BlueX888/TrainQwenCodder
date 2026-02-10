const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let currentRotation = 0;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建星形的顶点坐标（五角星）
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 80;
  const innerRadius = 35;
  const points = [];
  
  // 生成星形的10个顶点（5个外顶点 + 5个内顶点交替）
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI / 5) - Math.PI / 2; // 从顶部开始
    points.push(new Phaser.Geom.Point(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ));
  }
  
  // 使用 Graphics 绘制星形
  star = this.add.graphics();
  star.fillStyle(0xffff00, 1);
  star.fillPoints(points, true);
  
  // 设置星形的位置（Graphics 的原点在 0,0，需要平移）
  star.x = centerX;
  star.y = centerY;
  
  // 添加提示文本
  this.add.text(400, 550, '星形旋转速度: 160度/秒', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 计算旋转增量：160度/秒 转换为弧度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = Phaser.Math.DegToRad(160); // 160度转弧度
  const rotationDelta = rotationSpeed * (delta / 1000); // 根据时间增量计算旋转量
  
  // 累加旋转角度
  currentRotation += rotationDelta;
  
  // 应用旋转
  star.setRotation(currentRotation);
}

new Phaser.Game(config);