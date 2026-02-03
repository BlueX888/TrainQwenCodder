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
  // 三个顶点坐标，形成一个等边三角形
  triangle.fillTriangle(
    0, -50,      // 顶点（上）
    -43, 25,     // 左下顶点
    43, 25       // 右下顶点
  );
  
  // 将三角形移动到屏幕中心
  triangle.x = 400;
  triangle.y = 300;
}

function update(time, delta) {
  // 将每秒 160 度转换为弧度
  const rotationSpeed = 160 * (Math.PI / 180); // 弧度/秒
  
  // 根据 delta 时间（毫秒）计算本帧应该旋转的角度
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  triangle.rotation += rotationDelta;
}

new Phaser.Game(config);