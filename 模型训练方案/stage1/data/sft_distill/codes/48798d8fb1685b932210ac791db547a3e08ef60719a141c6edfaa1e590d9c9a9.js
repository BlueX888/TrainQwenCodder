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
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制矩形，以中心点为原点
  // 矩形宽 150，高 100，原点在中心 (-75, -50)
  graphics.fillRect(-75, -50, 150, 100);
  
  // 将 Graphics 对象定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 中以便在 update 中访问
  this.rotatingRect = graphics;
  
  // 初始化旋转速度（度/秒）
  this.rotationSpeed = 160;
}

function update(time, delta) {
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧应旋转的角度（度）
  const rotationDegrees = this.rotationSpeed * deltaInSeconds;
  
  // 将角度转换为弧度并累加到当前旋转值
  // Phaser 使用弧度制，1度 = Math.PI / 180 弧度
  this.rotatingRect.rotation += Phaser.Math.DegToRad(rotationDegrees);
}

new Phaser.Game(config);