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
}

/**
 * 在指定位置创建一个粉色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心 x 坐标
 * @param {number} y - 中心 y 坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 计算六边形的顶点坐标（半径为 16 像素，直径 32 像素）
  const radius = 16;
  const points = [];
  
  // 六边形有 6 个顶点，从顶部开始顺时针绘制
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始（-90度）
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(px, py));
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
}

new Phaser.Game(config);