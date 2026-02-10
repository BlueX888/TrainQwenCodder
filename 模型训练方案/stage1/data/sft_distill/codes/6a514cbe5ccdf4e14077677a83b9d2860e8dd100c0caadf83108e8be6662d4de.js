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

let triangle;
const rotationSpeed = Phaser.Math.DegToRad(240); // 每秒 240 度转换为弧度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  triangle = this.add.graphics();
  
  // 设置填充颜色
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（以原点为中心）
  // 定义三角形的三个顶点坐标（相对于原点）
  const size = 80;
  const x1 = 0;
  const y1 = -size; // 顶点
  const x2 = -size * 0.866; // cos(30°) ≈ 0.866
  const y2 = size * 0.5;
  const x3 = size * 0.866;
  const y3 = size * 0.5;
  
  triangle.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 将三角形移动到屏幕中心
  triangle.x = config.width / 2;
  triangle.y = config.height / 2;
  
  // 添加提示文本
  const text = this.add.text(10, 10, '三角形旋转速度: 240°/秒', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度
  triangle.rotation += rotationSpeed * deltaInSeconds;
}

// 创建游戏实例
new Phaser.Game(config);