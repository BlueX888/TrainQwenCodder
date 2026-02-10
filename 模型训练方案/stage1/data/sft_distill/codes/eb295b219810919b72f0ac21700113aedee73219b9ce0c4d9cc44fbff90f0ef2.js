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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  this.triangle = this.add.graphics();
  
  // 设置三角形的位置到屏幕中心
  this.triangle.x = 400;
  this.triangle.y = 300;
  
  // 设置填充颜色
  this.triangle.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心点在原点）
  // 三角形的顶点相对于 Graphics 对象的原点
  const size = 80;
  const height = size * Math.sqrt(3) / 2;
  
  this.triangle.fillTriangle(
    0, -height * 2 / 3,           // 顶点（上）
    -size / 2, height / 3,        // 左下顶点
    size / 2, height / 3          // 右下顶点
  );
  
  // 初始化旋转角度
  this.currentRotation = 0;
}

function update(time, delta) {
  // 每秒旋转 120 度
  // 120 度 = 120 * (Math.PI / 180) = 2.0944 弧度
  const rotationSpeed = (120 * Math.PI / 180); // 弧度/秒
  
  // 根据 delta（毫秒）计算本帧应旋转的角度
  this.currentRotation += rotationSpeed * (delta / 1000);
  
  // 应用旋转
  this.triangle.rotation = this.currentRotation;
}

new Phaser.Game(config);