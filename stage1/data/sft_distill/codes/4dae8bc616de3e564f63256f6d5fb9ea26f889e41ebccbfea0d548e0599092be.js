const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipseGraphics;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipseGraphics = this.add.graphics();
  
  // 设置填充颜色
  ellipseGraphics.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（中心点在原点，宽度 200，高度 100）
  ellipseGraphics.fillEllipse(0, 0, 200, 100);
  
  // 将椭圆定位到画布中心
  ellipseGraphics.x = 400;
  ellipseGraphics.y = 300;
}

function update(time, delta) {
  // 每秒旋转 200 度
  // 将度数转换为弧度：200 * (Math.PI / 180) ≈ 3.49 弧度/秒
  const rotationSpeed = 200 * (Math.PI / 180); // 弧度/秒
  
  // 根据 delta（毫秒）计算本帧应旋转的角度
  const rotationThisFrame = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  ellipseGraphics.rotation += rotationThisFrame;
}

new Phaser.Game(config);