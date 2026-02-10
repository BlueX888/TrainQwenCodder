const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形的填充颜色
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制菱形（四个顶点）
  // 菱形中心在 (0, 0)，便于旋转
  const size = 100; // 菱形大小
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 将菱形定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 中，方便 update 访问
  this.diamond = graphics;
  
  // 添加文字说明
  this.add.text(10, 10, '菱形旋转速度: 80°/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，需要转换为秒
  // 80 度需要转换为弧度：80 * (Math.PI / 180)
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 更新菱形的旋转角度
  this.diamond.rotation += rotationIncrement;
}

new Phaser.Game(config);