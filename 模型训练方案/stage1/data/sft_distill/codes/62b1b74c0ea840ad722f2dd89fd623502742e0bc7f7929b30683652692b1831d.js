const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff88, 1);
  
  // 绘制菱形（中心点为 50, 50，边长约 80）
  const centerX = 50;
  const centerY = 50;
  const size = 40;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);      // 上顶点
  graphics.lineTo(centerX + size, centerY);      // 右顶点
  graphics.lineTo(centerX, centerY + size);      // 下顶点
  graphics.lineTo(centerX - size, centerY);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  // 从原始大小(1) -> 48%(0.48) -> 原始大小(1)，总时长2秒
  this.tweens.add({
    targets: diamond,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 1000,        // 1秒缩小到48%
    yoyo: true,            // 自动反向播放（恢复到原始大小）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
}

new Phaser.Game(config);