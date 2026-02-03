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
    createDiamond(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建灰色菱形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - 菱形中心 x 坐标
 * @param {number} y - 菱形中心 y 坐标
 */
function createDiamond(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 计算菱形四个顶点（16像素指的是菱形的宽高）
  const halfSize = 8; // 16 / 2
  
  // 创建菱形路径：上、右、下、左四个顶点
  const path = new Phaser.Geom.Polygon([
    x, y - halfSize,        // 上顶点
    x + halfSize, y,        // 右顶点
    x, y + halfSize,        // 下顶点
    x - halfSize, y         // 左顶点
  ]);
  
  // 填充路径
  graphics.fillPoints(path.points, true);
}

new Phaser.Game(config);