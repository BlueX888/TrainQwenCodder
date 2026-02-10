const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0xff6600, 1);
  
  // 绘制矩形，以中心点为原点（-50, -30 到 50, 30）
  rectangle.fillRect(-50, -30, 100, 60);
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
}

function update(time, delta) {
  // 每秒旋转 160 度
  // delta 是毫秒，需要转换为秒
  // 160 度转换为弧度：160 * (Math.PI / 180)
  const rotationSpeed = 160 * (Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 累加旋转角度
  rectangle.rotation += rotationIncrement;
}

new Phaser.Game(config);