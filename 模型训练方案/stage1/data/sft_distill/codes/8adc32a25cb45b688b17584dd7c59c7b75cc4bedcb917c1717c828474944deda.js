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
  
  // 绘制一个圆形（蓝色填充）
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的红色线，用于观察旋转
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆的边缘添加一个小圆点作为额外的旋转标记
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(80, 0, 10);
  
  // 将 Graphics 添加到 Container 中以便控制旋转
  this.rotatingCircle = this.add.container(400, 300, [graphics]);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形以每秒 200° 的速度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 显示当前旋转角度的文字
  this.angleText = this.add.text(400, 550, '当前角度: 0°', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 每秒旋转 200 度
  const rotationSpeed = 200; // 度/秒
  
  // 将度转换为弧度（Phaser 使用弧度）
  const rotationSpeedRadians = Phaser.Math.DegToRad(rotationSpeed);
  
  // 根据 delta 时间（毫秒）计算本帧应该旋转的角度
  const rotationIncrement = rotationSpeedRadians * (delta / 1000);
  
  // 更新容器的旋转角度
  this.rotatingCircle.rotation += rotationIncrement;
  
  // 更新角度显示文字（转换回度数并取模 360）
  const currentDegrees = Phaser.Math.RadToDeg(this.rotatingCircle.rotation) % 360;
  this.angleText.setText(`当前角度: ${Math.floor(currentDegrees)}°`);
}

new Phaser.Game(config);