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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（中心在原点）
  const size = 80; // 菱形的半径
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 设置菱形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 保存引用以便在 update 中使用
  diamond = graphics;
}

function update(time, delta) {
  // 每秒旋转 120 度
  // 120 度 = 120 * (Math.PI / 180) 弧度 = 2.0944 弧度
  // delta 是毫秒，所以每毫秒旋转的弧度为：(120 * Math.PI / 180) / 1000
  const rotationSpeed = (120 * Math.PI / 180) / 1000; // 弧度/毫秒
  
  diamond.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);