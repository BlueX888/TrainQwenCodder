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
  // 无需加载外部资源
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成橙色三角形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createTriangle(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个橙色三角形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 */
function createTriangle(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 计算等边三角形的三个顶点
  // 64像素指的是三角形的边长
  const size = 64;
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  // 三个顶点坐标（以中心点为基准）
  const x1 = x;                    // 顶点（上）
  const y1 = y - height * 2 / 3;
  
  const x2 = x - size / 2;         // 左下顶点
  const y2 = y + height / 3;
  
  const x3 = x + size / 2;         // 右下顶点
  const y3 = y + height / 3;
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
}

// 启动游戏
new Phaser.Game(config);