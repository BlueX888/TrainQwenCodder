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
    0, -height * 2/3,           // 顶点
    -size/2, height * 1/3,      // 左下
    size/2, height * 1/3        // 右下
  );
  
  // 设置三角形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 存储到 scene 数据中，便于在 update 中访问
  this.triangle = graphics;
  
  // 添加文字提示
  this.add.text(10, 10, '三角形以每秒 160° 旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  
  // 每秒旋转 160 度，转换为弧度
  const rotationSpeed = 160 * (Math.PI / 180); // 弧度/秒
  
  // 更新旋转角度
  this.triangle.rotation += rotationSpeed * deltaSeconds;
}

new Phaser.Game(config);