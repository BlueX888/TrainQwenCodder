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
const rotationSpeed = 80; // 每秒旋转 80 度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制圆形主体
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 50);
  
  // 绘制一条从圆心到边缘的线，用于观察旋转效果
  graphics.lineStyle(3, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(50, 0);
  graphics.strokePath();
  
  // 创建容器并将 Graphics 添加到容器中
  circle = this.add.container(400, 300);
  circle.add(graphics);
  
  // 添加文字提示
  this.add.text(10, 10, '圆形以每秒 80 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 将度数转换为弧度：度数 * (Math.PI / 180)
  // 旋转角度 = 速度 * 时间 / 1000（将毫秒转换为秒）
  const rotationIncrement = Phaser.Math.DegToRad(rotationSpeed) * (delta / 1000);
  
  // 累加旋转角度
  circle.rotation += rotationIncrement;
}

new Phaser.Game(config);