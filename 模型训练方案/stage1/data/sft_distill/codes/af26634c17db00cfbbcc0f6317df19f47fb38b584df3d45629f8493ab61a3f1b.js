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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色和边框
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制菱形（四个顶点）
  const size = 80;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 将 graphics 放入容器中，方便旋转
  diamond = this.add.container(400, 300);
  diamond.add(graphics);
  
  // 添加中心点标记（可选，便于观察旋转中心）
  const center = this.add.graphics();
  center.fillStyle(0xff0000, 1);
  center.fillCircle(0, 0, 5);
  diamond.add(center);
}

function update(time, delta) {
  // 每秒旋转 120 度
  // 120 度 = 120 * (Math.PI / 180) = 2.0944 弧度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = Phaser.Math.DegToRad(120); // 弧度/秒
  const deltaSeconds = delta / 1000; // 转换为秒
  
  // 累加旋转角度
  diamond.rotation += rotationSpeed * deltaSeconds;
}

new Phaser.Game(config);