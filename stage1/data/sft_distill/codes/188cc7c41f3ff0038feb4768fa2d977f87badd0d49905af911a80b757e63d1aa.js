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
  // 创建一个容器，用于控制旋转中心
  circle = this.add.container(400, 300);
  
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制圆形主体
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的线，用于观察旋转
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆边缘添加一个小圆点作为旋转标记
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(80, 0, 10);
  
  // 将 graphics 添加到容器中
  circle.add(graphics);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形以 240°/秒 的速度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 将每秒 240 度转换为弧度：240° = 240 * (Math.PI / 180) ≈ 4.189 弧度/秒
  // delta 是毫秒，所以需要除以 1000
  const rotationSpeed = Phaser.Math.DegToRad(240); // 每秒的弧度
  const rotationThisFrame = rotationSpeed * (delta / 1000); // 本帧的旋转量
  
  // 累加旋转角度
  circle.rotation += rotationThisFrame;
}

new Phaser.Game(config);