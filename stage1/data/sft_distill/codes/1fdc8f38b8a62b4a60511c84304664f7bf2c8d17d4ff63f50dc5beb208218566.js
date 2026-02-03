const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0x00ff00, 1);
  
  // 绘制矩形，中心点在 (0, 0)，这样旋转时会围绕中心旋转
  rectangle.fillRect(-100, -50, 200, 100);
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
}

function update(time, delta) {
  // 每秒 300 度 = 300 * Math.PI / 180 弧度/秒
  // delta 是毫秒，需要转换为秒：delta / 1000
  const rotationSpeed = (300 * Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  rectangle.rotation += rotationIncrement;
}

new Phaser.Game(config);