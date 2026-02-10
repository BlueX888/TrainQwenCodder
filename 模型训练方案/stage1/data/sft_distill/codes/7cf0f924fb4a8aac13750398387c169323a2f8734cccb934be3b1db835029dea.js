const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色菱形
  
  // 绘制菱形（四个顶点）
  const centerX = 50;
  const centerY = 50;
  const size = 40;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size); // 上顶点
  graphics.lineTo(centerX + size, centerY); // 右顶点
  graphics.lineTo(centerX, centerY + size); // 下顶点
  graphics.lineTo(centerX - size, centerY); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建菱形精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  diamond.alpha = 0; // 初始设置为完全透明
  
  // 创建渐变动画：从透明(0)到不透明(1)，持续 1.5 秒，循环播放
  this.tweens.add({
    targets: diamond,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 1500, // 持续时间 1.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（从 0 到 1，再从 1 到 0）
    repeat: -1 // 无限循环
  });
}

new Phaser.Game(config);