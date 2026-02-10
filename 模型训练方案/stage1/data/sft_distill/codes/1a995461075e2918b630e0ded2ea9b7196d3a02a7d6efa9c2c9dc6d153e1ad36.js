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
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const size = 80;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.fillTriangle(
    0, -height * 2/3,           // 顶点（上）
    -size/2, height * 1/3,      // 左下顶点
    size/2, height * 1/3        // 右下顶点
  );
  
  // 设置三角形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 数据中，方便 update 访问
  this.triangle = graphics;
  
  // 添加提示文本
  this.add.text(10, 10, '三角形旋转速度: 240°/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 每秒旋转 240 度
  // delta 是毫秒，240 度/秒 = 240/1000 度/毫秒
  // 转换为弧度：角度 * Math.PI / 180
  const rotationSpeed = 240; // 度/秒
  const rotationPerMs = rotationSpeed / 1000; // 度/毫秒
  const rotationRad = Phaser.Math.DegToRad(rotationPerMs * delta);
  
  // 累加旋转角度
  this.triangle.rotation += rotationRad;
}

new Phaser.Game(config);