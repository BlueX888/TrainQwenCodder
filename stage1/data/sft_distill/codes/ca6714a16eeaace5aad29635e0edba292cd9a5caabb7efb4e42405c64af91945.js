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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  triangle = this.add.graphics();
  
  // 设置填充颜色
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（相对于 Graphics 对象的中心点）
  // 三角形顶点坐标：顶部(0, -50), 左下(50, 50), 右下(-50, 50)
  triangle.fillTriangle(
    0, -50,   // 顶部顶点
    -50, 50,  // 左下顶点
    50, 50    // 右下顶点
  );
  
  // 将三角形移动到屏幕中心
  triangle.x = 400;
  triangle.y = 300;
}

function update(time, delta) {
  // 每秒 200 度 = 200 * (Math.PI / 180) 弧度/秒
  // delta 是毫秒，需要转换为秒：delta / 1000
  const rotationSpeed = 200 * (Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 更新旋转角度
  triangle.rotation += rotationIncrement;
}

new Phaser.Game(config);