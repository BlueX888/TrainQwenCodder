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
  
  // 绘制一个蓝色圆形
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的红色线，用于观察旋转效果
  graphics.lineStyle(4, 0xe74c3c, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 绘制圆心标记点
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, 8);
  
  // 将 graphics 放置在屏幕中心
  graphics.setPosition(400, 300);
  
  // 将 graphics 对象存储到 scene 数据中，以便在 update 中访问
  this.rotatingCircle = graphics;
  
  // 添加说明文本
  this.add.text(400, 50, '圆形以每秒 80 度的速度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 计算本帧应该旋转的角度
  // 80 度/秒 = 80 * (delta / 1000) 度/帧
  const rotationSpeed = 80; // 度/秒
  const rotationDelta = Phaser.Math.DegToRad(rotationSpeed * delta / 1000);
  
  // 累加旋转角度
  this.rotatingCircle.rotation += rotationDelta;
}

new Phaser.Game(config);