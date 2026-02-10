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
const rotationSpeed = 80; // 每秒旋转 80 度

function preload() {
  // 无需预加载外部资源
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
  // 将 delta（毫秒）转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应旋转的角度（度转弧度）
  const rotationDelta = rotationSpeed * deltaSeconds * (Math.PI / 180);
  
  // 累加旋转角度
  hexagon.rotation += rotationDelta;
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} centerX - 中心点 X 坐标（相对于 graphics 对象）
 * @param {number} centerY - 中心点 Y 坐标（相对于 graphics 对象）
 * @param {number} radius - 六边形外接圆半径
 */
function drawHexagon(graphics, centerX, centerY, radius) {
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度（π/3 弧度）
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 设置填充样式并绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillPoints(points, true);
  
  // 添加描边使六边形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePoints(points, true);
}

new Phaser.Game(config);