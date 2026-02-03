const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 存储椭圆图形对象
let ellipseGraphics;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipseGraphics = this.add.graphics();
  
  // 设置椭圆的位置（中心点）
  ellipseGraphics.x = 400;
  ellipseGraphics.y = 300;
  
  // 设置填充样式并绘制椭圆
  // 椭圆中心在 (0, 0)，这样旋转时会围绕中心点旋转
  ellipseGraphics.fillStyle(0x00ff00, 1);
  ellipseGraphics.fillEllipse(0, 0, 150, 80); // 宽150，高80的椭圆
  
  // 添加描边以更清晰地看到旋转效果
  ellipseGraphics.lineStyle(3, 0xffffff, 1);
  ellipseGraphics.strokeEllipse(0, 0, 150, 80);
  
  // 在椭圆上添加一个标记点，便于观察旋转
  ellipseGraphics.fillStyle(0xff0000, 1);
  ellipseGraphics.fillCircle(75, 0, 8); // 在右侧边缘添加红色圆点
}

function update(time, delta) {
  // 每秒旋转 240 度
  // 240 度 = 240 * (Math.PI / 180) = 4.189 弧度
  const rotationSpeed = 240 * (Math.PI / 180); // 弧度/秒
  
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度
  ellipseGraphics.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);