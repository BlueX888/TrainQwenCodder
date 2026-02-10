const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipseGraphics;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制椭圆
  ellipseGraphics = this.add.graphics();
  
  // 设置椭圆的位置到画布中心
  ellipseGraphics.x = 400;
  ellipseGraphics.y = 300;
  
  // 设置填充样式并绘制椭圆
  // 椭圆中心在 (0, 0)，宽度 200，高度 100
  ellipseGraphics.fillStyle(0x00ff00, 1);
  ellipseGraphics.fillEllipse(0, 0, 200, 100);
  
  // 添加一个参考点（小圆点）以便观察旋转效果
  ellipseGraphics.fillStyle(0xff0000, 1);
  ellipseGraphics.fillCircle(100, 0, 8);
}

function update(time, delta) {
  // 每秒旋转 200 度
  // 将角速度从度转换为弧度：200 * (Math.PI / 180)
  const rotationSpeed = 200 * (Math.PI / 180); // 弧度/秒
  
  // delta 是毫秒，转换为秒：delta / 1000
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  ellipseGraphics.rotation += rotationIncrement;
}

new Phaser.Game(config);