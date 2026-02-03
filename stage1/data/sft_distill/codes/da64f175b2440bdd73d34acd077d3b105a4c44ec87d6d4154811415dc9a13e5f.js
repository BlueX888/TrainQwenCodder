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
let currentRotation = 0; // 当前旋转角度（弧度）

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象并绘制三角形
  triangle = this.add.graphics();
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const size = 80;
  const height = size * Math.sqrt(3) / 2;
  triangle.fillTriangle(
    0, -height * 2 / 3,           // 顶点
    -size / 2, height / 3,        // 左下角
    size / 2, height / 3          // 右下角
  );
  
  // 将三角形放置在屏幕中心
  triangle.x = 400;
  triangle.y = 300;
}

function update(time, delta) {
  // 每秒旋转 160 度
  const rotationSpeed = 160; // 度/秒
  const rotationSpeedRadians = Phaser.Math.DegToRad(rotationSpeed); // 转换为弧度/秒
  
  // 根据 delta 时间（毫秒）计算本帧应旋转的角度
  currentRotation += rotationSpeedRadians * (delta / 1000);
  
  // 应用旋转
  triangle.setRotation(currentRotation);
}

new Phaser.Game(config);