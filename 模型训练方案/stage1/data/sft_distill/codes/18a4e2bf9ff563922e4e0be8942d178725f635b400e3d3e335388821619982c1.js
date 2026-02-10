const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象
  triangle = this.add.graphics();
  
  // 设置填充颜色
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（以原点为中心）
  // 三个顶点坐标：顶部、左下、右下
  triangle.fillTriangle(
    0, -50,    // 顶点
    -40, 40,   // 左下
    40, 40     // 右下
  );
  
  // 将三角形移动到屏幕中心
  triangle.x = 400;
  triangle.y = 300;
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是毫秒，所以旋转速度 = (2 * Math.PI) / 1000 * delta
  const rotationSpeed = (2 * Math.PI) / 1000; // 每毫秒的弧度
  
  // 累加旋转角度
  triangle.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);