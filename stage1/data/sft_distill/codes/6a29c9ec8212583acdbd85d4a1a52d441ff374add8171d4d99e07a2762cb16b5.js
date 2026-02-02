const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标
  const hexRadius = 60; // 六边形半径
  const centerX = 64; // 纹理中心 X
  const centerY = 64; // 纹理中心 Y
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 128, 128);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建六边形精灵并放置在屏幕中心
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 初始设置为完全透明
  hexagon.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度
    duration: 500, // 持续时间 0.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返播放（透明->不透明->透明）
    loop: -1 // 无限循环
  });
}

new Phaser.Game(config);