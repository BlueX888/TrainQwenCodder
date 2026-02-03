const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
const rotationSpeed = 160; // 每秒旋转 160 度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  hexagon = this.add.graphics();
  
  // 设置填充颜色
  hexagon.fillStyle(0x00ff00, 1);
  
  // 计算六边形的六个顶点
  const centerX = 400;
  const centerY = 300;
  const radius = 100;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  hexagon.fillPoints(points, true);
  
  // 设置旋转中心点为六边形中心
  hexagon.x = 0;
  hexagon.y = 0;
}

function update(time, delta) {
  // 计算旋转增量（delta 单位是毫秒，需要转换为秒）
  const rotationDelta = Phaser.Math.DegToRad(rotationSpeed) * (delta / 1000);
  
  // 更新旋转角度
  hexagon.rotation += rotationDelta;
}

new Phaser.Game(config);