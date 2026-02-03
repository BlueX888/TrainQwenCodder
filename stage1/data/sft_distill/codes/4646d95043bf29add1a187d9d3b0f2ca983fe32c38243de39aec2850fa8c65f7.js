const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let ellipse;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  ellipse = this.add.graphics();
  
  // 设置椭圆位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 设置填充样式并绘制椭圆
  ellipse.fillStyle(0x00ff00, 1);
  // 椭圆中心在 (0, 0)，宽度 200，高度 100
  ellipse.fillEllipse(0, 0, 200, 100);
  
  // 添加一个标记点，用于观察旋转效果
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(100, 0, 10);
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是毫秒，转换为秒：delta / 1000
  // 每帧旋转角度 = (2 * Math.PI) * (delta / 1000)
  const rotationSpeed = (2 * Math.PI) / 1000; // 弧度/毫秒
  ellipse.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);