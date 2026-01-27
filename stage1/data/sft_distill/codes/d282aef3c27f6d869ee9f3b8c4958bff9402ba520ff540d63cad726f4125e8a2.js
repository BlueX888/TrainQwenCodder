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
const ROTATION_SPEED = 80; // 每秒 80 度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制一个带有视觉参考的圆形（半径 80）
  // 填充主体
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的线，用于观察旋转
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆心添加一个小圆点作为参考
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(0, 0, 8);
  
  // 创建 Container 来承载 Graphics，方便旋转
  circle = this.add.container(400, 300);
  circle.add(graphics);
  
  // 添加文本提示
  this.add.text(10, 10, '圆形旋转速度: 80°/秒', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 将每秒的角速度转换为每毫秒的角速度，再转换为弧度
  const rotationIncrement = Phaser.Math.DegToRad(ROTATION_SPEED * delta / 1000);
  
  // 累加旋转角度
  circle.rotation += rotationIncrement;
}

new Phaser.Game(config);