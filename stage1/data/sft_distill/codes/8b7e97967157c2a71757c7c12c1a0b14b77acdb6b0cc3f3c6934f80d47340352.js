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
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制一个白色圆形
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的红色线条，用于观察旋转
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆的边缘绘制一个小圆点，增强旋转视觉效果
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(80, 0, 10);
  
  // 将 Graphics 放置在画布中心
  graphics.setPosition(400, 300);
  
  // 将 graphics 存储到 scene 数据中，以便在 update 中访问
  this.rotatingCircle = graphics;
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，需要转换：80度/秒 = 80 * (delta/1000) 度/帧
  const rotationSpeed = 80; // 度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 度/帧
  
  // 将度数转换为弧度（Phaser 使用弧度）
  const rotationInRadians = Phaser.Math.DegToRad(rotationIncrement);
  
  // 累加旋转角度
  this.rotatingCircle.rotation += rotationInRadians;
}

new Phaser.Game(config);