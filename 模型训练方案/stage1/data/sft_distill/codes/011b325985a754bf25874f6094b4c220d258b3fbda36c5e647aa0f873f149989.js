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
  // 创建 Graphics 对象并绘制三角形
  triangle = this.add.graphics();
  
  // 设置填充颜色
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形，中心点在原点
  const size = 100;
  const height = size * Math.sqrt(3) / 2;
  
  triangle.fillTriangle(
    0, -height * 2 / 3,           // 顶点
    -size / 2, height / 3,        // 左下角
    size / 2, height / 3          // 右下角
  );
  
  // 将三角形移动到屏幕中心
  triangle.x = 400;
  triangle.y = 300;
}

function update(time, delta) {
  // 计算旋转角度增量
  // 每秒 200 度 = 200 * (Math.PI / 180) 弧度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 200 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 更新三角形的旋转角度
  triangle.rotation += rotationDelta;
}

new Phaser.Game(config);