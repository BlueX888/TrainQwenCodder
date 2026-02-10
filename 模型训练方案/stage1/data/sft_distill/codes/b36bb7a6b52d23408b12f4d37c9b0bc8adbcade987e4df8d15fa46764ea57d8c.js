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
  this.rotatingCircle = this.add.graphics();
  
  // 设置圆形位置到画布中心
  this.rotatingCircle.x = 400;
  this.rotatingCircle.y = 300;
  
  // 绘制主圆形（蓝色）
  this.rotatingCircle.fillStyle(0x4a90e2, 1);
  this.rotatingCircle.fillCircle(0, 0, 80);
  
  // 绘制一个小圆点标记（红色），用于观察旋转
  this.rotatingCircle.fillStyle(0xff0000, 1);
  this.rotatingCircle.fillCircle(60, 0, 10);
  
  // 绘制一条从圆心到边缘的线（白色），更清晰地显示旋转
  this.rotatingCircle.lineStyle(3, 0xffffff, 1);
  this.rotatingCircle.beginPath();
  this.rotatingCircle.moveTo(0, 0);
  this.rotatingCircle.lineTo(80, 0);
  this.rotatingCircle.strokePath();
  
  // 添加说明文字
  this.add.text(400, 50, '圆形以每秒 360° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 每秒 360 度 = 2π 弧度/秒
  // rotation 增量 = (2 * Math.PI) * (delta / 1000)
  const rotationSpeed = 2 * Math.PI; // 每秒 2π 弧度（360度）
  this.rotatingCircle.rotation += rotationSpeed * (delta / 1000);
}

new Phaser.Game(config);