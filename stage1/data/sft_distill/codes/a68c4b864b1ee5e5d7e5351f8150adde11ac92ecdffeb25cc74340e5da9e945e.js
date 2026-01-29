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

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置填充颜色和透明度
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制圆形（中心点在原点，半径 50）
  graphics.fillCircle(0, 0, 50);
  
  // 绘制一个标记线，用于观察旋转效果
  graphics.lineStyle(3, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(50, 0);
  graphics.strokePath();
  
  // 创建容器并将 graphics 添加进去
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 初始旋转角度为 0
  circleContainer.rotation = 0;
}

function update(time, delta) {
  // 每秒 80 度 = 80 * (Math.PI / 180) 弧度/秒
  // delta 是毫秒，所以转换为秒：delta / 1000
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  circleContainer.rotation += rotationIncrement;
  
  // 可选：将角度限制在 0-2π 范围内（避免数值过大）
  if (circleContainer.rotation > Math.PI * 2) {
    circleContainer.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);