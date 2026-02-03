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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  ellipseGraphics = this.add.graphics();
  
  // 设置填充颜色
  ellipseGraphics.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（相对于 Graphics 对象的原点）
  // 参数：x, y, 水平半径, 垂直半径
  ellipseGraphics.fillEllipse(0, 0, 120, 60);
  
  // 设置椭圆位置到屏幕中心
  ellipseGraphics.setPosition(400, 300);
  
  // 添加提示文字
  this.add.text(400, 50, '椭圆旋转速度: 80度/秒', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 计算旋转增量：80度/秒 转换为 弧度/毫秒
  // 80度 = 80 * (Math.PI / 180) 弧度
  // delta 是毫秒，所以 delta / 1000 转换为秒
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  currentRotation += rotationDelta;
  
  // 应用旋转
  ellipseGraphics.rotation = currentRotation;
}

new Phaser.Game(config);