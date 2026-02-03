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
  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个 100x100 的矩形，原点在中心
  // 需要将矩形绘制在 (-50, -50) 位置，使其中心在 (0, 0)
  graphics.fillRect(-50, -50, 100, 100);
  
  // 将 Graphics 对象定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 的 data 中，以便在 update 中访问
  this.rotatingRect = graphics;
}

function update(time, delta) {
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 每秒旋转 200 度，转换为弧度
  const rotationSpeed = Phaser.Math.DegToRad(200);
  
  // 更新旋转角度
  this.rotatingRect.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);