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

let circleContainer;
let currentRotation = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 50); // 在容器中心绘制半径为50的圆
  
  // 在圆形上添加一个标记，使旋转效果更明显
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(0, -40, 10); // 在圆的上方绘制红色小圆作为标记
  
  // 创建容器并添加 Graphics
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 初始化旋转角度
  currentRotation = 0;
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，所以需要转换：80 度/秒 = 80 * (delta/1000) 度/帧
  const rotationSpeed = 80; // 度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 本帧旋转的度数
  
  // 累加旋转角度
  currentRotation += rotationIncrement;
  
  // 将角度转换为弧度并应用到容器
  circleContainer.setAngle(currentRotation);
  
  // 可选：防止角度无限增长（虽然 Phaser 会自动处理）
  if (currentRotation >= 360) {
    currentRotation -= 360;
  }
}

new Phaser.Game(config);