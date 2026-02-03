const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipseGraphics;
let currentRotation = 0; // 当前旋转角度（弧度）

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipseGraphics = this.add.graphics();
  
  // 设置椭圆样式和绘制
  ellipseGraphics.fillStyle(0x00ff00, 1); // 绿色填充
  ellipseGraphics.fillEllipse(0, 0, 200, 100); // 在局部坐标 (0,0) 绘制椭圆，宽200高100
  
  // 设置椭圆位置到屏幕中心
  ellipseGraphics.x = 400;
  ellipseGraphics.y = 300;
  
  // 添加边框以便更清楚地看到旋转效果
  ellipseGraphics.lineStyle(3, 0xffffff, 1);
  ellipseGraphics.strokeEllipse(0, 0, 200, 100);
  
  // 添加一个标记点，方便观察旋转
  ellipseGraphics.fillStyle(0xff0000, 1);
  ellipseGraphics.fillCircle(100, 0, 8); // 在椭圆右侧添加红色圆点
}

function update(time, delta) {
  // 每秒旋转 160 度
  // delta 是毫秒，需要转换为秒：delta / 1000
  // 角度转弧度：度 * Math.PI / 180
  const rotationSpeed = 160; // 度/秒
  const rotationIncrement = (rotationSpeed * delta / 1000) * (Math.PI / 180);
  
  // 累加旋转角度
  currentRotation += rotationIncrement;
  
  // 应用旋转到椭圆
  ellipseGraphics.rotation = currentRotation;
}

new Phaser.Game(config);