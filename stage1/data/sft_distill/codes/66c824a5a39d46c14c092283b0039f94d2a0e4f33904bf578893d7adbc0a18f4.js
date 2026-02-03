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
  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制矩形，以中心为原点（-100, -75 到 100, 75，总尺寸 200x150）
  graphics.fillRect(-100, -75, 200, 150);
  
  // 设置矩形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 数据中，以便在 update 中访问
  this.rotatingRect = graphics;
}

function update(time, delta) {
  // 每秒旋转 200 度
  // delta 是毫秒，转换为秒：delta / 1000
  // 每帧旋转的角度 = 200 * (delta / 1000)
  const rotationSpeed = 200; // 度/秒
  const deltaAngle = rotationSpeed * (delta / 1000);
  
  // 累加角度
  this.rotatingRect.angle += deltaAngle;
}

new Phaser.Game(config);