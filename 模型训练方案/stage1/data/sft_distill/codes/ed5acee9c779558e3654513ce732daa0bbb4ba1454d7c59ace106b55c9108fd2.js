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

let ellipseGraphics;
let rotationSpeed; // 弧度每秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  ellipseGraphics = this.add.graphics();
  
  // 设置椭圆的样式和位置
  ellipseGraphics.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（中心点在原点，这样旋转更自然）
  // fillEllipse(x, y, width, height)
  ellipseGraphics.fillEllipse(0, 0, 200, 100);
  
  // 将椭圆移动到屏幕中心
  ellipseGraphics.x = 400;
  ellipseGraphics.y = 300;
  
  // 设置旋转速度：160度/秒 转换为弧度/秒
  rotationSpeed = (160 * Math.PI) / 180;
  
  // 初始旋转角度
  ellipseGraphics.rotation = 0;
  
  // 添加提示文本
  this.add.text(10, 10, 'Ellipse rotating at 160 degrees per second', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度
  ellipseGraphics.rotation += rotationSpeed * deltaInSeconds;
  
  // 可选：将角度标准化到 0-2π 范围内（防止数值过大）
  if (ellipseGraphics.rotation > Math.PI * 2) {
    ellipseGraphics.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);