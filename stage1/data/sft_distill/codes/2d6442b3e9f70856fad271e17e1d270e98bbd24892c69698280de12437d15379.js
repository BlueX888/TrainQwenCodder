const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 六边形的旋转速度：200度/秒
const ROTATION_SPEED = Phaser.Math.DegToRad(200); // 转换为弧度/秒

let hexagon;

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
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  hexagon.fillPoints(points, true);
  
  // 设置旋转中心点为六边形的中心
  hexagon.x = 0;
  hexagon.y = 0;
}

function update(time, delta) {
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 更新旋转角度：当前角度 + 速度 * 时间
  hexagon.rotation += ROTATION_SPEED * deltaInSeconds;
  
  // 可选：将角度限制在 0-2π 范围内，避免数值过大
  if (hexagon.rotation > Math.PI * 2) {
    hexagon.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);