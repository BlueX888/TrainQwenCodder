const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制星形
  const graphics = this.add.graphics();
  
  // 设置星形的中心位置
  const centerX = 400;
  const centerY = 300;
  
  // 生成星形的顶点坐标
  const starPoints = createStarPoints(0, 0, 5, 80, 40);
  
  // 绘制星形
  graphics.fillStyle(0xffff00, 1);
  graphics.fillPoints(starPoints, true);
  
  // 设置 Graphics 对象的位置（作为旋转中心）
  graphics.x = centerX;
  graphics.y = centerY;
  
  // 将 graphics 对象存储到 scene 中，以便在 update 中访问
  this.star = graphics;
}

function update(time, delta) {
  // 每秒旋转 300 度
  // delta 是毫秒，需要转换为秒
  // 300 度 = 300 * (Math.PI / 180) 弧度
  const rotationSpeed = 300 * (Math.PI / 180); // 弧度/秒
  const deltaSeconds = delta / 1000; // 转换为秒
  
  // 更新旋转角度
  this.star.rotation += rotationSpeed * deltaSeconds;
}

/**
 * 创建星形的顶点坐标
 * @param {number} cx - 中心 X 坐标
 * @param {number} cy - 中心 Y 坐标
 * @param {number} spikes - 星形尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @returns {Array} 顶点坐标数组
 */
function createStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
  const points = [];
  const step = Math.PI / spikes;
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2; // 从顶部开始
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  return points;
}

new Phaser.Game(config);