const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
 * 在指定位置创建橙色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 六边形中心 x 坐标
 * @param {number} y - 六边形中心 y 坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 六边形半径（24像素指的是外接圆半径）
  const radius = 12;
  
  // 计算六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(px, py));
  }
  
  // 设置填充颜色为橙色
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制并填充六边形
  graphics.fillPoints(points, true);
}

new Phaser.Game(config);