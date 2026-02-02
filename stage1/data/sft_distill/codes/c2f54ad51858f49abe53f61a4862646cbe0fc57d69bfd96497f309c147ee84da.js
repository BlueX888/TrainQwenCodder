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
  
  // 绘制矩形（以左上角为原点）
  // 矩形尺寸：200x100，绘制时偏移使中心点为原点
  graphics.fillRect(-100, -50, 200, 100);
  
  // 将 Graphics 对象定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 Graphics 对象存储到 scene 数据中，便于在 update 中访问
  this.rotatingRect = graphics;
  
  // 初始化累计旋转角度（度数）
  this.currentRotation = 0;
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 每秒旋转 200 度，转换为每毫秒旋转的度数
  const rotationSpeed = 200; // 度/秒
  const deltaRotation = (rotationSpeed * delta) / 1000; // 度
  
  // 累加旋转角度
  this.currentRotation += deltaRotation;
  
  // 将角度转换为弧度并应用到矩形
  // Phaser 的旋转使用弧度制
  const rotationInRadians = Phaser.Math.DegToRad(this.currentRotation);
  this.rotatingRect.setRotation(rotationInRadians);
}

new Phaser.Game(config);