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

let circle;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建一个容器用于旋转
  circle = this.add.container(400, 300);
  
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制一个带有视觉标记的圆形（添加一条半径线以便观察旋转）
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 50);
  
  // 绘制一条从圆心到边缘的线，用于显示旋转效果
  graphics.lineStyle(3, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(50, 0);
  graphics.strokePath();
  
  // 将 graphics 添加到容器中
  circle.add(graphics);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形以每秒 80 度的速度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是以毫秒为单位的时间差
  // 80 度 = 80 * (Math.PI / 180) 弧度
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 累加旋转角度
  circle.rotation += rotationDelta;
}

new Phaser.Game(config);