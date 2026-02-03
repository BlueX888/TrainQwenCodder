const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制三角形
  this.triangle = this.add.graphics();
  
  // 设置三角形的位置到屏幕中心
  this.triangle.x = 400;
  this.triangle.y = 300;
  
  // 设置填充颜色为蓝色
  this.triangle.fillStyle(0x00aaff, 1);
  
  // 绘制一个等腰三角形（顶点相对于 Graphics 对象的原点）
  // 参数：x1, y1, x2, y2, x3, y3
  this.triangle.fillTriangle(
    0, -60,    // 顶部顶点
    -50, 60,   // 左下顶点
    50, 60     // 右下顶点
  );
  
  // 初始化旋转角度
  this.currentRotation = 0;
}

function update(time, delta) {
  // 每秒 240 度 = 240 * (Math.PI / 180) 弧度/秒 ≈ 4.189 弧度/秒
  const rotationSpeed = 240 * (Math.PI / 180); // 弧度/秒
  
  // 根据 delta（毫秒）计算本帧应该旋转的角度
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  this.currentRotation += rotationDelta;
  
  // 应用旋转到三角形
  this.triangle.rotation = this.currentRotation;
}

new Phaser.Game(config);