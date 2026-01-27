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
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标（半径为 80）
  const radius = 80;
  const hexagonPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    hexagonPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPolygon(hexagonPoints);
  
  // 将六边形定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.32,      // 缩放到 32%
    scaleY: 0.32,      // 缩放到 32%
    duration: 1500,    // 单程持续 1.5 秒
    yoyo: true,        // 启用往返效果（缩小后再放大）
    loop: -1,          // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字提示
  this.add.text(400, 500, '六边形缩放动画（3秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);