const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;
let currentRotation = 0;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  rectangle = this.add.graphics();
  rectangle.fillStyle(0x00ff00, 1);
  
  // 以中心点为原点绘制矩形（便于旋转）
  rectangle.fillRect(-75, -50, 150, 100);
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 初始化旋转角度
  currentRotation = 0;
}

function update(time, delta) {
  // 计算旋转增量：300度/秒 * (delta毫秒 / 1000)
  // 转换为弧度：度数 * Math.PI / 180
  const rotationSpeed = 300; // 度/秒
  const rotationDelta = (rotationSpeed * delta / 1000) * (Math.PI / 180);
  
  // 累加旋转角度
  currentRotation += rotationDelta;
  
  // 应用旋转
  rectangle.setRotation(currentRotation);
}

new Phaser.Game(config);