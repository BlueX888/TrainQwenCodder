const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createHexagon(this, pointer.x, pointer.y);
  });

  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成六边形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建橙色六边形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  const radius = 12; // 半径12像素，直径24像素
  const sides = 6;
  
  // 计算六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始，每60度一个顶点
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(px, py);
  }
  
  // 创建多边形路径
  const polygon = new Phaser.Geom.Polygon(points);
  
  // 设置橙色填充 (RGB: 255, 165, 0)
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制六边形
  graphics.fillPoints(polygon.points, true);
}

new Phaser.Game(config);