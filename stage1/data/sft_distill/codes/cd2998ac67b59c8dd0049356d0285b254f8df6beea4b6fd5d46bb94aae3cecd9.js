const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制方块
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个 100x100 的方块，中心点在 (0, 0)
  // 这样旋转时会围绕中心旋转
  graphics.fillRect(-50, -50, 100, 100);
  
  // 将方块放置在画布中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 将 graphics 对象存储到 scene 中，方便 update 访问
  this.rotatingSquare = graphics;
  
  // 添加文字说明
  this.add.text(10, 10, '方块旋转速度: 300度/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是以毫秒为单位的帧间隔时间
  // 将每秒 300 度转换为每毫秒的弧度增量
  // 300 度 = 300 * (Math.PI / 180) 弧度
  // 每毫秒旋转角度 = (300 * Math.PI / 180) / 1000 * delta
  
  const rotationSpeed = 300; // 度/秒
  const radiansPerSecond = Phaser.Math.DegToRad(rotationSpeed);
  const radiansThisFrame = radiansPerSecond * (delta / 1000);
  
  // 更新方块的旋转角度
  this.rotatingSquare.rotation += radiansThisFrame;
}

new Phaser.Game(config);