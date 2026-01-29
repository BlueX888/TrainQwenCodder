const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circleContainer;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制圆形主体
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制圆形边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokeCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的线，用于观察旋转效果
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆心绘制一个小圆点作为参考
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, 5);
  
  // 将 Graphics 添加到 Container 中，以便控制旋转
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加提示文本
  const text = this.add.text(400, 50, '圆形以每秒 80° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 每秒旋转 80 度，转换为弧度
  const rotationSpeed = Phaser.Math.DegToRad(80);
  
  // 累加旋转角度
  circleContainer.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);