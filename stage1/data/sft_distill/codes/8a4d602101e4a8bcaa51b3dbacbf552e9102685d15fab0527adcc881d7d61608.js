const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const centerX = 0;
  const centerY = 0;
  const radius = 80;
  const sides = 6;
  
  // 计算六边形的顶点
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 转换为纹理
  const textureKey = 'hexagon';
  graphics.generateTexture(textureKey, radius * 2 + 10, radius * 2 + 10);
  graphics.destroy(); // 销毁 Graphics 对象释放资源
  
  // 创建 Sprite 并设置位置
  const hexagon = this.add.sprite(400, 300, textureKey);
  hexagon.alpha = 0; // 初始透明
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 2000, // 持续时间 2 秒
    ease: 'Linear', // 线性渐变
    yoyo: true, // 往返播放（透明->不透明->透明）
    repeat: -1 // 无限循环
  });
  
  // 添加提示文字
  this.add.text(400, 500, 'Hexagon fading animation (2s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);