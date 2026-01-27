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
  // 创建一个 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制主圆形（蓝色）
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一个小圆点作为旋转标记（红色）
  graphics.fillStyle(0xe74c3c, 1);
  graphics.fillCircle(0, -60, 15);
  
  // 绘制一条从圆心到边缘的线作为旋转指示器
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(0, -80);
  graphics.strokePath();
  
  // 将 Graphics 放置在画布中心
  graphics.setPosition(400, 300);
  
  // 将 Graphics 对象存储到 scene 数据中，以便在 update 中访问
  this.rotatingCircle = graphics;
  
  // 添加提示文本
  this.add.text(400, 50, '圆形以每秒 80° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 每秒旋转 80 度 = 每毫秒旋转 80/1000 度
  const rotationSpeed = 80; // 度/秒
  const deltaRotation = (rotationSpeed * delta) / 1000; // 转换为度/毫秒
  
  // 将度数转换为弧度（Phaser 使用弧度）
  const deltaRotationRadians = Phaser.Math.DegToRad(deltaRotation);
  
  // 累加旋转角度
  this.rotatingCircle.rotation += deltaRotationRadians;
}

new Phaser.Game(config);