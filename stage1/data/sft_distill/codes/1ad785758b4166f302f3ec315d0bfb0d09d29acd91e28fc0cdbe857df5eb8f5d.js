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
const rotationSpeed = 160; // 每秒旋转 160 度

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  circle = this.add.graphics();
  
  // 设置圆形位置在屏幕中心
  circle.x = 400;
  circle.y = 300;
  
  // 绘制圆形主体
  circle.fillStyle(0x00aaff, 1);
  circle.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的线，用于观察旋转
  circle.lineStyle(4, 0xffffff, 1);
  circle.beginPath();
  circle.moveTo(0, 0);
  circle.lineTo(80, 0);
  circle.strokePath();
  
  // 在圆心绘制一个小点作为参考
  circle.fillStyle(0xffffff, 1);
  circle.fillCircle(0, 0, 5);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形旋转速度: 160°/秒', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧应旋转的角度（度）
  const rotationDegrees = rotationSpeed * deltaInSeconds;
  
  // 将角度转换为弧度并累加到当前旋转值
  circle.rotation += Phaser.Math.DegToRad(rotationDegrees);
}

new Phaser.Game(config);