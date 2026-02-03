const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  diamond = this.add.graphics();
  
  // 设置填充颜色
  diamond.fillStyle(0x00ffff, 1);
  
  // 绘制菱形（中心点在原点）
  diamond.beginPath();
  diamond.moveTo(0, -80);    // 上顶点
  diamond.lineTo(60, 0);     // 右顶点
  diamond.lineTo(0, 80);     // 下顶点
  diamond.lineTo(-60, 0);    // 左顶点
  diamond.closePath();
  diamond.fillPath();
  
  // 将菱形移动到画布中心
  diamond.x = 400;
  diamond.y = 300;
  
  // 初始旋转角度为 0
  diamond.rotation = 0;
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，需要转换为秒
  // 80 度转换为弧度：80 * (Math.PI / 180)
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  diamond.rotation += rotationSpeed * (delta / 1000);
}

new Phaser.Game(config);