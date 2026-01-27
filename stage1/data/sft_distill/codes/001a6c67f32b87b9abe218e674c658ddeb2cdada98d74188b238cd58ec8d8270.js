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
  
  // 绘制一个蓝色的圆形
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心指向右侧的红色线段，用于观察旋转
  graphics.lineStyle(4, 0xe74c3c, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 绘制圆心标记点
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, 5);
  
  // 将圆形放置在画布中心
  graphics.setPosition(400, 300);
  
  // 将 graphics 对象存储到 scene 数据中，以便在 update 中访问
  this.rotatingCircle = graphics;
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 80; // 度/秒
  const deltaSeconds = delta / 1000; // 转换为秒
  const rotationDelta = Phaser.Math.DegToRad(rotationSpeed * deltaSeconds); // 转换为弧度
  
  // 累加旋转角度
  this.rotatingCircle.rotation += rotationDelta;
}

new Phaser.Game(config);