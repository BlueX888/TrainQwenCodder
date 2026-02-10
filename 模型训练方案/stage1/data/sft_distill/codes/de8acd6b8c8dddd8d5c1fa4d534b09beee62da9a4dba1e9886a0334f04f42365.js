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
  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制一个等边三角形（中心在原点）
  // 三角形顶点相对于中心点的坐标
  const size = 80;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.fillTriangle(
    0, -height * 2/3,           // 顶部顶点
    -size/2, height * 1/3,      // 左下顶点
    size/2, height * 1/3        // 右下顶点
  );
  
  // 设置三角形位置到画布中心
  graphics.setPosition(400, 300);
  
  // 将 graphics 对象保存到 scene 数据中，以便在 update 中访问
  this.triangle = graphics;
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是毫秒，转换为秒：delta / 1000
  // 旋转速度：2 * Math.PI 弧度/秒
  const rotationSpeed = 2 * Math.PI; // 弧度/秒
  
  // 更新旋转角度
  this.triangle.rotation += rotationSpeed * (delta / 1000);
}

new Phaser.Game(config);