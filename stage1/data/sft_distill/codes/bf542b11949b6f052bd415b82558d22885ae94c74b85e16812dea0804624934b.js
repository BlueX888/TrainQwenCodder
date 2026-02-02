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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  hexagon = this.add.graphics();
  
  // 设置六边形的中心位置
  hexagon.x = 400;
  hexagon.y = 300;
  
  // 绘制六边形
  drawHexagon(hexagon, 0, 0, 80);
}

function update(time, delta) {
  // 计算每帧旋转的角度
  // 80 度/秒 = 80 * (delta / 1000) 度/帧
  const rotationSpeed = 80; // 度/秒
  const deltaRotation = Phaser.Math.DegToRad(rotationSpeed * delta / 1000);
  
  // 累加旋转角度
  hexagon.rotation += deltaRotation;
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} centerX - 中心 X 坐标（相对于 graphics 对象）
 * @param {number} centerY - 中心 Y 坐标（相对于 graphics 对象）
 * @param {number} radius - 六边形外接圆半径
 */
function drawHexagon(graphics, centerX, centerY, radius) {
  // 设置填充和描边样式
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 计算六边形的 6 个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    // 六边形每个角度间隔 60 度，从顶部开始（-90 度）
    const angle = Phaser.Math.DegToRad(60 * i - 90);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
}

new Phaser.Game(config);