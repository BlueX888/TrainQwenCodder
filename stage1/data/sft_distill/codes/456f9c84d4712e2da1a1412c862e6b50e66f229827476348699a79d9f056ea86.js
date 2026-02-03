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
  // 创建星形图形对象
  const star = this.add.graphics();
  
  // 设置填充颜色为黄色
  star.fillStyle(0xffff00, 1);
  
  // 生成星形的顶点坐标
  const starPoints = createStarPoints(0, 0, 5, 80, 40);
  
  // 填充星形路径
  star.fillPoints(starPoints, true);
  
  // 将星形移动到屏幕中心
  star.x = 400;
  star.y = 300;
  
  // 将星形对象保存到场景数据中，以便在 update 中访问
  this.star = star;
  
  // 添加文字说明
  this.add.text(10, 10, '星形旋转速度: 200°/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧应旋转的角度（弧度）
  // delta 是以毫秒为单位，转换为秒：delta / 1000
  // 200 度转换为弧度：200 * Math.PI / 180
  const rotationSpeed = 200 * Math.PI / 180; // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 更新星形的旋转角度
  this.star.rotation += rotationDelta;
}

/**
 * 生成星形的顶点坐标
 * @param {number} cx - 中心 x 坐标
 * @param {number} cy - 中心 y 坐标
 * @param {number} spikes - 星形尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @returns {Phaser.Geom.Point[]} 星形顶点数组
 */
function createStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
  const points = [];
  const step = Math.PI / spikes;
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2; // 从顶部开始
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  return points;
}

new Phaser.Game(config);