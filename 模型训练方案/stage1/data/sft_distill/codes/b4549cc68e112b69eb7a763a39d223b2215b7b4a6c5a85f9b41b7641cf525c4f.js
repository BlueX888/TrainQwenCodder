const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createTriangle(this, pointer.x, pointer.y);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击任意位置生成三角形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

/**
 * 在指定位置创建一个青色三角形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 三角形中心 X 坐标
 * @param {number} y - 三角形中心 Y 坐标
 */
function createTriangle(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 计算等边三角形的顶点坐标（边长80像素）
  const size = 80;
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  // 三个顶点相对于中心的坐标
  const point1X = x;
  const point1Y = y - (height * 2 / 3); // 顶部顶点
  
  const point2X = x - size / 2;
  const point2Y = y + (height / 3); // 左下顶点
  
  const point3X = x + size / 2;
  const point3Y = y + (height / 3); // 右下顶点
  
  // 绘制填充三角形
  graphics.fillTriangle(
    point1X, point1Y,
    point2X, point2Y,
    point3X, point3Y
  );
}

new Phaser.Game(config);