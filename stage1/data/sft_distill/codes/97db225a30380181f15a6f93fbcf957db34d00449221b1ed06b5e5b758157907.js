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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制圆形主体
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心到边缘的线，用于观察旋转
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆边缘添加一个小圆点作为旋转标记
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(80, 0, 10);
  
  // 创建容器并将 Graphics 添加到容器中
  // 使用容器可以更方便地控制整体旋转
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加文字说明
  this.add.text(400, 50, '圆形以每秒 200° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的帧间隔时间
  // 将 delta 转换为秒：delta / 1000
  // 每秒旋转 200 度，转换为弧度：Phaser.Math.DegToRad(200)
  const rotationSpeed = Phaser.Math.DegToRad(200); // 每秒旋转的弧度
  const deltaInSeconds = delta / 1000;
  
  // 累加旋转角度
  circleContainer.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);