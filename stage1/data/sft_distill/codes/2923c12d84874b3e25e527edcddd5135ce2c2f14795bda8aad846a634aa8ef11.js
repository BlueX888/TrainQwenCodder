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
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心在原点）
  // 菱形的四个顶点坐标
  const size = 80;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 将菱形移动到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象保存到场景数据中，以便在 update 中访问
  this.diamond = graphics;
  
  // 初始化旋转角度
  this.currentRotation = 0;
}

function update(time, delta) {
  // 每秒 120 度 = 120 * (Math.PI / 180) 弧度/秒 ≈ 2.094 弧度/秒
  const rotationSpeed = 120 * (Math.PI / 180); // 转换为弧度
  
  // 根据 delta 时间（毫秒）计算本帧应旋转的角度
  const deltaRotation = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  this.currentRotation += deltaRotation;
  
  // 应用旋转
  this.diamond.setRotation(this.currentRotation);
}

new Phaser.Game(config);