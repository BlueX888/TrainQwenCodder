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
const ROTATION_SPEED = 80; // 每秒旋转 80 度

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制一个白色圆形
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, 50);
  
  // 绘制一条红色半径线，用于观察旋转效果
  graphics.lineStyle(3, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(50, 0);
  graphics.strokePath();
  
  // 在圆心添加一个小圆点作为参考
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(0, 0, 5);
  
  // 创建容器并将 graphics 添加进去
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加提示文本
  this.add.text(10, 10, '圆形以每秒 80 度的速度旋转', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 根据 delta 时间计算旋转增量
  // delta 单位是毫秒，需要转换为秒
  const rotationIncrement = ROTATION_SPEED * (delta / 1000);
  
  // 累加旋转角度（Phaser 使用度数）
  circleContainer.angle += rotationIncrement;
  
  // 可选：将角度限制在 0-360 范围内（防止数值过大）
  if (circleContainer.angle >= 360) {
    circleContainer.angle -= 360;
  }
}

new Phaser.Game(config);