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

let rotatingCircle;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制主圆形（蓝色）
  graphics.fillStyle(0x3498db, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一个标记点（红色小圆），用于观察旋转
  graphics.fillStyle(0xe74c3c, 1);
  graphics.fillCircle(60, 0, 15);
  
  // 绘制一条从圆心到边缘的线（白色），进一步增强旋转可见性
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 创建一个 Container 来承载 Graphics，便于旋转控制
  rotatingCircle = this.add.container(400, 300);
  rotatingCircle.add(graphics);
  
  // 添加说明文字
  const text = this.add.text(400, 50, '圆形以每秒 200° 旋转', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 计算本帧应该旋转的角度
  // delta 是毫秒，转换为秒后乘以每秒旋转度数
  const rotationSpeed = 200; // 每秒 200 度
  const deltaSeconds = delta / 1000; // 将毫秒转换为秒
  const rotationDegrees = rotationSpeed * deltaSeconds;
  
  // 将度数转换为弧度（Phaser 使用弧度）
  const rotationRadians = Phaser.Math.DegToRad(rotationDegrees);
  
  // 累加旋转角度
  rotatingCircle.rotation += rotationRadians;
}

new Phaser.Game(config);