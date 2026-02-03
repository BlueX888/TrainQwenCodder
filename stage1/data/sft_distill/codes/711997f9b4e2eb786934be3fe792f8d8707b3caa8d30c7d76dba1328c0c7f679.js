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
  // 使用 Graphics 绘制一个圆形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制一个半径为 50 的圆，圆心在 (60, 60)
  graphics.fillCircle(60, 60, 50);
  
  // 添加一个标记线，方便观察旋转效果
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.lineBetween(60, 60, 110, 60);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('circleTexture', 120, 120);
  
  // 销毁 Graphics 对象，因为已经生成了纹理
  graphics.destroy();
  
  // 创建一个 Image 对象使用生成的纹理
  this.circle = this.add.image(400, 300, 'circleTexture');
  
  // 添加提示文本
  const text = this.add.text(400, 500, '圆形以每秒 360° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // delta 是以毫秒为单位的帧间隔时间
  // 每秒 360 度 = 每毫秒 0.36 度
  // 旋转速度：360 度/秒 = 360 * (delta / 1000) 度/帧
  const rotationSpeed = 360 * (delta / 1000);
  
  // 增加角度
  this.circle.angle += rotationSpeed;
  
  // 可选：将角度限制在 0-360 范围内（避免数值过大）
  if (this.circle.angle >= 360) {
    this.circle.angle -= 360;
  }
}

new Phaser.Game(config);