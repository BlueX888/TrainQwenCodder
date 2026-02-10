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
  
  // 绘制三角形（以原点为中心）
  // 三个顶点坐标相对于原点
  triangle.fillTriangle(
    0, -50,    // 顶部顶点
    -43, 25,   // 左下顶点
    43, 25     // 右下顶点
  );
  
  // 设置三角形位置到屏幕中心
  triangle.x = 400;
  triangle.y = 300;
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是毫秒，转换为秒需要除以 1000
  // 每帧旋转的弧度 = (2 * Math.PI) * (delta / 1000)
  const rotationSpeed = (2 * Math.PI) * (delta / 1000);
  
  // 累加旋转角度
  triangle.rotation += rotationSpeed;
}

new Phaser.Game(config);