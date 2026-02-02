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
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 50); // 在容器内相对坐标 (0,0) 绘制圆
  
  // 绘制一条半径线，用于可视化旋转效果
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.lineBetween(0, 0, 0, -50);
  
  // 创建容器并将 graphics 添加进去
  this.circleContainer = this.add.container(400, 300);
  this.circleContainer.add(graphics);
  
  // 初始化旋转角度（弧度制）
  this.circleContainer.rotation = 0;
}

function update(time, delta) {
  // 每秒旋转 80 度
  // 将角度转换为弧度：80 度 = 80 * (Math.PI / 180) 弧度
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  
  // 根据 delta 时间（毫秒）计算本帧应旋转的角度
  const rotationThisFrame = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  this.circleContainer.rotation += rotationThisFrame;
}

new Phaser.Game(config);