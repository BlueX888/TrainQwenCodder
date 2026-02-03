const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置星形的中心位置
  const centerX = 400;
  const centerY = 300;
  
  // 绘制星形
  drawStar(graphics, centerX, centerY, 5, 80, 40, 0xffff00);
  
  // 将 graphics 对象保存到全局变量以便在 update 中使用
  star = graphics;
}

function update(time, delta) {
  // 计算旋转增量：每秒160度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 160; // 度/秒
  const rotationIncrement = Phaser.Math.DegToRad(rotationSpeed * (delta / 1000));
  
  // 更新星形的旋转角度
  star.rotation += rotationIncrement;
}

/**
 * 绘制星形的辅助函数
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} cx - 中心 X 坐标
 * @param {number} cy - 中心 Y 坐标
 * @param {number} spikes - 星形的尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @param {number} color - 填充颜色
 */
function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color) {
  const points = [];
  const step = Math.PI / spikes;
  
  // 生成星形的顶点坐标
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    points.push(new Phaser.Geom.Point(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius
    ));
  }
  
  // 设置填充样式并绘制星形
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);