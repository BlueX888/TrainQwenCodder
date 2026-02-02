const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createHexagon(this, pointer.x, pointer.y);
  });

  // 添加提示文本
  this.add.text(400, 300, 'Click anywhere to create hexagons', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建粉色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
  
  // 计算六边形的6个顶点（半径为16像素，使边长约为32像素）
  const radius = 16;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(px, py));
  }
  
  // 创建多边形并填充
  const hexagon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(hexagon.points, true);
  
  // 可选：添加描边使六边形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePoints(hexagon.points, true);
}

new Phaser.Game(config);