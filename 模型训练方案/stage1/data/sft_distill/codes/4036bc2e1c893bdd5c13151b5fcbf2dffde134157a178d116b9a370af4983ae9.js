const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let currentRotation = 0; // 当前旋转角度（弧度）

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制星形
  star = this.add.graphics();
  
  // 设置填充样式为黄色
  star.fillStyle(0xffff00, 1);
  
  // 在画布中心绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius)
  star.fillStar(400, 300, 5, 30, 60);
  
  // 设置旋转中心点为星形中心
  star.x = 0;
  star.y = 0;
}

function update(time, delta) {
  // 每秒旋转 120 度
  // delta 是毫秒，转换为秒：delta / 1000
  // 120 度转换为弧度：120 * (Math.PI / 180) = 2.094 弧度
  const rotationSpeed = (120 * Math.PI / 180); // 每秒旋转的弧度
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧应旋转的弧度
  
  // 累加旋转角度
  currentRotation += rotationDelta;
  
  // 应用旋转到星形
  star.rotation = currentRotation;
}

new Phaser.Game(config);