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

let diamond;
let currentRotation = 0;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  diamond = this.add.graphics();
  
  // 设置填充颜色
  diamond.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点）
  // 菱形中心在 (0, 0)，这样旋转时围绕中心旋转
  diamond.beginPath();
  diamond.moveTo(0, -50);    // 上顶点
  diamond.lineTo(40, 0);     // 右顶点
  diamond.lineTo(0, 50);     // 下顶点
  diamond.lineTo(-40, 0);    // 左顶点
  diamond.closePath();
  diamond.fillPath();
  
  // 将菱形定位到屏幕中心
  diamond.x = config.width / 2;
  diamond.y = config.height / 2;
}

function update(time, delta) {
  // 每秒 360 度 = 2π 弧度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = (2 * Math.PI) / 1000; // 每毫秒的弧度数
  
  // 累加旋转角度
  currentRotation += rotationSpeed * delta;
  
  // 应用旋转
  diamond.setRotation(currentRotation);
}

new Phaser.Game(config);