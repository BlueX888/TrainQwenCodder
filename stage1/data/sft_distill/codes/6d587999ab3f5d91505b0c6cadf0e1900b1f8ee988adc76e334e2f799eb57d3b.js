const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制矩形，中心点在 (0, 0)
  // 矩形宽 150，高 100，左上角在 (-75, -50)
  graphics.fillRect(-75, -50, 150, 100);
  
  // 设置矩形位置到画布中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 数据中，以便在 update 中访问
  this.rotatingRect = graphics;
  
  // 每秒旋转 200 度，转换为弧度
  this.rotationSpeed = Phaser.Math.DegToRad(200);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度：当前角度 + 旋转速度 * 时间增量
  this.rotatingRect.rotation += this.rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);